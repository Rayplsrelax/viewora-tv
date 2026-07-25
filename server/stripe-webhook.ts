import Stripe from "stripe";
import { ENV } from "./_core/env";
import { createCustomer, getCustomerByStripeSubscriptionId, getCustomerByEmail, updateCustomer, createProvisioningLog } from "./db";
import { createXtreamAccount, renewXtreamAccount } from "./xtream";
import { sendCredentialsEmail, sendRenewalEmail } from "./email";
import {
  createFollowUpTask, createHermesEvent, getTrialLeadByEmail, updateTrialLead,
  getAffiliateByCode, createReferral, updateReferral, getReferralByCustomerId,
  getReferralsByAffiliate, runReferralValidation
} from "./hermes-db";
import { HERMES_TEMPLATES } from "./hermes-templates";
import type { Request, Response } from "express";

let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    if (!ENV.stripeSecretKey) throw new Error("STRIPE_SECRET_KEY is not configured");
    _stripe = new Stripe(ENV.stripeSecretKey);
  }
  return _stripe;
}

// Map price intervals to Xtream subscription months
function getSubMonths(interval: string, intervalCount: number): number {
  if (interval === "year") return 12;
  if (interval === "month") return intervalCount;
  return 1;
}

function getPlanName(months: number, devices: number): string {
  return `${months}-Month / ${devices} Device${devices > 1 ? "s" : ""}`;
}

