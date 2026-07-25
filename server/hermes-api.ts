/**
 * Hermes Agent REST API — protected by HERMES_AGENT_API_KEY.
 * These endpoints are used by external automation tools (n8n, Make, custom agents)
 * to interact with the Hermes system programmatically.
 */
import { Router, Request, Response, NextFunction } from "express";
import { ENV } from "./_core/env";
import {
  getDueFollowUpTasks, getAllFollowUpTasks, updateFollowUpTask, getFollowUpTaskById,
  createHermesEvent, getRecentHermesEvents, getHermesDailySummary,
  getPendingServiceCredits, updateServiceCredit,
  getAllAffiliates, getAffiliateByCode,
  getAllTrialLeads, updateTrialLead,
} from "./hermes-db";

const hermesApiRouter = Router();

// API Key middleware
function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers["x-hermes-api-key"] || req.headers["authorization"]?.replace("Bearer ", "");
  if (!ENV.hermesAgentApiKey || !apiKey || apiKey !== ENV.hermesAgentApiKey) {
    res.status(401).json({ error: "Unauthorized: Invalid or missing API key" });
    return;
  }
  next();
}

hermesApiRouter.use(requireApiKey);

// GET /api/admin/hermes/tasks/due — tasks that are due now
hermesApiRouter.get("/tasks/due", async (_req: Request, res: Response) => {
  try {
    const tasks = await getDueFollowUpTasks();
    res.json({ tasks });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/admin/hermes/tasks — all tasks
hermesApiRouter.get("/tasks", async (_req: Request, res: Response) => {
  try {
    const tasks = await getAllFollowUpTasks();
    res.json({ tasks });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/admin/hermes/tasks/:id/draft
hermesApiRouter.post("/tasks/:id/draft", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const task = await getFollowUpTaskById(id);
    if (!task) { res.status(404).json({ error: "Task not found" }); return; }

    const messageBody = typeof req.body?.messageBody === "string" && req.body.messageBody.trim()
      ? req.body.messageBody
      : task.messageBody;
    const hermesNotes = typeof req.body?.hermesNotes === "string" ? req.body.hermesNotes : undefined;

    await updateFollowUpTask(id, {
      status: "drafted",
      messageBody,
      hermesNotes,
    });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/admin/hermes/tasks/:id/mark-sent
hermesApiRouter.post("/tasks/:id/mark-sent", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const task = await getFollowUpTaskById(id);
    if (!task) { res.status(404).json({ error: "Task not found" }); return; }
    await updateFollowUpTask(id, { status: "sent" });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/admin/hermes/tasks/:id/skip
hermesApiRouter.post("/tasks/:id/skip", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    await updateFollowUpTask(id, { status: "skipped" });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/admin/hermes/tasks/:id/complete
hermesApiRouter.post("/tasks/:id/complete", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    await updateFollowUpTask(id, { status: "completed" });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/admin/hermes/daily-summary
hermesApiRouter.get("/daily-summary", async (_req: Request, res: Response) => {
  try {
    const summary = await getHermesDailySummary();
    res.json(summary);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/admin/hermes/events
hermesApiRouter.get("/events", async (_req: Request, res: Response) => {
  try {
    const events = await getRecentHermesEvents(50);
    res.json({ events });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/admin/hermes/events — create a new event
hermesApiRouter.post("/events", async (req: Request, res: Response) => {
  try {
    const { eventType, source, payloadJson } = req.body;
    if (!eventType || !source) {
      res.status(400).json({ error: "eventType and source are required" });
      return;
    }
    const id = await createHermesEvent({ eventType, source, payloadJson });
    res.json({ id });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/admin/hermes/credits/pending
hermesApiRouter.get("/credits/pending", async (_req: Request, res: Response) => {
  try {
    const credits = await getPendingServiceCredits();
    res.json({ credits });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Compatibility alias expected by Hermes integration docs/prompts.
// GET /api/admin/hermes/affiliate-credits-due
hermesApiRouter.get("/affiliate-credits-due", async (_req: Request, res: Response) => {
  try {
    const credits = await getPendingServiceCredits();
    res.json({ credits });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/admin/hermes/credits/:id/apply
hermesApiRouter.post("/credits/:id/apply", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    await updateServiceCredit(id, { status: "applied", appliedAt: new Date() });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Compatibility alias expected by Hermes integration docs/prompts.
// POST /api/admin/hermes/service-credit/:id/apply
hermesApiRouter.post("/service-credit/:id/apply", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    await updateServiceCredit(id, { status: "applied", appliedAt: new Date() });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/admin/hermes/credits/:id/reject
hermesApiRouter.post("/credits/:id/reject", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    await updateServiceCredit(id, { status: "rejected" });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/admin/hermes/affiliates
hermesApiRouter.get("/affiliates", async (_req: Request, res: Response) => {
  try {
    const affiliates = await getAllAffiliates();
    res.json({ affiliates });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/admin/hermes/trials
hermesApiRouter.get("/trials", async (_req: Request, res: Response) => {
  try {
    const trials = await getAllTrialLeads();
    res.json({ trials });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export { hermesApiRouter };
