import { eq, desc, and, lte, sql } from "drizzle-orm";
import { getDb } from "./db";
import {
  trialLeads, followUpTasks, hermesEvents, affiliates, referrals, serviceCredits, customers,
  type InsertTrialLead, type InsertFollowUpTask, type InsertHermesEvent,
  type InsertAffiliate, type InsertReferral, type InsertServiceCredit,
  type TrialLead, type FollowUpTask, type Affiliate, type Referral, type ServiceCredit
} from "../drizzle/schema";
import { HERMES_TEMPLATES } from "./hermes-templates";

// ==================== Trial Leads ====================

export async function createTrialLead(data: InsertTrialLead): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(trialLeads).values(data);
  return result[0].insertId;
}

export async function getTrialLeadById(id: number): Promise<TrialLead | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(trialLeads).where(eq(trialLeads.id, id)).limit(1);
  return result[0];
}

export async function getTrialLeadByEmail(email: string): Promise<TrialLead | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(trialLeads).where(eq(trialLeads.email, email)).limit(1);
  return result[0];
}

export async function updateTrialLead(id: number, data: Partial<InsertTrialLead>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(trialLeads).set(data).where(eq(trialLeads.id, id));
}

export async function getTodayTrialCount(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const result = await db.select({ count: sql<number>`COUNT(*)` })
    .from(trialLeads)
    .where(and(
      sql`${trialLeads.createdAt} >= ${today}`,
      sql`${trialLeads.status} IN ('approved', 'credentials_sent', 'activated', 'converted')`
    ));
  return result[0]?.count ?? 0;
}

export async function getAllTrialLeads(limit = 200): Promise<TrialLead[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(trialLeads).orderBy(desc(trialLeads.createdAt)).limit(limit);
}

// ==================== Follow-up Tasks ====================

export async function createFollowUpTask(data: InsertFollowUpTask): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(followUpTasks).values(data);
  return result[0].insertId;
}

export async function getDueFollowUpTasks(): Promise<FollowUpTask[]> {
  const db = await getDb();
  if (!db) return [];
  const now = Date.now();
  return db.select().from(followUpTasks)
    .where(and(
      lte(followUpTasks.dueAt, now),
      eq(followUpTasks.status, "queued")
    ))
    .orderBy(desc(followUpTasks.priority))
    .limit(100);
}

export async function getAllFollowUpTasks(limit = 200): Promise<FollowUpTask[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(followUpTasks).orderBy(desc(followUpTasks.createdAt)).limit(limit);
}

export async function updateFollowUpTask(id: number, data: Partial<InsertFollowUpTask>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(followUpTasks).set(data).where(eq(followUpTasks.id, id));
}

export async function getFollowUpTaskById(id: number): Promise<FollowUpTask | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(followUpTasks).where(eq(followUpTasks.id, id)).limit(1);
  return result[0];
}

// ==================== Hermes Events ====================

export async function createHermesEvent(data: InsertHermesEvent): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(hermesEvents).values(data);
  return result[0].insertId;
}

export async function getRecentHermesEvents(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(hermesEvents).orderBy(desc(hermesEvents.createdAt)).limit(limit);
}

// ==================== Affiliates ====================

export async function createAffiliate(data: InsertAffiliate): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(affiliates).values(data);
  return result[0].insertId;
}

export async function getAffiliateByCode(code: string): Promise<Affiliate | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(affiliates).where(eq(affiliates.referralCode, code)).limit(1);
  return result[0];
}

export async function getAllAffiliates(): Promise<Affiliate[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(affiliates).orderBy(desc(affiliates.createdAt)).limit(200);
}

export async function updateAffiliate(id: number, data: Partial<InsertAffiliate>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(affiliates).set(data).where(eq(affiliates.id, id));
}

// ==================== Referrals ====================

export async function createReferral(data: InsertReferral): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(referrals).values(data);
  return result[0].insertId;
}

export async function getReferralsByAffiliate(affiliateId: number): Promise<Referral[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(referrals).where(eq(referrals.affiliateId, affiliateId)).orderBy(desc(referrals.createdAt)).limit(200);
}

export async function updateReferral(id: number, data: Partial<InsertReferral>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(referrals).set(data).where(eq(referrals.id, id));
}

export async function getReferralByTrialLeadId(trialLeadId: number): Promise<Referral | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(referrals).where(eq(referrals.trialLeadId, trialLeadId)).limit(1);
  return result[0];
}

