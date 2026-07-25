/**
 * End-to-End Flow Verification Test
 * 
 * Validates the 5 critical flows:
 * 1. Live checkout creates subscription (mode: "subscription")
 * 2. Webhook receives checkout.session.completed and routes correctly
 * 3. Customer gets credentials (Xtream provisioned + email sent)
 * 4. Trial lead converts (status updated to "converted")
 * 5. Referral records convert (referral created with status "purchased")
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ==================== Mocks ====================
const mocks = vi.hoisted(() => ({
  constructEvent: vi.fn(),
  subscriptionsRetrieve: vi.fn(),
  subscriptionsUpdate: vi.fn(),
  sessionsCreate: vi.fn(),
  createCustomer: vi.fn(),
  getCustomerByStripeSubscriptionId: vi.fn(),
  getCustomerByEmail: vi.fn(),
  updateCustomer: vi.fn(),
  createProvisioningLog: vi.fn(),
  createXtreamAccount: vi.fn(),
  renewXtreamAccount: vi.fn(),
  sendCredentialsEmail: vi.fn(),
  sendRenewalEmail: vi.fn(),
  // Hermes
  createFollowUpTask: vi.fn(),
  createHermesEvent: vi.fn(),
  getTrialLeadByEmail: vi.fn(),
  updateTrialLead: vi.fn(),
  getAffiliateByCode: vi.fn(),
  createReferral: vi.fn(),
  updateReferral: vi.fn(),
  getReferralByCustomerId: vi.fn(),
  getReferralsByAffiliate: vi.fn(),
  runReferralValidation: vi.fn(),
}));

vi.mock("stripe", () => ({
  default: class MockStripe {
    webhooks = { constructEvent: mocks.constructEvent };
    subscriptions = {
      retrieve: mocks.subscriptionsRetrieve,
      update: mocks.subscriptionsUpdate,
    };
    checkout = { sessions: { create: mocks.sessionsCreate } };
  },
}));

vi.mock("./db", () => ({
  createCustomer: mocks.createCustomer,
  getCustomerByStripeSubscriptionId: mocks.getCustomerByStripeSubscriptionId,
  getCustomerByEmail: mocks.getCustomerByEmail,
  updateCustomer: mocks.updateCustomer,
  createProvisioningLog: mocks.createProvisioningLog,
}));

vi.mock("./xtream", () => ({
  createXtreamAccount: mocks.createXtreamAccount,
  renewXtreamAccount: mocks.renewXtreamAccount,
}));

vi.mock("./email", () => ({
  sendCredentialsEmail: mocks.sendCredentialsEmail,
  sendRenewalEmail: mocks.sendRenewalEmail,
}));

vi.mock("./hermes-db", () => ({
  createFollowUpTask: mocks.createFollowUpTask,
  createHermesEvent: mocks.createHermesEvent,
  getTrialLeadByEmail: mocks.getTrialLeadByEmail,
  updateTrialLead: mocks.updateTrialLead,
  getAffiliateByCode: mocks.getAffiliateByCode,
  createReferral: mocks.createReferral,
  updateReferral: mocks.updateReferral,
  getReferralByCustomerId: mocks.getReferralByCustomerId,
  getReferralsByAffiliate: mocks.getReferralsByAffiliate,
  runReferralValidation: mocks.runReferralValidation,
}));

vi.mock("./hermes-templates", () => ({
  HERMES_TEMPLATES: {
    payment_failed: { key: "payment_failed", body: "test" },
    cancellation_reason_ask: { key: "cancellation_reason_ask", body: "test" },
    winback_7day: { key: "winback_7day", body: "test" },
    winback_21day: { key: "winback_21day", body: "test" },
    affiliate_credit_earned: { key: "affiliate_credit_earned", body: "test" },
    affiliate_free_month: { key: "affiliate_free_month", body: "test" },
  },
}));

// ==================== Full E2E Flow Test ====================
describe("E2E: Complete checkout → credentials → trial conversion → referral conversion", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup: customer doesn't exist yet
    mocks.getCustomerByStripeSubscriptionId.mockResolvedValue(undefined);
    mocks.getCustomerByEmail.mockResolvedValue(null);
    mocks.createCustomer.mockResolvedValue(42); // new customer ID
    mocks.updateCustomer.mockResolvedValue(undefined);
    mocks.createProvisioningLog.mockResolvedValue(undefined);

    // Xtream provisioning succeeds
    mocks.createXtreamAccount.mockResolvedValue({
      username: "viewora_user1",
      password: "viewora_pass1",
      url: "http://m3u.viewora.tv/get.php?username=viewora_user1&password=viewora_pass1&type=m3u_plus",
      rawResponse: { status: "true", user_id: "6000", message: "Add M3U successful" },
    });

    // Stripe subscription retrieval
    mocks.subscriptionsRetrieve.mockResolvedValue({
      items: {
        data: [{
          price: {
            id: "price_standard_1mo",
            unit_amount: 1499,
            recurring: { interval: "month", interval_count: 1 },
          },
        }],
      },
    });
    mocks.subscriptionsUpdate.mockResolvedValue({});

    // Email sends successfully
    mocks.sendCredentialsEmail.mockResolvedValue(undefined);

    // Hermes defaults
    mocks.createFollowUpTask.mockResolvedValue(1);
    mocks.createHermesEvent.mockResolvedValue(1);
    mocks.createReferral.mockResolvedValue(10);
    mocks.updateReferral.mockResolvedValue(undefined);
    mocks.updateTrialLead.mockResolvedValue(undefined);
    mocks.runReferralValidation.mockResolvedValue(0);
    mocks.getReferralByCustomerId.mockResolvedValue(undefined);
    mocks.getReferralsByAffiliate.mockResolvedValue([]);

    // Trial lead exists (was previously activated)
    mocks.getTrialLeadByEmail.mockResolvedValue({
      id: 15,
      email: "customer@example.com",
      name: "Test Customer",
      status: "activated",
      preferredSupportChannel: "telegram",
    });

    // Affiliate exists and is active
    mocks.getAffiliateByCode.mockResolvedValue({
      id: 3,
      name: "Partner Affiliate",
      referralCode: "PARTNER10",
      status: "active",
    });
  });

  it("FLOW 1: Checkout creates subscription (mode=subscription, GBP pricing)", async () => {
    // Verify the checkout session creation uses subscription mode
    const { createCheckoutSession } = await import("./stripe-checkout");

    mocks.sessionsCreate.mockResolvedValue({
      url: "https://checkout.stripe.com/pay/cs_test_123",
    });

    const url = await createCheckoutSession(
      "1-device-1-month",
      "https://vieworatv.live/success?session_id={CHECKOUT_SESSION_ID}",
      "https://vieworatv.live/#pricing",
      "PARTNER10",
      "customer@example.com"
    );

    expect(url).toBe("https://checkout.stripe.com/pay/cs_test_123");
    expect(mocks.sessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "subscription",
        customer_email: "customer@example.com",
        allow_promotion_codes: true,
        metadata: expect.objectContaining({
          referral_code: "PARTNER10",
        }),
        line_items: expect.arrayContaining([
          expect.objectContaining({
            price_data: expect.objectContaining({
              currency: "gbp",
              recurring: expect.objectContaining({
                interval: "month",
              }),
            }),
          }),
        ]),
      })
    );
  });

  it("FLOW 2: Webhook receives checkout.session.completed and routes to handler", async () => {
    mocks.constructEvent.mockReturnValue({
      id: "evt_live_checkout_1",
      type: "checkout.session.completed",
      data: {
        object: {
          customer_details: { email: "customer@example.com", name: "Test Customer" },
          subscription: "sub_live_1",
          customer: "cus_live_1",
          id: "cs_live_1",
          metadata: { devices: "1", months: "1", tier_name: "Standard", referral_code: "PARTNER10" },
        },
      },
    });

    const { stripeWebhookHandler } = await import("./stripe-webhook");
    const req = { headers: { "stripe-signature": "valid_sig" }, body: "raw_body", rawBody: "raw_body" } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;

    stripeWebhookHandler(req, res);

    // Webhook acknowledges immediately with 200
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ received: true });

    // Wait for async processing
    await new Promise((r) => setTimeout(r, 600));

    // Subscription was retrieved (proves handler executed)
    expect(mocks.subscriptionsRetrieve).toHaveBeenCalledWith("sub_live_1");
  });

  it("FLOW 3: Customer gets credentials (Xtream provisioned + email sent)", async () => {
    mocks.constructEvent.mockReturnValue({
      id: "evt_live_checkout_2",
      type: "checkout.session.completed",
      data: {
        object: {
          customer_details: { email: "customer@example.com", name: "Test Customer" },
          subscription: "sub_live_2",
          customer: "cus_live_2",
          id: "cs_live_2",
          metadata: { devices: "1", months: "1", tier_name: "Standard" },
        },
      },
    });

    const { stripeWebhookHandler } = await import("./stripe-webhook");
    const req = { headers: { "stripe-signature": "valid_sig" }, body: "raw_body", rawBody: "raw_body" } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;

    stripeWebhookHandler(req, res);
    await new Promise((r) => setTimeout(r, 600));

    // Xtream account was provisioned
    expect(mocks.createXtreamAccount).toHaveBeenCalledWith(expect.objectContaining({
      sub: 1,
      notes: expect.stringContaining("customer@example.com"),
    }));

    // Customer record was created with credentials
    expect(mocks.createCustomer).toHaveBeenCalledWith(expect.objectContaining({
      email: "customer@example.com",
      name: "Test Customer",
      xtreamUsername: "viewora_user1",
      xtreamPassword: "viewora_pass1",
      status: "active",
      stripeSubscriptionId: "sub_live_2",
    }));

    // Credentials email was sent
    expect(mocks.sendCredentialsEmail).toHaveBeenCalledWith(expect.objectContaining({
      to: "customer@example.com",
      username: "viewora_user1",
      password: "viewora_pass1",
      planName: "1-Month / 1 Device",
    }));
  });

  it("FLOW 4: Trial lead converts (status → converted, event logged)", async () => {
    mocks.constructEvent.mockReturnValue({
      id: "evt_live_checkout_3",
      type: "checkout.session.completed",
      data: {
        object: {
          customer_details: { email: "customer@example.com", name: "Test Customer" },
          subscription: "sub_live_3",
          customer: "cus_live_3",
          id: "cs_live_3",
          metadata: { devices: "1", months: "1", tier_name: "Standard" },
        },
      },
    });

    const { stripeWebhookHandler } = await import("./stripe-webhook");
    const req = { headers: { "stripe-signature": "valid_sig" }, body: "raw_body", rawBody: "raw_body" } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;

    stripeWebhookHandler(req, res);
    await new Promise((r) => setTimeout(r, 600));

    // Trial lead was looked up by email
    expect(mocks.getTrialLeadByEmail).toHaveBeenCalledWith("customer@example.com");

    // Trial lead status was updated to "converted"
    expect(mocks.updateTrialLead).toHaveBeenCalledWith(15, expect.objectContaining({
      status: "converted",
      convertedCustomerId: 42,
      convertedSubscriptionId: "sub_live_3",
    }));

    // Hermes event was created
    expect(mocks.createHermesEvent).toHaveBeenCalledWith(expect.objectContaining({
      eventType: "trial.converted",
      source: "stripe",
    }));

    // Verify the event payload contains the correct data
    const eventCall = mocks.createHermesEvent.mock.calls.find(
      (c: any) => JSON.parse(c[0].payloadJson || "{}").trialLeadId === 15
    );
    expect(eventCall).toBeDefined();
    const payload = JSON.parse(eventCall![0].payloadJson);
    expect(payload.trialLeadId).toBe(15);
    expect(payload.customerId).toBe(42);
    expect(payload.email).toBe("customer@example.com");
  });

  it("FLOW 5: Referral records convert (referral created with status=purchased, event logged)", async () => {
    mocks.constructEvent.mockReturnValue({
      id: "evt_live_checkout_4",
      type: "checkout.session.completed",
      data: {
        object: {
          customer_details: { email: "customer@example.com", name: "Test Customer" },
          subscription: "sub_live_4",
          customer: "cus_live_4",
          id: "cs_live_4",
          metadata: { devices: "1", months: "1", tier_name: "Standard", referral_code: "PARTNER10" },
        },
      },
    });

    const { stripeWebhookHandler } = await import("./stripe-webhook");
    const req = { headers: { "stripe-signature": "valid_sig" }, body: "raw_body", rawBody: "raw_body" } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;

    stripeWebhookHandler(req, res);
    await new Promise((r) => setTimeout(r, 600));

    // Affiliate was looked up by code
    expect(mocks.getAffiliateByCode).toHaveBeenCalledWith("PARTNER10");

    // Referral record was created with status "purchased"
    expect(mocks.createReferral).toHaveBeenCalledWith(expect.objectContaining({
      affiliateId: 3,
      referralCode: "PARTNER10",
      customerId: 42,
      stripeCustomerId: "cus_live_4",
      subscriptionId: "sub_live_4",
      firstPaymentAmount: 1499,
      status: "purchased",
    }));

    // Hermes event was created for referral conversion
    expect(mocks.createHermesEvent).toHaveBeenCalledWith(expect.objectContaining({
      eventType: "referral.converted",
      source: "stripe",
    }));

    // Verify the referral event payload
    const eventCall = mocks.createHermesEvent.mock.calls.find(
      (c: any) => c[0].eventType === "referral.converted"
    );
    expect(eventCall).toBeDefined();
    const payload = JSON.parse(eventCall![0].payloadJson);
    expect(payload.affiliateId).toBe(3);
    expect(payload.referralCode).toBe("PARTNER10");
    expect(payload.customerId).toBe(42);
    expect(payload.subscriptionId).toBe("sub_live_4");

    // 14-day validation was triggered opportunistically
    expect(mocks.runReferralValidation).toHaveBeenCalled();
  });
});
