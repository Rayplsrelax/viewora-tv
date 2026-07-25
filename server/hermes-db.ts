import { eq, desc, and, lte, sql } from "drizzle-orm";
import { getDb } from "./db";
import {
  trialLeads, followUpTasks, hermesEvents, affiliates, referrals, serviceCredits,
  type InsertTrialLead, type InsertFollowUpTask, type InsertHermesEvent,
  type InsertAffiliate, type InsertReferral, type InsertServiceCredit,
  type TrialLead, type FollowUpTask, type Affiliate, type Referral, type ServiceCredit
} from "../drizzle/schema";

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
