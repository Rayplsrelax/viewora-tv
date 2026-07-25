import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, bigint } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

/**
 * Customers table — tracks every paying customer and their IPTV credentials.
 */
export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  name: varchar("name", { length: 255 }),
  stripeCustomerId: varchar("stripeCustomerId", { length: 128 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 128 }),
  stripePriceId: varchar("stripePriceId", { length: 128 }),
  planName: varchar("planName", { length: 64 }),
  /** Xtream Code credentials */
  xtreamUsername: varchar("xtreamUsername", { length: 128 }),
  xtreamPassword: varchar("xtreamPassword", { length: 128 }),
  xtreamUrl: text("xtreamUrl"),
  /** Subscription status */
  status: mysqlEnum("status", ["active", "cancelled", "expired", "pending"]).default("pending").notNull(),
  /** Subscription dates stored as UTC timestamps (ms) */
  subscriptionStart: bigint("subscriptionStart", { mode: "number" }),
  subscriptionEnd: bigint("subscriptionEnd", { mode: "number" }),
  /** Metadata */
  country: varchar("country", { length: 8 }).default("dk"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Provisioning logs — audit trail for every API call and email sent.
 */
export const provisioningLogs = mysqlTable("provisioning_logs", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId"),
  eventType: varchar("eventType", { length: 64 }).notNull(),
  stripeEventId: varchar("stripeEventId", { length: 128 }),
  action: varchar("action", { length: 32 }).notNull(), // 'new' | 'renew' | 'email_sent' | 'error'
  requestPayload: text("requestPayload"),
  responsePayload: text("responsePayload"),
  success: int("success").default(0),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Analytics events — tracks user actions for funnel analysis.
 */
export const analyticsEvents = mysqlTable("analytics_events", {
  id: int("id").autoincrement().primaryKey(),
  event: varchar("event", { length: 64 }).notNull(),
  page: varchar("page", { length: 255 }),
  planId: varchar("planId", { length: 64 }),
  referrer: text("referrer"),
  utmSource: varchar("utmSource", { length: 128 }),
  utmMedium: varchar("utmMedium", { length: 128 }),
  utmCampaign: varchar("utmCampaign", { length: 128 }),
  utmContent: varchar("utmContent", { length: 128 }),
  sessionId: varchar("sessionId", { length: 64 }),
  userAgent: text("userAgent"),
  ip: varchar("ip", { length: 64 }),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;
export type ProvisioningLog = typeof provisioningLogs.$inferSelect;
export type InsertProvisioningLog = typeof provisioningLogs.$inferInsert;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = typeof analyticsEvents.$inferInsert;
