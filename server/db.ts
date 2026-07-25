import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, customers, provisioningLogs, analyticsEvents, type InsertCustomer, type InsertProvisioningLog, type Customer, type InsertAnalyticsEvent } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ==================== Customer Queries ====================

export async function createCustomer(data: InsertCustomer): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(customers).values(data);
  return result[0].insertId;
}

export async function getCustomerByStripeSubscriptionId(subscriptionId: string): Promise<Customer | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(customers).where(eq(customers.stripeSubscriptionId, subscriptionId)).limit(1);
  return result[0];
}

export async function getCustomerByEmail(email: string): Promise<Customer | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(customers).where(eq(customers.email, email)).limit(1);
  return result[0];
}

export async function updateCustomer(id: number, data: Partial<InsertCustomer>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(customers).set(data).where(eq(customers.id, id));
}

export async function getAllCustomers(): Promise<Customer[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(customers).orderBy(desc(customers.createdAt)).limit(500);
}

// ==================== Provisioning Log Queries ====================

export async function createProvisioningLog(data: InsertProvisioningLog): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(provisioningLogs).values(data);
}

export async function getProvisioningLogsByCustomer(customerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(provisioningLogs).where(eq(provisioningLogs.customerId, customerId)).orderBy(desc(provisioningLogs.createdAt)).limit(50);
}

export async function getAllProvisioningLogs() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(provisioningLogs).orderBy(desc(provisioningLogs.createdAt)).limit(200);
}

// ==================== Analytics Queries ====================

export async function trackEvent(data: Omit<InsertAnalyticsEvent, "id" | "createdAt">): Promise<void> {
  const db = await getDb();
  if (!db) return;
  try {
    await db.insert(analyticsEvents).values(data);
  } catch (error) {
    console.warn("[Analytics] Failed to track event:", error);
  }
}

export async function getAnalyticsSummary() {
  const db = await getDb();
  if (!db) return { totalEvents: 0, todayEvents: 0, topEvents: [], topPages: [] };
  
  const allEvents = await db.select().from(analyticsEvents).orderBy(desc(analyticsEvents.createdAt)).limit(1000);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEvents = allEvents.filter(e => e.createdAt && new Date(e.createdAt) >= today);
  
  // Count by event type
  const eventCounts: Record<string, number> = {};
  allEvents.forEach(e => {
    eventCounts[e.event] = (eventCounts[e.event] || 0) + 1;
  });
  const topEvents = Object.entries(eventCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([event, count]) => ({ event, count }));
  
  // Count by page
  const pageCounts: Record<string, number> = {};
  allEvents.forEach(e => {
    if (e.page) pageCounts[e.page] = (pageCounts[e.page] || 0) + 1;
  });
  const topPages = Object.entries(pageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([page, count]) => ({ page, count }));
  
  return {
    totalEvents: allEvents.length,
    todayEvents: todayEvents.length,
    topEvents,
    topPages,
  };
}

export async function getRecentEvents(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(analyticsEvents).orderBy(desc(analyticsEvents.createdAt)).limit(limit);
}
