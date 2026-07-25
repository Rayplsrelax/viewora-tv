import { describe, expect, it, vi, beforeEach } from "vitest";
import { PLANS } from "./stripe-checkout";

// ==================== Plans Configuration Tests ====================
describe("Plans configuration", () => {
  it("should have 12 plans defined (3 tiers x 4 durations)", () => {
    expect(PLANS).toHaveLength(12);
  });

  it("should have correct plan IDs", () => {
    const ids = PLANS.map((p) => p.id);
    expect(ids).toContain("1-device-1-month");
    expect(ids).toContain("2-device-6-month");
    expect(ids).toContain("4-device-12-month");
  });

  it("should have 3 device tiers (1, 2, 4)", () => {
    const deviceCounts = [...new Set(PLANS.map((p) => p.devices))];
    expect(deviceCounts.sort()).toEqual([1, 2, 4]);
  });

  it("should have 4 duration options (1, 3, 6, 12 months)", () => {
    const months = [...new Set(PLANS.map((p) => p.months))];
    expect(months.sort((a, b) => a - b)).toEqual([1, 3, 6, 12]);
  });

  it("should have features array for each plan", () => {
    for (const plan of PLANS) {
      expect(plan.features.length).toBeGreaterThan(0);
      expect(plan.features).toContain("20,000+ Live Channels");
    }
  });

  it("should have valid interval configurations", () => {
    for (const plan of PLANS) {
      expect(plan.interval).toBe("month");
      expect(plan.intervalCount).toBeGreaterThan(0);
    }
  });

  it("should have correct base prices in cents", () => {
    const p1d1 = PLANS.find((p) => p.id === "1-device-1-month");
    const p2d6 = PLANS.find((p) => p.id === "2-device-6-month");
    const p4d12 = PLANS.find((p) => p.id === "4-device-12-month");
    expect(p1d1?.price).toBe(1499);
    expect(p2d6?.price).toBe(9999);
    expect(p4d12?.price).toBe(21999);
  });
});

// ==================== Webhook Handler Tests ====================

// Hoist mock functions so they're available at mock factory evaluation time
const mocks = vi.hoisted(() => ({
  constructEvent: vi.fn(),
  subscriptionsRetrieve: vi.fn(),
  subscriptionsUpdate: vi.fn(),
  createCustomer: vi.fn(),
  getCustomerByStripeSubscriptionId: vi.fn(),
  updateCustomer: vi.fn(),
  createProvisioningLog: vi.fn(),
  createXtreamAccount: vi.fn(),
  renewXtreamAccount: vi.fn(),
  sendCredentialsEmail: vi.fn(),
  sendRenewalEmail: vi.fn(),
}));

vi.mock("stripe", () => ({
  default: class MockStripe {
    webhooks = { constructEvent: mocks.constructEvent };
    subscriptions = {
      retrieve: mocks.subscriptionsRetrieve,
      update: mocks.subscriptionsUpdate,
    };
  },
}));