export async function getReferralByCustomerId(customerId: number): Promise<Referral | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(referrals).where(eq(referrals.customerId, customerId)).limit(1);
  return result[0];
}

export async function getPaidReferralCountByAffiliate(affiliateId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`COUNT(*)` })
    .from(referrals)
    .where(and(
      eq(referrals.affiliateId, affiliateId),
      sql`${referrals.status} IN ('purchased', 'active_14_days', 'credit_due', 'credit_applied')`
    ));
  return result[0]?.count ?? 0;
}

// ==================== Service Credits ====================

export async function createServiceCredit(data: InsertServiceCredit): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(serviceCredits).values(data);
  return result[0].insertId;
}

export async function getPendingServiceCredits(): Promise<ServiceCredit[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(serviceCredits)
    .where(eq(serviceCredits.status, "pending"))
    .orderBy(desc(serviceCredits.createdAt))
    .limit(100);
}

export async function updateServiceCredit(id: number, data: Partial<InsertServiceCredit>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(serviceCredits).set(data).where(eq(serviceCredits.id, id));
}

export async function getServiceCreditsByAffiliate(affiliateId: number): Promise<ServiceCredit[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(serviceCredits).where(eq(serviceCredits.affiliateId, affiliateId)).orderBy(desc(serviceCredits.createdAt)).limit(100);
}

// ==================== Referral Validation & Rewards ====================

/**
 * Get referrals with status='purchased' that are eligible for 14-day validation.
 * A referral qualifies when the linked customer's subscriptionStart + 14 days <= now.
 */
export async function getReferralsPendingValidation(): Promise<Referral[]> {
  const db = await getDb();
  if (!db) return [];
  const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;
  const cutoff = Date.now() - fourteenDaysMs;
  // Get referrals in 'purchased' status with a linked customer
  const purchasedReferrals = await db.select().from(referrals)
    .where(and(
      eq(referrals.status, "purchased"),
      sql`${referrals.customerId} IS NOT NULL`
    ))
    .limit(200);
  
  if (purchasedReferrals.length === 0) return [];
  
  // Check each referral's customer subscription start
  const qualified: Referral[] = [];
  for (const ref of purchasedReferrals) {
    if (!ref.customerId) continue;
    const cust = await db.select().from(customers).where(eq(customers.id, ref.customerId)).limit(1);
    if (cust[0] && cust[0].status === "active" && cust[0].subscriptionStart && cust[0].subscriptionStart <= cutoff) {
      qualified.push(ref);
    }
  }
  return qualified;
}

/**
 * Get the count of fully-qualified referrals (active_14_days or beyond) for an affiliate.
 */
export async function getQualifiedReferralCount(affiliateId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`COUNT(*)` })
    .from(referrals)
    .where(and(
      eq(referrals.affiliateId, affiliateId),
      sql`${referrals.status} IN ('active_14_days', 'credit_due', 'credit_applied')`
    ));
  return result[0]?.count ?? 0;
}

/**
 * Get a referral by its referral code and customer ID.
 */
export async function getReferralByCodeAndCustomer(code: string, customerId: number): Promise<Referral | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(referrals)
    .where(and(
      eq(referrals.referralCode, code),
      eq(referrals.customerId, customerId)
    ))
    .limit(1);
  return result[0];
}

/**
 * Validate a single referral that has been active 14+ days.
 * Creates service credit, updates referral status, and checks free-month threshold.
 * Returns true if validation was performed.
 */