/**
 * Handle new checkout session completed — provision new account(s).
 * Multi-device plans provision multiple Xtream accounts.
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerEmail = session.customer_details?.email || session.customer_email || "";
  const customerName = session.customer_details?.name || "";
  const subscriptionId = session.subscription as string;
  const stripeCustomerId = session.customer as string;

  if (!customerEmail || !subscriptionId) {
    console.error("[Webhook] Missing email or subscription ID in checkout session");
    return;
  }

  // Get subscription details to determine plan length
  const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0]?.price?.id || "";
  const interval = subscription.items.data[0]?.price?.recurring?.interval || "month";
  const intervalCount = subscription.items.data[0]?.price?.recurring?.interval_count || 1;
  const subMonths = getSubMonths(interval, intervalCount);

  // Get device count from session metadata (defaults to 1)
  const devices = parseInt(session.metadata?.devices || "1", 10);
  const planName = getPlanName(subMonths, devices);

  // Check if customer already exists (avoid duplicates)
  const existing = await getCustomerByStripeSubscriptionId(subscriptionId);
  if (existing && existing.xtreamUsername) {
    console.log(`[Webhook] Customer already provisioned for subscription ${subscriptionId}`);
    return;
  }

  // Provision Xtream Code account(s) — one per device connection
  const credentials: Array<{ username: string; password: string; url: string }> = [];

  for (let i = 0; i < devices; i++) {
    try {
      const result = await createXtreamAccount({
        sub: subMonths,
        notes: `${customerEmail} (device ${i + 1}/${devices})`,
        country: "US",
      });
      credentials.push({
        username: result.username,
        password: result.password,
        url: result.url,
      });

      await createProvisioningLog({
        customerId: null,
        eventType: "checkout.session.completed",
        stripeEventId: session.id,
        action: "new",
        requestPayload: JSON.stringify({ sub: subMonths, email: customerEmail, device: i + 1 }),
        responsePayload: JSON.stringify(result.rawResponse),
        success: 1,
      });
    } catch (error: any) {
      await createProvisioningLog({
        customerId: null,
        eventType: "checkout.session.completed",
        stripeEventId: session.id,
        action: "new",
        requestPayload: JSON.stringify({ sub: subMonths, email: customerEmail, device: i + 1 }),
        responsePayload: null,
        success: 0,
        errorMessage: error.message,
      });
      console.error(`[Webhook] Failed to provision Xtream account (device ${i + 1}):`, error.message);
    }
  }

  if (credentials.length === 0) {
    console.error("[Webhook] All provisioning attempts failed, aborting");
    return;
  }

  // Calculate expiry
  const now = Date.now();
  const expiryMs = now + subMonths * 30 * 24 * 60 * 60 * 1000;

  // Store primary credentials (first account) in customer record
  // Secondary credentials stored in notes as JSON for multi-device
  const primaryCreds = credentials[0];
  const secondaryCreds = credentials.slice(1);
  const allCredsJson = secondaryCreds.length > 0 ? JSON.stringify(secondaryCreds) : null;

  const customerId = await createCustomer({
    email: customerEmail,
    name: customerName || null,
    stripeCustomerId,
    stripeSubscriptionId: subscriptionId,
    stripePriceId: priceId,
    planName,
    xtreamUsername: primaryCreds.username,
    xtreamPassword: primaryCreds.password,
    xtreamUrl: primaryCreds.url,
    status: "active",
    subscriptionStart: now,
    subscriptionEnd: expiryMs,
    country: "US",
    notes: allCredsJson,
  });

  // Store credentials in Stripe metadata for easy reference
  await getStripe().subscriptions.update(subscriptionId, {
    metadata: {
      xtream_username: primaryCreds.username,
      xtream_password: primaryCreds.password,
      devices: String(devices),
      viewora_customer_id: String(customerId),
    },
  });

  // Send credentials email (includes all device credentials)
  try {
    await sendCredentialsEmail({
      to: customerEmail,
      customerName: customerName || undefined,
      username: primaryCreds.username,
      password: primaryCreds.password,
      m3uUrl: primaryCreds.url,
      planName,
      expiryDate: new Date(expiryMs).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      additionalCredentials: secondaryCreds.length > 0 ? secondaryCreds : undefined,
    });

    await createProvisioningLog({
      customerId,
      eventType: "checkout.session.completed",
      stripeEventId: session.id,
      action: "email_sent",
      requestPayload: JSON.stringify({ to: customerEmail, devices }),
      responsePayload: null,
      success: 1,
    });
  } catch (error: any) {
    await createProvisioningLog({
      customerId,
      eventType: "checkout.session.completed",
      stripeEventId: session.id,
      action: "email_sent",
      requestPayload: JSON.stringify({ to: customerEmail }),
      responsePayload: null,
      success: 0,
      errorMessage: error.message,
    });
    console.error("[Webhook] Failed to send email:", error.message);
  }

  console.log(`[Webhook] Successfully provisioned ${credentials.length} account(s) for ${customerEmail}`);

  // === TRIAL-TO-PAID CONVERSION TRACKING ===
  try {
    const trialLead = await getTrialLeadByEmail(customerEmail);
    if (trialLead && ["activated", "credentials_sent", "approved"].includes(trialLead.status)) {
      await updateTrialLead(trialLead.id, {
        status: "converted",
        convertedCustomerId: customerId,
        convertedSubscriptionId: subscriptionId,
      });
      await createHermesEvent({
        eventType: "trial.converted",
        source: "stripe",
        payloadJson: JSON.stringify({
          trialLeadId: trialLead.id,
          customerId,
          email: customerEmail,
          subscriptionId,
        }),
      });
      console.log(`[Webhook] Trial lead ${trialLead.id} converted to paid customer ${customerId}`);
    }
  } catch (e: any) {
    console.error("[Webhook] Trial conversion tracking error:", e.message);
  }

  // === STRIPE CHECKOUT REFERRAL CONVERSION ===
  try {
    const referralCode = session.metadata?.referral_code;
    if (referralCode) {
      const affiliate = await getAffiliateByCode(referralCode);
      if (affiliate && affiliate.status === "active") {
        // Check if a referral already exists for this customer
        const existingRef = await getReferralByCustomerId(customerId);
        if (!existingRef) {
          // Create new referral record linked to this purchase
          await createReferral({
            affiliateId: affiliate.id,
            referralCode,
            customerId,
            stripeCustomerId,
            subscriptionId,
            firstPaymentAmount: subscription.items.data[0]?.price?.unit_amount || null,
            status: "purchased",
          });
        } else {
          // Update existing referral (may have been created at click/trial stage)
          await updateReferral(existingRef.id, {
            customerId,
            stripeCustomerId,
            subscriptionId,
            firstPaymentAmount: subscription.items.data[0]?.price?.unit_amount || null,
            status: "purchased",
          });
        }
        await createHermesEvent({
          eventType: "referral.converted",
          source: "stripe",
          payloadJson: JSON.stringify({
            affiliateId: affiliate.id,
            referralCode,
            customerId,
            email: customerEmail,
            subscriptionId,
          }),
        });
        console.log(`[Webhook] Referral conversion recorded for affiliate ${affiliate.id}, code: ${referralCode}`);
      }
    }
  } catch (e: any) {
    console.error("[Webhook] Referral conversion error:", e.message);
  }

  // === RUN 14-DAY REFERRAL VALIDATION (opportunistic) ===
  try {
    const validated = await runReferralValidation();
    if (validated > 0) {
      console.log(`[Webhook] Validated ${validated} referral(s) that passed 14-day threshold`);
    }
  } catch (e: any) {
    console.error("[Webhook] Referral validation error:", e.message);
  }
}

/**
 * Handle invoice.paid — renew existing account(s).
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string;
  if (!subscriptionId) return;

  // Skip the first invoice (handled by checkout.session.completed)
  if (invoice.billing_reason === "subscription_create") return;

  // Find existing customer
  const customer = await getCustomerByStripeSubscriptionId(subscriptionId);
  if (!customer || !customer.xtreamUsername || !customer.xtreamPassword) {
    console.log(`[Webhook] No existing customer found for subscription ${subscriptionId}, skipping renewal`);
    return;
  }

  // Determine renewal length from subscription
  const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
  const interval = subscription.items.data[0]?.price?.recurring?.interval || "month";
  const intervalCount = subscription.items.data[0]?.price?.recurring?.interval_count || 1;
  const subMonths = getSubMonths(interval, intervalCount);

  // Renew primary account
  try {
    const result = await renewXtreamAccount({
      username: customer.xtreamUsername,
      password: customer.xtreamPassword,
      sub: subMonths,
    });

    if (!result.success) {
      throw new Error(`Renewal failed: ${JSON.stringify(result.rawResponse)}`);
    }

    await createProvisioningLog({
      customerId: customer.id,
      eventType: "invoice.paid",
      stripeEventId: invoice.id,
      action: "renew",
      requestPayload: JSON.stringify({ username: customer.xtreamUsername, sub: subMonths }),
      responsePayload: JSON.stringify(result.rawResponse),
      success: 1,
    });
  } catch (error: any) {
    await createProvisioningLog({
      customerId: customer.id,
      eventType: "invoice.paid",
      stripeEventId: invoice.id,
      action: "renew",
      requestPayload: JSON.stringify({ username: customer.xtreamUsername, sub: subMonths }),
      responsePayload: null,
      success: 0,
      errorMessage: error.message,
    });
    console.error("[Webhook] Failed to renew Xtream account:", error.message);
    return;
  }

  // Renew additional device accounts if multi-device plan
  // Notes stores only secondary credentials (not the primary, which was already renewed above)
  if (customer.notes) {
    try {
      const secondaryCreds = JSON.parse(customer.notes) as Array<{ username: string; password: string }>;
      for (const cred of secondaryCreds) {
        await renewXtreamAccount({ username: cred.username, password: cred.password, sub: subMonths });
      }
    } catch {
      // notes might not be JSON credentials, skip
    }
  }

  // Update expiry in database
  const newExpiryMs = Date.now() + subMonths * 30 * 24 * 60 * 60 * 1000;
  await updateCustomer(customer.id, {
    subscriptionEnd: newExpiryMs,
    status: "active",
  });

  // Send renewal confirmation email
  try {
    await sendRenewalEmail({
      to: customer.email,
      customerName: customer.name || undefined,
      username: customer.xtreamUsername,
      password: customer.xtreamPassword,
      planName: customer.planName || "Subscription",
      newExpiryDate: new Date(newExpiryMs).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    });

    await createProvisioningLog({
      customerId: customer.id,
      eventType: "invoice.paid",
      stripeEventId: invoice.id,
      action: "email_sent",
      requestPayload: JSON.stringify({ to: customer.email }),
      responsePayload: null,
      success: 1,
    });
  } catch (error: any) {
    console.error("[Webhook] Failed to send renewal email:", error.message);
  }

  console.log(`[Webhook] Successfully renewed ${customer.xtreamUsername} for ${customer.email}`);
}

/**
 * Handle invoice.payment_failed — mark customer as past_due.
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string;
  if (!subscriptionId) return;

  const customer = await getCustomerByStripeSubscriptionId(subscriptionId);
  if (!customer) {
    console.log(`[Webhook] No customer found for failed invoice subscription ${subscriptionId}`);
    return;
  }

  await updateCustomer(customer.id, { status: "expired" });

  await createProvisioningLog({
    customerId: customer.id,
    eventType: "invoice.payment_failed",
    stripeEventId: invoice.id,
    action: "status_update",
    requestPayload: JSON.stringify({ subscriptionId, status: "past_due" }),
    responsePayload: null,
    success: 1,
  });

  console.log(`[Webhook] Marked customer ${customer.email} as past_due due to payment failure`);

  // Create Hermes follow-up task for payment failure
  try {
    // Determine preferred channel from trial lead record (fallback to telegram)
    const trialLead = await getTrialLeadByEmail(customer.email);
    const preferredChannel = trialLead?.preferredSupportChannel || "telegram";

    await createFollowUpTask({
      taskType: "payment_failed",
      relatedCustomerId: customer.id,
      relatedSubscriptionId: subscriptionId,
      dueAt: Date.now(),
      priority: "urgent",
      channel: preferredChannel,
      status: "queued",
      messageTemplateKey: "payment_failed",
      messageBody: HERMES_TEMPLATES.payment_failed.body,
    });
    await createHermesEvent({
      eventType: "payment.failed",
      source: "stripe",
      payloadJson: JSON.stringify({ customerId: customer.id, email: customer.email, subscriptionId, channel: preferredChannel }),
    });
  } catch (e: any) {
    console.error("[Webhook] Failed to create Hermes payment_failed task:", e.message);
  }
}

/**
 * Handle customer.subscription.updated — sync status changes.
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id;
  const customer = await getCustomerByStripeSubscriptionId(subscriptionId);
  if (!customer) {
    console.log(`[Webhook] No customer found for subscription update ${subscriptionId}`);
    return;
  }

  // Map Stripe status to our status
  let newStatus: "active" | "cancelled" | "expired" | "pending" = "active";
  if (subscription.status === "canceled" || subscription.status === "unpaid") {
    newStatus = "cancelled";
  } else if (subscription.status === "past_due" || subscription.status === "incomplete_expired") {
    newStatus = "expired";
  } else if (subscription.status === "incomplete" || subscription.status === "trialing") {
    newStatus = "pending";
  }

  await updateCustomer(customer.id, { status: newStatus });

  await createProvisioningLog({
    customerId: customer.id,
    eventType: "customer.subscription.updated",
    stripeEventId: subscription.id,
    action: "status_update",
    requestPayload: JSON.stringify({ stripeStatus: subscription.status, mappedStatus: newStatus }),
    responsePayload: null,
    success: 1,
  });

  console.log(`[Webhook] Updated customer ${customer.email} status to ${newStatus}`);
}

/**
 * Handle customer.subscription.deleted — cancel access.
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id;
  const customer = await getCustomerByStripeSubscriptionId(subscriptionId);
  if (!customer) {
    console.log(`[Webhook] No customer found for deleted subscription ${subscriptionId}`);
    return;
  }

  await updateCustomer(customer.id, { status: "cancelled" });

  await createProvisioningLog({
    customerId: customer.id,
    eventType: "customer.subscription.deleted",
    stripeEventId: subscription.id,
    action: "status_update",
    requestPayload: JSON.stringify({ subscriptionId, canceledAt: subscription.canceled_at }),
    responsePayload: null,
    success: 1,
  });

  console.log(`[Webhook] Cancelled subscription for ${customer.email}`);

  // Create Hermes winback follow-up tasks
  try {
    const now = Date.now();
    // Determine preferred channel from trial lead record (fallback to telegram)
    const trialLead = await getTrialLeadByEmail(customer.email);
    const preferredChannel = trialLead?.preferredSupportChannel || "telegram";

    // 1. Cancellation reason ask (immediate)
    await createFollowUpTask({
      taskType: "cancellation_reason",
      relatedCustomerId: customer.id,
      relatedSubscriptionId: subscriptionId,
      dueAt: now,
      priority: "high",
      channel: preferredChannel,
      status: "queued",
      messageTemplateKey: "cancellation_reason_ask",
      messageBody: HERMES_TEMPLATES.cancellation_reason_ask.body,
    });
    // 2. Winback 7 day
    await createFollowUpTask({
      taskType: "winback",
      relatedCustomerId: customer.id,
      relatedSubscriptionId: subscriptionId,
      dueAt: now + 7 * 24 * 60 * 60 * 1000,
      priority: "normal",
      channel: preferredChannel,
      status: "queued",
      messageTemplateKey: "winback_7day",
      messageBody: HERMES_TEMPLATES.winback_7day.body,
    });
    // 3. Winback 21 day
    await createFollowUpTask({
      taskType: "winback",
      relatedCustomerId: customer.id,
      relatedSubscriptionId: subscriptionId,
      dueAt: now + 21 * 24 * 60 * 60 * 1000,
      priority: "low",
      channel: preferredChannel,
      status: "queued",
      messageTemplateKey: "winback_21day",
      messageBody: HERMES_TEMPLATES.winback_21day.body,
    });
    await createHermesEvent({
      eventType: "subscription.cancelled",
      source: "stripe",
      payloadJson: JSON.stringify({ customerId: customer.id, email: customer.email, subscriptionId, channel: preferredChannel }),
    });
  } catch (e: any) {
    console.error("[Webhook] Failed to create Hermes winback tasks:", e.message);
  }
}

/**
 * Express route handler for Stripe webhooks.
 * Must be registered with raw body parsing (not JSON).
 */