vi.mock("./db", () => ({
  createCustomer: mocks.createCustomer,
  getCustomerByStripeSubscriptionId: mocks.getCustomerByStripeSubscriptionId,
  getCustomerByEmail: vi.fn().mockResolvedValue(null),
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
  createFollowUpTask: vi.fn().mockResolvedValue(1),
  createHermesEvent: vi.fn().mockResolvedValue(1),
  getTrialLeadByEmail: vi.fn().mockResolvedValue(null),
  updateTrialLead: vi.fn().mockResolvedValue(undefined),
  getAffiliateByCode: vi.fn().mockResolvedValue(null),
  createReferral: vi.fn().mockResolvedValue(1),
  updateReferral: vi.fn().mockResolvedValue(undefined),
  getReferralByCustomerId: vi.fn().mockResolvedValue(undefined),
  getReferralsByAffiliate: vi.fn().mockResolvedValue([]),
  runReferralValidation: vi.fn().mockResolvedValue(0),
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

describe("Stripe webhook handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.createCustomer.mockResolvedValue(1);
    mocks.getCustomerByStripeSubscriptionId.mockResolvedValue(undefined);
    mocks.updateCustomer.mockResolvedValue(undefined);
    mocks.createProvisioningLog.mockResolvedValue(undefined);

    mocks.createXtreamAccount.mockResolvedValue({
      username: "testuser123",
      password: "testpass456",
      url: "http://m3u.example.com/get.php?username=testuser123&password=testpass456&type=m3u_plus",
      rawResponse: { status: "true", user_id: "5000", message: "Add M3U successful" },
    });
    mocks.renewXtreamAccount.mockResolvedValue({
      success: true,
      rawResponse: { status: "true", messasge: "M3U renew successful" },
    });

    mocks.sendCredentialsEmail.mockResolvedValue(undefined);
    mocks.sendRenewalEmail.mockResolvedValue(undefined);

    mocks.subscriptionsRetrieve.mockResolvedValue({
      items: {
        data: [{
          price: { id: "price_test", recurring: { interval: "month", interval_count: 6 } },
        }],
      },
    });
    mocks.subscriptionsUpdate.mockResolvedValue({});
  });

  it("should reject requests without stripe-signature header", async () => {
    const { stripeWebhookHandler } = await import("./stripe-webhook");
    const req = { headers: {}, body: "" } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;

    stripeWebhookHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Missing stripe-signature header" });
  });

  it("should return 400 on invalid signature", async () => {
    mocks.constructEvent.mockImplementation(() => { throw new Error("Invalid signature"); });

    const { stripeWebhookHandler } = await import("./stripe-webhook");
    const req = { headers: { "stripe-signature": "bad_sig" }, body: "raw", rawBody: "raw" } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;

    stripeWebhookHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.stringContaining("Webhook Error"),
    }));
  });

  it("should acknowledge valid checkout.session.completed with 200", async () => {
    mocks.constructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          customer_details: { email: "buyer@example.com", name: "John Doe" },
          subscription: "sub_abc",
          customer: "cus_abc",
          id: "cs_abc",
        },
      },
    });

    const { stripeWebhookHandler } = await import("./stripe-webhook");
    const req = { headers: { "stripe-signature": "valid" }, body: "raw", rawBody: "raw" } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;

    stripeWebhookHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ received: true });
  });

  it("should provision Xtream account on checkout.session.completed", async () => {
    mocks.constructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          customer_details: { email: "buyer@example.com", name: "John Doe" },
          subscription: "sub_new",
          customer: "cus_new",
          id: "cs_new",
        },
      },
    });

    const { stripeWebhookHandler } = await import("./stripe-webhook");
    const req = { headers: { "stripe-signature": "valid" }, body: "raw", rawBody: "raw" } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;

    stripeWebhookHandler(req, res);
    await new Promise((r) => setTimeout(r, 300));

    expect(mocks.createXtreamAccount).toHaveBeenCalledWith(expect.objectContaining({
      sub: 6,
      notes: "buyer@example.com (device 1/1)",
    }));
    expect(mocks.createCustomer).toHaveBeenCalledWith(expect.objectContaining({
      email: "buyer@example.com",
      xtreamUsername: "testuser123",
      xtreamPassword: "testpass456",
      status: "active",
    }));
    expect(mocks.sendCredentialsEmail).toHaveBeenCalled();
  });

  it("should skip duplicate provisioning for existing subscription", async () => {
    mocks.getCustomerByStripeSubscriptionId.mockResolvedValue({ id: 1, xtreamUsername: "existing_user" });

    mocks.constructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          customer_details: { email: "buyer@example.com", name: "John Doe" },
          subscription: "sub_existing",
          customer: "cus_existing",
          id: "cs_existing",
        },
      },
    });

    const { stripeWebhookHandler } = await import("./stripe-webhook");
    const req = { headers: { "stripe-signature": "valid" }, body: "raw", rawBody: "raw" } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;

    stripeWebhookHandler(req, res);
    await new Promise((r) => setTimeout(r, 300));

    expect(mocks.createXtreamAccount).not.toHaveBeenCalled();
    expect(mocks.createCustomer).not.toHaveBeenCalled();
  });

  it("should create referral record when checkout has referral_code in metadata", async () => {
    const hermesDb = await import("./hermes-db");
    (hermesDb.getAffiliateByCode as any).mockResolvedValue({ id: 5, status: "active", referralCode: "TESTREF" });
    (hermesDb.getReferralByCustomerId as any).mockResolvedValue(undefined);

    mocks.constructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          customer_details: { email: "referred@example.com", name: "Referred User" },
          subscription: "sub_ref",
          customer: "cus_ref",
          id: "cs_ref",
          metadata: { referral_code: "TESTREF", devices: "1", months: "6", tier_name: "Standard" },
        },
      },
    });

    const { stripeWebhookHandler } = await import("./stripe-webhook");
    const req = { headers: { "stripe-signature": "valid" }, body: "raw", rawBody: "raw" } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;

    stripeWebhookHandler(req, res);
    await new Promise((r) => setTimeout(r, 500));

    expect(hermesDb.createReferral).toHaveBeenCalledWith(expect.objectContaining({
      affiliateId: 5,
      referralCode: "TESTREF",
      status: "purchased",
    }));
    expect(hermesDb.createHermesEvent).toHaveBeenCalledWith(expect.objectContaining({
      eventType: "referral.converted",
      source: "stripe",
    }));
  });

  it("should track trial-to-paid conversion when trial lead exists", async () => {
    const hermesDb = await import("./hermes-db");
    (hermesDb.getTrialLeadByEmail as any).mockResolvedValue({
      id: 7,
      email: "trialer@example.com",
      status: "activated",
    });

    mocks.constructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          customer_details: { email: "trialer@example.com", name: "Trial User" },
          subscription: "sub_trial",
          customer: "cus_trial",
          id: "cs_trial",
        },
      },
    });

    const { stripeWebhookHandler } = await import("./stripe-webhook");
    const req = { headers: { "stripe-signature": "valid" }, body: "raw", rawBody: "raw" } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;

    stripeWebhookHandler(req, res);
    await new Promise((r) => setTimeout(r, 500));

    expect(hermesDb.updateTrialLead).toHaveBeenCalledWith(7, expect.objectContaining({
      status: "converted",
    }));
    expect(hermesDb.createHermesEvent).toHaveBeenCalledWith(expect.objectContaining({
      eventType: "trial.converted",
      source: "stripe",
    }));
  });

  it("should skip invoice.paid with billing_reason subscription_create", async () => {
    mocks.constructEvent.mockReturnValue({
      type: "invoice.paid",
      data: {
        object: {
          subscription: "sub_123",
          billing_reason: "subscription_create",
          id: "inv_123",
        },
      },
    });

    const { stripeWebhookHandler } = await import("./stripe-webhook");
    const req = { headers: { "stripe-signature": "valid" }, body: "raw", rawBody: "raw" } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;

    stripeWebhookHandler(req, res);
    await new Promise((r) => setTimeout(r, 300));

    expect(mocks.renewXtreamAccount).not.toHaveBeenCalled();
  });

  it("should renew Xtream account on invoice.paid for existing customer", async () => {
    mocks.getCustomerByStripeSubscriptionId.mockResolvedValue({
      id: 5,
      email: "existing@example.com",
      name: "Existing User",
      xtreamUsername: "existuser",
      xtreamPassword: "existpass",
      planName: "6-Month Plan",
    });

    mocks.constructEvent.mockReturnValue({
      type: "invoice.paid",
      data: {
        object: {
          subscription: "sub_renew",
          billing_reason: "subscription_cycle",
          id: "inv_renew",
        },
      },
    });

    const { stripeWebhookHandler } = await import("./stripe-webhook");
    const req = { headers: { "stripe-signature": "valid" }, body: "raw", rawBody: "raw" } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;

    stripeWebhookHandler(req, res);
    await new Promise((r) => setTimeout(r, 300));

    expect(mocks.renewXtreamAccount).toHaveBeenCalledWith(expect.objectContaining({
      username: "existuser",
      password: "existpass",
      sub: 6,
    }));
    expect(mocks.updateCustomer).toHaveBeenCalledWith(5, expect.objectContaining({
      status: "active",
    }));
    expect(mocks.sendRenewalEmail).toHaveBeenCalled();
  });
});

