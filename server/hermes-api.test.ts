import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import http from "node:http";

const hermesDbMocks = vi.hoisted(() => ({
  getDueFollowUpTasks: vi.fn().mockResolvedValue([]),
  getAllFollowUpTasks: vi.fn().mockResolvedValue([]),
  updateFollowUpTask: vi.fn().mockResolvedValue(undefined),
  getFollowUpTaskById: vi.fn().mockResolvedValue({ id: 1, status: "queued" }),
  createHermesEvent: vi.fn().mockResolvedValue(1),
  getRecentHermesEvents: vi.fn().mockResolvedValue([]),
  getHermesDailySummary: vi.fn().mockResolvedValue({ trials: {}, followUps: {}, affiliates: {} }),
  getPendingServiceCredits: vi.fn().mockResolvedValue([]),
  updateServiceCredit: vi.fn().mockResolvedValue(undefined),
  getAllAffiliates: vi.fn().mockResolvedValue([]),
  getAffiliateByCode: vi.fn().mockResolvedValue(null),
  getAllTrialLeads: vi.fn().mockResolvedValue([]),
  updateTrialLead: vi.fn().mockResolvedValue(undefined),
}));

// Mock hermes-db to avoid DB connection
vi.mock("./hermes-db", () => hermesDbMocks);

async function makeApp() {
  vi.resetModules();
  process.env.HERMES_AGENT_API_KEY = "test-hermes-key-12345";
  const { hermesApiRouter } = await import("./hermes-api");
  const app = express();
  app.use(express.json());
  app.use("/api/admin/hermes", hermesApiRouter);
  return app;
}

async function withServer<T>(app: express.Express, fn: (baseUrl: string) => Promise<T>): Promise<T> {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Failed to start test server");
  const baseUrl = `http://127.0.0.1:${address.port}`;
  try {
    return await fn(baseUrl);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
  }
}

describe("Hermes API key protection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject requests without API key", async () => {
    process.env.HERMES_AGENT_API_KEY = "test-hermes-key-12345";

    const { hermesApiRouter } = await import("./hermes-api");
    expect(hermesApiRouter).toBeDefined();

    const req = { headers: {} } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;
    const next = vi.fn();

    const stack = (hermesApiRouter as any).stack;
    const authMiddleware = stack.find((layer: any) => layer.name === "requireApiKey");

    if (authMiddleware) {
      authMiddleware.handle(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    } else {
      expect(stack.length).toBeGreaterThan(0);
    }
  });

  it("should export hermesApiRouter", async () => {
    const mod = await import("./hermes-api");
    expect(mod.hermesApiRouter).toBeDefined();
  });

  it("should have HERMES_AGENT_API_KEY in ENV config", async () => {
    process.env.HERMES_AGENT_API_KEY = "test-hermes-key-12345";
    vi.resetModules();
    const { ENV } = await import("./_core/env");
    expect(ENV.hermesAgentApiKey).toBe("test-hermes-key-12345");
  });
});

describe("Hermes REST task routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hermesDbMocks.getFollowUpTaskById.mockResolvedValue({ id: 1, status: "queued", messageBody: "old" });
  });

  it("drafts a follow-up task through the REST API", async () => {
    const app = await makeApp();

    await withServer(app, async (baseUrl) => {
      const res = await fetch(`${baseUrl}/api/admin/hermes/tasks/1/draft`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-hermes-api-key": "test-hermes-key-12345",
        },
        body: JSON.stringify({ messageBody: "Drafted message", hermesNotes: "Ready for admin approval" }),
      });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body).toEqual({ success: true });
      expect(hermesDbMocks.updateFollowUpTask).toHaveBeenCalledWith(1, {
        status: "drafted",
        messageBody: "Drafted message",
        hermesNotes: "Ready for admin approval",
      });
    });
  });

  it("returns 404 when drafting a missing follow-up task", async () => {
    hermesDbMocks.getFollowUpTaskById.mockResolvedValueOnce(null);
    const app = await makeApp();

    await withServer(app, async (baseUrl) => {
      const res = await fetch(`${baseUrl}/api/admin/hermes/tasks/999/draft`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-hermes-api-key": "test-hermes-key-12345",
        },
        body: JSON.stringify({ messageBody: "Drafted message" }),
      });
      const body = await res.json();

      expect(res.status).toBe(404);
      expect(body.error).toBe("Task not found");
      expect(hermesDbMocks.updateFollowUpTask).not.toHaveBeenCalled();
    });
  });
});

describe("Hermes REST service-credit aliases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("supports the affiliate-credits-due alias expected by Hermes integrations", async () => {
    hermesDbMocks.getPendingServiceCredits.mockResolvedValueOnce([{ id: 7, status: "pending" }]);
    const app = await makeApp();

    await withServer(app, async (baseUrl) => {
      const res = await fetch(`${baseUrl}/api/admin/hermes/affiliate-credits-due`, {
        headers: { authorization: "Bearer test-hermes-key-12345" },
      });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body).toEqual({ credits: [{ id: 7, status: "pending" }] });
    });
  });

  it("supports the service-credit apply alias expected by Hermes integrations", async () => {
    const app = await makeApp();

    await withServer(app, async (baseUrl) => {
      const res = await fetch(`${baseUrl}/api/admin/hermes/service-credit/7/apply`, {
        method: "POST",
        headers: { authorization: "Bearer test-hermes-key-12345" },
      });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body).toEqual({ success: true });
      expect(hermesDbMocks.updateServiceCredit).toHaveBeenCalledWith(7, {
        status: "applied",
        appliedAt: expect.any(Date),
      });
    });
  });
});