export function stripeWebhookHandler(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"] as string;

  if (!sig) {
    res.status(400).json({ error: "Missing stripe-signature header" });
    return;
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      (req as any).rawBody || req.body,
      sig,
      ENV.stripeWebhookSecret
    );
  } catch (err: any) {
    console.error("[Webhook] Signature verification failed:", err.message);
    res.status(400).json({ error: `Webhook Error: ${err.message}` });
    return;
  }

  // Handle test events from Stripe Dashboard
  if (event.id && event.id.startsWith('evt_test_')) {
    console.log("[Webhook] Test event detected, returning verification response");
    return res.json({ verified: true });
  }

  // Acknowledge immediately, process async
  res.status(200).json({ received: true });

  // Process event asynchronously
  (async () => {
    try {
      switch (event.type) {
        case "checkout.session.completed":
          await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
          break;
        case "invoice.paid":
          await handleInvoicePaid(event.data.object as Stripe.Invoice);
          break;
        case "invoice.payment_failed":
          await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;
        case "customer.subscription.updated":
          await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;
        case "customer.subscription.deleted":
          await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;
        default:
          console.log(`[Webhook] Unhandled event type: ${event.type}`);
      }
    } catch (error: any) {
      console.error(`[Webhook] Error processing ${event.type}:`, error.message);
    }
  })();
}
