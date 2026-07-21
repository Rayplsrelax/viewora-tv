import { describe, expect, it, vi, beforeEach } from "vitest";
import { PLANS } from "./stripe-checkout";

// ==================== Plans Configuration Tests ====================
describe("Plans configuration", () => {
  it("should have 4 plans defined", () => {
    expect(PLANS).toHaveLength(4);
  });

  it("should have correct plan IDs", () => {
    const ids = PLANS.map((p) => p.id);
    expect(ids).toEqual(["1-month", "3-month", "6-month", "12-month"]);
  });

  it("should have prices in ascending order", () => {
    const prices = PLANS.map((p) => p.price);
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThan(prices[i - 1]);
    }
  });

  it("should mark 6-month plan as popular", () => {
    const popular = PLANS.find((p) => p.popular);
    expect(popular?.id).toBe("6-month");
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

  it("should have correct prices in cents", () => {
    const planPrices: Record<string, number> = {};
    PLANS.forEach((p) => (planPrices[p.id] = p.price));
    expect(planPrices["1-month"]).toBe(1499);
    expect(planPrices["3-month"]).toBe(3499);
    expect(planPrices["6-month"]).toBe(5999);
    expect(planPrices["12-month"]).toBe(8999);
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
      notes: "buyer@example.com",
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
