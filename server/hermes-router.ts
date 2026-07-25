/**
 * Hermes Agent Router — handles trial requests, follow-up tasks, affiliates, and admin operations.
 */
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTrialLead, getTrialLeadById, updateTrialLead, getTodayTrialCount, getAllTrialLeads,
  createFollowUpTask, getDueFollowUpTasks, getAllFollowUpTasks, updateFollowUpTask, getFollowUpTaskById,
  createHermesEvent, getRecentHermesEvents,
  createAffiliate, getAffiliateByCode, getAllAffiliates, updateAffiliate,
  createReferral, getReferralsByAffiliate, updateReferral, getPaidReferralCountByAffiliate,
  createServiceCredit, getPendingServiceCredits, updateServiceCredit, getServiceCreditsByAffiliate,
  getHermesDailySummary,
} from "./hermes-db";
import { HERMES_TEMPLATES, type TemplateKey } from "./hermes-templates";

const TRIAL_DAILY_CAP = 10;

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const hermesRouter = router({
  // ==================== Trial System ====================
  
  /** Public: Submit a trial request */
  requestTrial: publicProcedure
    .input(z.object({
      name: z.string().min(1).max(255),
      email: z.string().email().max(320),
      telegram: z.string().max(255).optional(),
      whatsapp: z.string().max(64).optional(),
      country: z.string().max(64).optional(),
      deviceType: z.string().max(64).optional(),
      preferredSupportChannel: z.enum(["telegram", "whatsapp", "email"]).optional(),
      affiliateCode: z.string().max(64).optional(),
      consentToFollowup: z.boolean().optional(),
      // UTM/source tracking
      source: z.string().max(128).optional(),
      utmSource: z.string().max(128).optional(),
      utmMedium: z.string().max(128).optional(),
      utmCampaign: z.string().max(128).optional(),
      utmContent: z.string().max(128).optional(),
      referrer: z.string().optional(),
      landingPage: z.string().max(512).optional(),
    }))
    .mutation(async ({ input }) => {
      // Check daily cap
      const todayCount = await getTodayTrialCount();
      const isWaitlisted = todayCount >= TRIAL_DAILY_CAP;
      
      const leadId = await createTrialLead({
        ...input,
        consentToFollowup: input.consentToFollowup ? 1 : 0,
        status: isWaitlisted ? "waitlisted" : "requested",
      });
      
      // Create Hermes event
      await createHermesEvent({
        eventType: "trial.requested",
        source: "app",
        payloadJson: JSON.stringify({ leadId, email: input.email, waitlisted: isWaitlisted }),
      });
      
      // Create immediate confirmation follow-up task
      const templateKey = isWaitlisted ? "trial_waitlist" : "trial_confirmation";
      const template = HERMES_TEMPLATES[templateKey];
      await createFollowUpTask({
        taskType: "trial_request",
        relatedTrialLeadId: leadId,
        dueAt: Date.now(),
        priority: "high",
        channel: input.preferredSupportChannel || "telegram",
        status: "queued",
        messageTemplateKey: templateKey,
        messageBody: template.body,
      });
      
      return {
        success: true,
        leadId,
        waitlisted: isWaitlisted,
        slotsRemaining: Math.max(0, TRIAL_DAILY_CAP - todayCount - (isWaitlisted ? 0 : 1)),
        message: isWaitlisted
          ? "Trial slots are full today. We'll notify you when a slot opens or you can choose a paid plan."
          : "Trial request received! We'll review and send your credentials shortly.",
      };
    }),

  /** Public: Get trial availability */
  trialAvailability: publicProcedure.query(async () => {
    const todayCount = await getTodayTrialCount();
    return {
      slotsUsed: todayCount,
      slotsRemaining: Math.max(0, TRIAL_DAILY_CAP - todayCount),
      available: todayCount < TRIAL_DAILY_CAP,
    };
  }),

  // ==================== Admin: Trial Management ====================
  
  /** Admin: Get all trial leads */
  getTrials: adminProcedure.query(async () => {
    return getAllTrialLeads();
  }),

  /** Admin: Approve a trial (creates follow-up schedule) */
  approveTrial: adminProcedure
    .input(z.object({ leadId: z.number() }))
    .mutation(async ({ input }) => {
      const lead = await getTrialLeadById(input.leadId);
      if (!lead) throw new TRPCError({ code: "NOT_FOUND", message: "Trial lead not found" });
      
      const now = Date.now();
      const trialEnd = now + 24 * 60 * 60 * 1000; // 24 hours
      
      await updateTrialLead(input.leadId, {
        status: "approved",
        trialStartAt: now,
        trialEndAt: trialEnd,
      });
      
      // Create follow-up schedule
      const channel = lead.preferredSupportChannel || "telegram";
      
      // 1. Approved notification (immediate)
      await createFollowUpTask({
        taskType: "trial_request",
        relatedTrialLeadId: input.leadId,
        dueAt: now,
        priority: "high",
        channel,
        messageTemplateKey: "trial_approved",
        messageBody: HERMES_TEMPLATES.trial_approved.body,
      });
      
      // 2. Setup check (2 hours)
      await createFollowUpTask({
        taskType: "trial_setup_check",
        relatedTrialLeadId: input.leadId,
        dueAt: now + 2 * 60 * 60 * 1000,
        priority: "normal",
        channel,
        messageTemplateKey: "trial_setup_check",
        messageBody: HERMES_TEMPLATES.trial_setup_check.body,
      });
      
      // 3. Expiry reminder (20 hours)
      await createFollowUpTask({
        taskType: "trial_expiry",
        relatedTrialLeadId: input.leadId,
        dueAt: now + 20 * 60 * 60 * 1000,
        priority: "high",
        channel,
        messageTemplateKey: "trial_expiry_reminder",
        messageBody: HERMES_TEMPLATES.trial_expiry_reminder.body,
      });
      
      // 4. Trial expired conversion (24 hours)
      await createFollowUpTask({
        taskType: "trial_conversion",
        relatedTrialLeadId: input.leadId,
        dueAt: trialEnd,
        priority: "high",
        channel,
        messageTemplateKey: "trial_expired_conversion",
        messageBody: HERMES_TEMPLATES.trial_expired_conversion.body,
      });
      
      // 5. Final follow-up (48 hours)
      await createFollowUpTask({
        taskType: "trial_conversion",
        relatedTrialLeadId: input.leadId,
        dueAt: now + 48 * 60 * 60 * 1000,
        priority: "normal",
        channel,
        messageTemplateKey: "trial_final_followup",
        messageBody: HERMES_TEMPLATES.trial_final_followup.body,
      });
      
      await createHermesEvent({
        eventType: "trial.approved",
        source: "admin",
        payloadJson: JSON.stringify({ leadId: input.leadId, trialEnd }),
      });
      
      return { success: true };
    }),

  /** Admin: Disqualify a trial lead */
  disqualifyTrial: adminProcedure
    .input(z.object({ leadId: z.number(), reason: z.string().optional() }))
    .mutation(async ({ input }) => {
      await updateTrialLead(input.leadId, {
        status: "disqualified",
        notes: input.reason || "Disqualified by admin",
      });
      return { success: true };
    }),

  // ==================== Admin: Follow-up Tasks ====================
  
  /** Admin/Hermes: Get due follow-up tasks */
  getDueTasks: adminProcedure.query(async () => {
    return getDueFollowUpTasks();
  }),

  /** Admin/Hermes: Get all follow-up tasks */
  getAllTasks: adminProcedure.query(async () => {
    return getAllFollowUpTasks();
  }),

  /** Admin/Hermes: Draft a message for a task */
  draftTask: adminProcedure
    .input(z.object({
      taskId: z.number(),
      messageBody: z.string().optional(),
      hermesNotes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const task = await getFollowUpTaskById(input.taskId);
      if (!task) throw new TRPCError({ code: "NOT_FOUND" });
      
      await updateFollowUpTask(input.taskId, {
        status: "drafted",
        messageBody: input.messageBody || task.messageBody,
        hermesNotes: input.hermesNotes,
      });
      return { success: true };
    }),

  /** Admin: Mark a task as sent */
  markTaskSent: adminProcedure
    .input(z.object({ taskId: z.number() }))
    .mutation(async ({ input }) => {
      await updateFollowUpTask(input.taskId, { status: "sent" });
      await createHermesEvent({
        eventType: "task.sent",
        source: "admin",
        payloadJson: JSON.stringify({ taskId: input.taskId }),
      });
      return { success: true };
    }),

  /** Admin: Skip a task */
  skipTask: adminProcedure
    .input(z.object({ taskId: z.number(), reason: z.string().optional() }))
    .mutation(async ({ input }) => {
      await updateFollowUpTask(input.taskId, {
        status: "skipped",
        hermesNotes: input.reason || "Skipped by admin",
      });
      return { success: true };
    }),

  /** Admin: Complete a task */
  completeTask: adminProcedure
    .input(z.object({ taskId: z.number() }))
    .mutation(async ({ input }) => {
      await updateFollowUpTask(input.taskId, { status: "completed" });
      return { success: true };
    }),

  // ==================== Admin: Hermes Events & Summary ====================
  
  /** Admin: Get recent Hermes events */
  getEvents: adminProcedure.query(async () => {
    return getRecentHermesEvents(100);
  }),

  /** Admin: Get daily summary */
  getDailySummary: adminProcedure.query(async () => {
    return getHermesDailySummary();
  }),

  /** Admin/Hermes: Post a new event */
  postEvent: adminProcedure
    .input(z.object({
      eventType: z.string(),
      source: z.enum(["app", "stripe", "admin", "hermes", "telegram", "whatsapp"]).optional(),
      payloadJson: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await createHermesEvent({
        eventType: input.eventType,
        source: input.source || "admin",
        payloadJson: input.payloadJson,
      });
      return { success: true, eventId: id };
    }),

  // ==================== Admin: Affiliates ====================
  
  /** Admin: Get all affiliates */
  getAffiliates: adminProcedure.query(async () => {
    const allAffiliates = await getAllAffiliates();
    // Enrich with referral stats
    const enriched = await Promise.all(allAffiliates.map(async (aff) => {
      const referralsList = await getReferralsByAffiliate(aff.id);
      const paidCount = await getPaidReferralCountByAffiliate(aff.id);
      const credits = await getServiceCreditsByAffiliate(aff.id);
      return {
        ...aff,
        totalReferrals: referralsList.length,
        paidConversions: paidCount,
        creditsEarned: credits.length,
        creditsApplied: credits.filter(c => c.status === "applied").length,
      };
    }));
    return enriched;
  }),

  /** Admin: Create an affiliate */
  createAffiliate: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      email: z.string().email(),
      telegram: z.string().optional(),
      whatsapp: z.string().optional(),
      referralCode: z.string().min(3).max(64),
    }))
    .mutation(async ({ input }) => {
      // Check code uniqueness
      const existing = await getAffiliateByCode(input.referralCode);
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "Referral code already exists" });
      
      const id = await createAffiliate({
        ...input,
        status: "active",
      });
      return { success: true, affiliateId: id };
    }),

  /** Admin: Update affiliate status */
  updateAffiliateStatus: adminProcedure
    .input(z.object({
      affiliateId: z.number(),
      status: z.enum(["pending", "active", "paused", "banned"]),
    }))
    .mutation(async ({ input }) => {
      await updateAffiliate(input.affiliateId, { status: input.status });
      return { success: true };
    }),

  // ==================== Admin: Service Credits ====================
  
  /** Admin: Get pending service credits */
  getPendingCredits: adminProcedure.query(async () => {
    return getPendingServiceCredits();
  }),

  /** Admin: Apply a service credit */
  applyServiceCredit: adminProcedure
    .input(z.object({
      creditId: z.number(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await updateServiceCredit(input.creditId, {
        status: "applied",
        appliedAt: new Date(),
        notes: input.notes || "Applied by admin",
      });
      await createHermesEvent({
        eventType: "service_credit.applied",
        source: "admin",
        payloadJson: JSON.stringify({ creditId: input.creditId }),
      });
      return { success: true };
    }),

  /** Admin: Reject a service credit */
  rejectServiceCredit: adminProcedure
    .input(z.object({
      creditId: z.number(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await updateServiceCredit(input.creditId, {
        status: "rejected",
        notes: input.reason || "Rejected by admin",
      });
      return { success: true };
    }),

  // ==================== Public: Referral Tracking ====================
  
  /** Public: Track a referral click */
  trackReferralClick: publicProcedure
    .input(z.object({
      referralCode: z.string(),
      visitorId: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const affiliate = await getAffiliateByCode(input.referralCode);
      if (!affiliate || affiliate.status !== "active") {
        return { success: false, message: "Invalid referral code" };
      }
      
      await createReferral({
        affiliateId: affiliate.id,
        referralCode: input.referralCode,
        visitorId: input.visitorId,
        status: "clicked",
      });
      
      return { success: true };
    }),
});
