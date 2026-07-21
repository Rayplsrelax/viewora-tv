import Stripe from "stripe";
import { ENV } from "./_core/env";
import { createCustomer, getCustomerByStripeSubscriptionId, updateCustomer, createProvisioningLog } from "./db";
import { createXtreamAccount, renewXtreamAccount } from "./xtream";
import { sendCredentialsEmail, sendRenewalEmail } from "./email";
import type { Request, Response } from "express";

const stripe = new Stripe(ENV.stripeSecretKey);

// Map price intervals to Xtream subscription months
function getSubMonths(interval: string, intervalCount: number): number {
  if (interval === "year") return 12;
  if (interval === "month") return intervalCount;
  return 1;
}

function getPlanName(months: number): string {
  if (months === 1) return "1-Month Plan";
  if (months === 3) return "3-Month Plan";
  if (months === 6) return "6-Month Plan";
  if (months === 12) return "12-Month Plan";
  return `${months}-Month Plan`;
}

/**
 * Handle new checkout session completed — provision new account.
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
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0]?.price?.id || "";
  const interval = subscription.items.data[0]?.price?.recurring?.interval || "month";
  const intervalCount = subscription.items.data[0]?.price?.recurring?.interval_count || 1;
  const subMonths = getSubMonths(interval, intervalCount);
  const planName = getPlanName(subMonths);

  // Check if customer already exists (avoid duplicates)
  const existing = await getCustomerByStripeSubscriptionId(subscriptionId);
  if (existing && existing.xtreamUsername) {
    console.log(`[Webhook] Customer already provisioned for subscription ${subscriptionId}`);
    return;
  }

  // Provision Xtream Code account
  let xtreamUsername = "";
  let xtreamPassword = "";
  let xtreamUrl = "";

  try {
    const result = await createXtreamAccount({
      sub: subMonths,
      notes: customerEmail,
      country: "dk",
    });
    xtreamUsername = result.username;
    xtreamPassword = result.password;
    xtreamUrl = result.url;

    await createProvisioningLog({
      customerId: null,
      eventType: "checkout.session.completed",
      stripeEventId: session.id,
      action: "new",
      requestPayload: JSON.stringify({ sub: subMonths, email: customerEmail }),
      responsePayload: JSON.stringify(result.rawResponse),
      success: 1,
    });
  } catch (error: any) {
    await createProvisioningLog({
      customerId: null,
      eventType: "checkout.session.completed",
      stripeEventId: session.id,
      action: "new",
      requestPayload: JSON.stringify({ sub: subMonths, email: customerEmail }),
      responsePayload: null,
      success: 0,
      errorMessage: error.message,
    });
    console.error("[Webhook] Failed to provision Xtream account:", error.message);
    return;
  }

  // Calculate expiry
  const now = Date.now();
  const expiryMs = now + subMonths * 30 * 24 * 60 * 60 * 1000;

  // Save customer to database
  const customerId = await createCustomer({
    email: customerEmail,
    name: customerName || null,
    stripeCustomerId,
    stripeSubscriptionId: subscriptionId,
    stripePriceId: priceId,
    planName,
    xtreamUsername,
    xtreamPassword,
    xtreamUrl,
    status: "active",
    subscriptionStart: now,
    subscriptionEnd: expiryMs,
    country: "dk",
    notes: null,
  });

  // Store credentials in Stripe metadata for easy reference
  await stripe.subscriptions.update(subscriptionId, {
    metadata: {
      xtream_username: xtreamUsername,
      xtream_password: xtreamPassword,
      viewora_customer_id: String(customerId),
    },
  });

  // Send credentials email
  try {
    await sendCredentialsEmail({
      to: customerEmail,
      customerName: customerName || undefined,
      username: xtreamUsername,
      password: xtreamPassword,
      m3uUrl: xtreamUrl,
      planName,
      expiryDate: new Date(expiryMs).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    });

    await createProvisioningLog({
      customerId,
      eventType: "checkout.session.completed",
      stripeEventId: session.id,
      action: "email_sent",
      requestPayload: JSON.stringify({ to: customerEmail }),
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

  console.log(`[Webhook] Successfully provisioned ${xtreamUsername} for ${customerEmail}`);
}

/**
 * Handle invoice.paid — renew existing account.
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
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const interval = subscription.items.data[0]?.price?.recurring?.interval || "month";
  const intervalCount = subscription.items.data[0]?.price?.recurring?.interval_count || 1;
  const subMonths = getSubMonths(interval, intervalCount);

  // Renew Xtream Code account
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
    event = stripe.webhooks.constructEvent(
      (req as any).rawBody || req.body,
      sig,
      ENV.stripeWebhookSecret
    );
  } catch (err: any) {
    console.error("[Webhook] Signature verification failed:", err.message);
    res.status(400).json({ error: `Webhook Error: ${err.message}` });
    return;
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
        default:
          console.log(`[Webhook] Unhandled event type: ${event.type}`);
      }
    } catch (error: any) {
      console.error(`[Webhook] Error processing ${event.type}:`, error.message);
    }
  })();
}
