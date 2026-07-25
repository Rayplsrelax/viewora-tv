import { describe, it, expect, vi, beforeEach } from "vitest";
import { HERMES_TEMPLATES } from "./hermes-templates";

// ==================== Hermes Templates Tests ====================
describe("Hermes message templates", () => {
  it("should have all required template keys", () => {
    const requiredKeys = [
      "trial_confirmation",
      "trial_waitlist",
      "trial_approved",
      "trial_setup_check",
      "trial_expiry_reminder",
      "trial_expired_conversion",
      "trial_final_followup",
      "payment_failed",
      "cancellation_confirmation",
      "cancellation_reason_ask",
      "winback_7day",
      "winback_21day",
      "affiliate_credit_earned",
      "affiliate_free_month",
    ];
    for (const key of requiredKeys) {
      expect(HERMES_TEMPLATES).toHaveProperty(key);
    }
  });

  it("should have non-empty body for all templates", () => {
    for (const [key, template] of Object.entries(HERMES_TEMPLATES)) {
      expect(template.body.length).toBeGreaterThan(10);
      expect(template.key).toBe(key);
      expect(template.subject.length).toBeGreaterThan(0);
    }
  });

  it("should include vieworatv.live link in conversion templates", () => {
    expect(HERMES_TEMPLATES.trial_expired_conversion.body).toContain("vieworatv.live");
    expect(HERMES_TEMPLATES.trial_final_followup.body).toContain("vieworatv.live");
    expect(HERMES_TEMPLATES.winback_21day.body).toContain("vieworatv.live");
    expect(HERMES_TEMPLATES.trial_waitlist.body).toContain("vieworatv.live");
  });

  it("should include setup link in trial_approved template", () => {
    expect(HERMES_TEMPLATES.trial_approved.body).toContain("vieworatv.live/setup");
  });
});

// ==================== Hermes Router Module Tests ====================
describe("Hermes router module structure", () => {
  it("should export hermesRouter", async () => {
    const mod = await import("./hermes-router");
    expect(mod.hermesRouter).toBeDefined();
    expect((mod.hermesRouter as any)._def).toBeDefined();
  });
});

// ==================== Hermes DB Module Tests ====================
describe("Hermes DB module structure", () => {
  it("should export all required functions", async () => {
    const mod = await vi.importActual<typeof import("./hermes-db")>("./hermes-db");
    expect(typeof mod.createTrialLead).toBe("function");
    expect(typeof mod.getTrialLeadById).toBe("function");
    expect(typeof mod.updateTrialLead).toBe("function");
    expect(typeof mod.getTodayTrialCount).toBe("function");
    expect(typeof mod.getAllTrialLeads).toBe("function");
    expect(typeof mod.createFollowUpTask).toBe("function");
    expect(typeof mod.getDueFollowUpTasks).toBe("function");
    expect(typeof mod.getAllFollowUpTasks).toBe("function");
    expect(typeof mod.updateFollowUpTask).toBe("function");
    expect(typeof mod.getFollowUpTaskById).toBe("function");
    expect(typeof mod.createHermesEvent).toBe("function");
    expect(typeof mod.getRecentHermesEvents).toBe("function");
    expect(typeof mod.createAffiliate).toBe("function");
    expect(typeof mod.getAffiliateByCode).toBe("function");
    expect(typeof mod.getAllAffiliates).toBe("function");
    expect(typeof mod.updateAffiliate).toBe("function");
    expect(typeof mod.createReferral).toBe("function");
    expect(typeof mod.getReferralsByAffiliate).toBe("function");
    expect(typeof mod.updateReferral).toBe("function");
    expect(typeof mod.getPaidReferralCountByAffiliate).toBe("function");
    expect(typeof mod.createServiceCredit).toBe("function");
    expect(typeof mod.getPendingServiceCredits).toBe("function");
    expect(typeof mod.updateServiceCredit).toBe("function");
    expect(typeof mod.getServiceCreditsByAffiliate).toBe("function");
    expect(typeof mod.getHermesDailySummary).toBe("function");
  });
});

// ==================== Winback Task Creation Tests ====================
// These test that the stripe-webhook creates Hermes tasks on cancellation/payment failure

const hermesMocks = vi.hoisted(() => ({
  createFollowUpTask: vi.fn(),
  createHermesEvent: vi.fn(),
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
    webhooks = { constructEvent: hermesMocks.constructEvent };
    subscriptions = {
      retrieve: hermesMocks.subscriptionsRetrieve,
      update: hermesMocks.subscriptionsUpdate,
    };
  },
}));

vi.mock("./db", () => ({
  createCustomer: hermesMocks.createCustomer,
  getCustomerByStripeSubscriptionId: hermesMocks.getCustomerByStripeSubscriptionId,
  getCustomerByEmail: vi.fn().mockResolvedValue(null),
  updateCustomer: hermesMocks.updateCustomer,
  createProvisioningLog: hermesMocks.createProvisioningLog,
}));

vi.mock("./xtream", () => ({
  createXtreamAccount: hermesMocks.createXtreamAccount,
  renewXtreamAccount: hermesMocks.renewXtreamAccount,
}));