describe("Multi-device provisioning and renewal", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.createCustomer.mockResolvedValue(1);
    mocks.getCustomerByStripeSubscriptionId.mockResolvedValue(undefined);
    mocks.updateCustomer.mockResolvedValue(undefined);
    mocks.createProvisioningLog.mockResolvedValue(undefined);
    mocks.sendCredentialsEmail.mockResolvedValue(undefined);
    mocks.sendRenewalEmail.mockResolvedValue(undefined);
    mocks.subscriptionsRetrieve.mockResolvedValue({
      items: {
        data: [{
          price: { id: "price_test", recurring: { interval: "month", interval_count: 6 } },
        }],
      },
    });
    mocks.subscriptionsUpdate.mockResolvedValue({});
    mocks.renewXtreamAccount.mockResolvedValue({
      success: true,
      rawResponse: { status: "true", messasge: "M3U renew successful" },
    });
  });

  it("should provision 2 Xtream accounts for 2-device plan", async () => {
    let callCount = 0;
    mocks.createXtreamAccount.mockImplementation(async () => {
      callCount++;
      return {
        username: `user${callCount}`,
        password: `pass${callCount}`,
        url: `http://m3u.example.com/get.php?username=user${callCount}&password=pass${callCount}&type=m3u_plus`,
        rawResponse: { status: "true", user_id: "5000", message: "Add M3U successful" },
      };
    });

    mocks.constructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          customer_details: { email: "multi@example.com", name: "Multi User" },
          subscription: "sub_multi2",
          customer: "cus_multi2",
          id: "cs_multi2",
          metadata: { devices: "2", months: "6" },
        },
      },
    });

    const { stripeWebhookHandler } = await import("./stripe-webhook");
    const req = { headers: { "stripe-signature": "valid" }, body: "raw", rawBody: "raw" } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;

    stripeWebhookHandler(req, res);
    await new Promise((r) => setTimeout(r, 500));

    // Should provision exactly 2 accounts
    expect(mocks.createXtreamAccount).toHaveBeenCalledTimes(2);
    expect(mocks.createXtreamAccount).toHaveBeenCalledWith(expect.objectContaining({
      notes: "multi@example.com (device 1/2)",
    }));
    expect(mocks.createXtreamAccount).toHaveBeenCalledWith(expect.objectContaining({
      notes: "multi@example.com (device 2/2)",
    }));

    // Primary credentials stored in customer record
    expect(mocks.createCustomer).toHaveBeenCalledWith(expect.objectContaining({
      xtreamUsername: "user1",
      xtreamPassword: "pass1",
    }));
    // Verify secondary credentials stored in notes as JSON
    const createCustomerCall = mocks.createCustomer.mock.calls[0][0];
    const parsedNotes = JSON.parse(createCustomerCall.notes);
    expect(parsedNotes).toHaveLength(1);
    expect(parsedNotes[0].username).toBe("user2");
    expect(parsedNotes[0].password).toBe("pass2");

    // Email should include additional credentials
    expect(mocks.sendCredentialsEmail).toHaveBeenCalledWith(expect.objectContaining({
      username: "user1",
      password: "pass1",
    }));
    const emailCall = mocks.sendCredentialsEmail.mock.calls[0][0];
    expect(emailCall.additionalCredentials).toHaveLength(1);
    expect(emailCall.additionalCredentials[0].username).toBe("user2");
  });

  it("should renew all device accounts without duplicating primary", async () => {
    // Customer has secondary credentials in notes
    mocks.getCustomerByStripeSubscriptionId.mockResolvedValue({
      id: 10,
      email: "multi@example.com",
      name: "Multi User",
      xtreamUsername: "primary_user",
      xtreamPassword: "primary_pass",
      planName: "6-Month / 2 Devices",
      notes: JSON.stringify([{ username: "secondary_user", password: "secondary_pass" }]),
    });

    mocks.constructEvent.mockReturnValue({
      type: "invoice.paid",
      data: {
        object: {
          subscription: "sub_multi_renew",
          billing_reason: "subscription_cycle",
          id: "inv_multi_renew",
        },
      },
    });

    const { stripeWebhookHandler } = await import("./stripe-webhook");
    const req = { headers: { "stripe-signature": "valid" }, body: "raw", rawBody: "raw" } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;

    stripeWebhookHandler(req, res);
    await new Promise((r) => setTimeout(r, 500));

    // Should renew exactly 2 accounts: primary + 1 secondary
    expect(mocks.renewXtreamAccount).toHaveBeenCalledTimes(2);
    expect(mocks.renewXtreamAccount).toHaveBeenCalledWith(expect.objectContaining({
      username: "primary_user",
      password: "primary_pass",
      sub: 6,
    }));
    expect(mocks.renewXtreamAccount).toHaveBeenCalledWith(expect.objectContaining({
      username: "secondary_user",
      password: "secondary_pass",
      sub: 6,
    }));
  });
});

// ==================== Module Structure Tests ====================
describe("Xtream module structure", () => {
  it("should export createXtreamAccount and renewXtreamAccount", async () => {
    const xtream = await import("./xtream");
    expect(typeof xtream.createXtreamAccount).toBe("function");
    expect(typeof xtream.renewXtreamAccount).toBe("function");
  });
});

describe("Email module structure", () => {
  it("should export sendCredentialsEmail and sendRenewalEmail", async () => {
    const email = await import("./email");
    expect(typeof email.sendCredentialsEmail).toBe("function");
    expect(typeof email.sendRenewalEmail).toBe("function");
  });
});

describe("Admin router authorization", () => {
  it("should have admin procedures defined in the router", async () => {
    const { appRouter } = await import("./routers");
    expect((appRouter as any)._def.procedures).toBeDefined();
  });
});