export async function validateAndRewardReferral(referral: Referral): Promise<boolean> {
  if (referral.status !== "purchased" || !referral.customerId) return false;
  
  // Update referral status to active_14_days
  await updateReferral(referral.id, { status: "active_14_days" });
  
  // Create service credit for the affiliate
  const creditId = await createServiceCredit({
    affiliateId: referral.affiliateId,
    customerId: referral.customerId,
    referralId: referral.id,
    creditType: "renewal_credit_manual",
    creditValueGbp: 500, // £5.00 credit
    status: "pending",
    notes: `Auto-created: referral #${referral.id} qualified after 14 days active`,
  });
  
  // Create hermes event
  await createHermesEvent({
    eventType: "referral.qualified",
    source: "hermes",
    payloadJson: JSON.stringify({
      referralId: referral.id,
      affiliateId: referral.affiliateId,
      customerId: referral.customerId,
      creditId,
    }),
  });
  
  // Create follow-up task to notify the affiliate
  await createFollowUpTask({
    taskType: "affiliate_reward",
    relatedAffiliateId: referral.affiliateId,
    relatedCustomerId: referral.customerId,
    dueAt: Date.now(),
    priority: "normal",
    channel: "telegram",
    status: "queued",
    messageTemplateKey: "affiliate_credit_earned",
    messageBody: HERMES_TEMPLATES.affiliate_credit_earned.body,
  });
  
  // Check if affiliate has reached 3 qualifying referrals (free month threshold)
  const qualifiedCount = await getQualifiedReferralCount(referral.affiliateId);
  if (qualifiedCount > 0 && qualifiedCount % 3 === 0) {
    // Award free month
    await createServiceCredit({
      affiliateId: referral.affiliateId,
      creditType: "free_month_manual",
      creditMonths: 1,
      status: "pending",
      notes: `Auto-created: affiliate reached ${qualifiedCount} qualifying referrals (free month milestone)`,
    });
    
    await createHermesEvent({
      eventType: "affiliate.free_month_earned",
      source: "hermes",
      payloadJson: JSON.stringify({
        affiliateId: referral.affiliateId,
        qualifiedCount,
        milestone: qualifiedCount,
      }),
    });
    
    // Notify affiliate about free month
    await createFollowUpTask({
      taskType: "affiliate_reward",
      relatedAffiliateId: referral.affiliateId,
      dueAt: Date.now(),
      priority: "high",
      channel: "telegram",
      status: "queued",
      messageTemplateKey: "affiliate_free_month",
      messageBody: HERMES_TEMPLATES.affiliate_free_month.body,
    });
  }
  
  return true;
}

/**
 * Run 14-day validation on all pending referrals.
 * Returns the number of referrals validated.
 */
export async function runReferralValidation(): Promise<number> {
  const pending = await getReferralsPendingValidation();
  let validated = 0;
  for (const ref of pending) {
    const result = await validateAndRewardReferral(ref);
    if (result) validated++;
  }
  return validated;
}

// ==================== Hermes Daily Summary ====================

export async function getHermesDailySummary() {
  const db = await getDb();
  if (!db) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();
  
  // Trial stats
  const allTrials = await db.select().from(trialLeads).orderBy(desc(trialLeads.createdAt)).limit(500);
  const todayTrials = allTrials.filter(t => t.createdAt && new Date(t.createdAt) >= today);
  const approvedToday = todayTrials.filter(t => ["approved", "credentials_sent", "activated", "converted"].includes(t.status));
  const waitlisted = allTrials.filter(t => t.status === "waitlisted");
  const activeTrials = allTrials.filter(t => t.status === "activated" || t.status === "credentials_sent");
  
  // Follow-up stats
  const allTasks = await db.select().from(followUpTasks).orderBy(desc(followUpTasks.createdAt)).limit(500);
  const dueTasks = allTasks.filter(t => t.status === "queued" && t.dueAt <= Date.now());
  const overdueTasks = dueTasks.filter(t => t.dueAt < todayMs);
  const draftedTasks = allTasks.filter(t => t.status === "drafted");
  
  // Affiliate stats
  const allAffiliates = await db.select().from(affiliates).limit(200);
  const activeAffiliates = allAffiliates.filter(a => a.status === "active");
  const allReferrals = await db.select().from(referrals).orderBy(desc(referrals.createdAt)).limit(500);
  const pendingCredits = await getPendingServiceCredits();
  
  return {
    trials: {
      slotsUsedToday: approvedToday.length,
      slotsRemaining: Math.max(0, 10 - approvedToday.length),
      totalRequests: todayTrials.length,
      waitlisted: waitlisted.length,
      activeTrials: activeTrials.length,
      conversionRate: allTrials.length > 0
        ? Math.round((allTrials.filter(t => t.status === "converted").length / allTrials.length) * 100)
        : 0,
    },
    followUps: {
      dueNow: dueTasks.length,
      overdue: overdueTasks.length,
      drafted: draftedTasks.length,
      sent: allTasks.filter(t => t.status === "sent").length,
      completed: allTasks.filter(t => t.status === "completed").length,
    },
    affiliates: {
      active: activeAffiliates.length,
      totalReferrals: allReferrals.length,
      paidConversions: allReferrals.filter(r => ["purchased", "active_14_days", "credit_due", "credit_applied"].includes(r.status)).length,
      creditsDue: pendingCredits.length,
    },
    hermesEvents: {
      total: (await getRecentHermesEvents(500)).length,
    },
  };
}