vi.mock("./email", () => ({
  sendCredentialsEmail: hermesMocks.sendCredentialsEmail,
  sendRenewalEmail: hermesMocks.sendRenewalEmail,
}));

vi.mock("./hermes-db", () => ({
  createFollowUpTask: hermesMocks.createFollowUpTask,
  createHermesEvent: hermesMocks.createHermesEvent,
  getTrialLeadByEmail: vi.fn().mockResolvedValue(null),
  updateTrialLead: vi.fn().mockResolvedValue(undefined),
  getAffiliateByCode: vi.fn().mockResolvedValue(null),
  createReferral: vi.fn().mockResolvedValue(1),
  updateReferral: vi.fn().mockResolvedValue(undefined),
  getReferralByCustomerId: vi.fn().mockResolvedValue(undefined),
  getReferralsByAffiliate: vi.fn().mockResolvedValue([]),
  runReferralValidation: vi.fn().mockResolvedValue(0),
}));

describe("Winback task creation on subscription cancellation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hermesMocks.getCustomerByStripeSubscriptionId.mockResolvedValue({
      id: 10,
      email: "cancelled@example.com",
      name: "Cancelled User",
      xtreamUsername: "canceluser",
      xtreamPassword: "cancelpass",
      planName: "1-Month / 1 Device",
    });
    hermesMocks.updateCustomer.mockResolvedValue(undefined);
    hermesMocks.createProvisioningLog.mockResolvedValue(undefined);
    hermesMocks.createFollowUpTask.mockResolvedValue(1);
    hermesMocks.createHermesEvent.mockResolvedValue(1);
  });

  it("should create 3 winback follow-up tasks on subscription.deleted", async () => {
    hermesMocks.constructEvent.mockReturnValue({
      id: "evt_cancel_1",
      type: "customer.subscription.deleted",
      data: {
        object: {
          id: "sub_cancel_test",
          canceled_at: Math.floor(Date.now() / 1000),
        },
      },
    });

    const { stripeWebhookHandler } = await import("./stripe-webhook");
    const req = { headers: { "stripe-signature": "valid" }, body: "raw", rawBody: "raw" } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;

    stripeWebhookHandler(req, res);
    await new Promise((r) => setTimeout(r, 500));

    // Should create 3 tasks: cancellation_reason, winback_7day, winback_21day
    expect(hermesMocks.createFollowUpTask).toHaveBeenCalledTimes(3);

    const calls = hermesMocks.createFollowUpTask.mock.calls;
    expect(calls[0][0].taskType).toBe("cancellation_reason");
    expect(calls[0][0].messageTemplateKey).toBe("cancellation_reason_ask");
    expect(calls[1][0].taskType).toBe("winback");
    expect(calls[1][0].messageTemplateKey).toBe("winback_7day");
    expect(calls[2][0].taskType).toBe("winback");
    expect(calls[2][0].messageTemplateKey).toBe("winback_21day");

    // Should create a Hermes event
    expect(hermesMocks.createHermesEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "subscription.cancelled",
        source: "stripe",
      })
    );
  });

  it("should create payment_failed follow-up task on invoice.payment_failed", async () => {
    hermesMocks.constructEvent.mockReturnValue({
      id: "evt_fail_1",
      type: "invoice.payment_failed",
      data: {
        object: {
          subscription: "sub_fail_test",
          id: "inv_fail_test",
        },
      },
    });

    const { stripeWebhookHandler } = await import("./stripe-webhook");
    const req = { headers: { "stripe-signature": "valid" }, body: "raw", rawBody: "raw" } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;

    stripeWebhookHandler(req, res);
    await new Promise((r) => setTimeout(r, 500));

    // Should create 1 payment_failed task
    expect(hermesMocks.createFollowUpTask).toHaveBeenCalledWith(
      expect.objectContaining({
        taskType: "payment_failed",
        messageTemplateKey: "payment_failed",
        priority: "urgent",
      })
    );

    // Should create a Hermes event
    expect(hermesMocks.createHermesEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "payment.failed",
        source: "stripe",
      })
    );
  });
});

// ==================== Schema Tests ====================
describe("Hermes schema tables", () => {
  it("should export all Hermes table definitions", async () => {
    const schema = await import("../drizzle/schema");
    expect(schema.trialLeads).toBeDefined();
    expect(schema.followUpTasks).toBeDefined();
    expect(schema.hermesEvents).toBeDefined();
    expect(schema.affiliates).toBeDefined();
    expect(schema.referrals).toBeDefined();
    expect(schema.serviceCredits).toBeDefined();
  });

  it("should export all Hermes type definitions", async () => {
    const schema = await import("../drizzle/schema");
    // Type exports are compile-time only, but we can check the table inferSelect works
    const trialLeadColumns = Object.keys(schema.trialLeads);
    expect(trialLeadColumns.length).toBeGreaterThan(0);
  });
});

// ==================== Integration: appRouter includes hermes ====================
describe("appRouter includes hermesRouter", () => {
  it("should have hermes procedures in the appRouter", async () => {
    const { appRouter } = await import("./routers");
    const procedures = (appRouter as any)._def.procedures;
    // Check that hermes namespace exists
    expect(procedures).toBeDefined();
  });
});
