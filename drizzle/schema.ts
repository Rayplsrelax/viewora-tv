import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, bigint, boolean } from "drizzle-orm/mysql-core";

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

/**
 * Trial leads — captures every trial request for Hermes follow-up.
 */
export const trialLeads = mysqlTable("trial_leads", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  telegram: varchar("telegram", { length: 255 }),
  whatsapp: varchar("whatsapp", { length: 64 }),
  country: varchar("country", { length: 64 }),
  deviceType: varchar("deviceType", { length: 64 }),
  preferredSupportChannel: mysqlEnum("preferredSupportChannel", ["telegram", "whatsapp", "email"]).default("telegram"),
  source: varchar("source", { length: 128 }),
  utmSource: varchar("utmSource", { length: 128 }),
  utmMedium: varchar("utmMedium", { length: 128 }),
  utmCampaign: varchar("utmCampaign", { length: 128 }),
  utmContent: varchar("utmContent", { length: 128 }),
  referrer: text("referrer"),
  landingPage: varchar("landingPage", { length: 512 }),
  affiliateCode: varchar("affiliateCode", { length: 64 }),
  consentToFollowup: int("consentToFollowup").default(0),
  status: mysqlEnum("status", ["requested", "waitlisted", "approved", "credentials_sent", "activated", "converted", "expired", "disqualified"]).default("requested").notNull(),
  trialStartAt: bigint("trialStartAt", { mode: "number" }),
  trialEndAt: bigint("trialEndAt", { mode: "number" }),
  followUpDueAt: bigint("followUpDueAt", { mode: "number" }),
  convertedCustomerId: int("convertedCustomerId"),
  convertedSubscriptionId: varchar("convertedSubscriptionId", { length: 128 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Follow-up tasks — queue for Hermes agent to process.
 */
export const followUpTasks = mysqlTable("follow_up_tasks", {
  id: int("id").autoincrement().primaryKey(),
  taskType: mysqlEnum("taskType", ["trial_request", "trial_setup_check", "trial_expiry", "trial_conversion", "payment_failed", "cancellation_reason", "winback", "affiliate_reward", "renewal_reminder"]).notNull(),
  relatedTrialLeadId: int("relatedTrialLeadId"),
  relatedCustomerId: int("relatedCustomerId"),
  relatedSubscriptionId: varchar("relatedSubscriptionId", { length: 128 }),
  relatedAffiliateId: int("relatedAffiliateId"),
  dueAt: bigint("dueAt", { mode: "number" }).notNull(),
  priority: mysqlEnum("priority", ["urgent", "high", "normal", "low"]).default("normal").notNull(),
  channel: mysqlEnum("channel", ["telegram", "whatsapp", "email", "admin_only"]).default("telegram").notNull(),
  status: mysqlEnum("status", ["queued", "drafted", "sent", "skipped", "failed", "completed"]).default("queued").notNull(),
  messageTemplateKey: varchar("messageTemplateKey", { length: 64 }),
  messageBody: text("messageBody"),
  hermesNotes: text("hermesNotes"),
  lastError: text("lastError"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Hermes events — event log for agent processing.
 */
export const hermesEvents = mysqlTable("hermes_events", {
  id: int("id").autoincrement().primaryKey(),
  eventType: varchar("eventType", { length: 64 }).notNull(),
  source: mysqlEnum("source", ["app", "stripe", "admin", "hermes", "telegram", "whatsapp"]).default("app").notNull(),
  payloadJson: text("payloadJson"),
  processed: int("processed").default(0),
  processedAt: timestamp("processedAt"),
  error: text("error"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Affiliates — referral partners who earn service credits.
 */
export const affiliates = mysqlTable("affiliates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  telegram: varchar("telegram", { length: 255 }),
  whatsapp: varchar("whatsapp", { length: 64 }),
  referralCode: varchar("referralCode", { length: 64 }).notNull().unique(),
  status: mysqlEnum("status", ["pending", "active", "paused", "banned"]).default("pending").notNull(),
  rewardType: varchar("rewardType", { length: 32 }).default("service_credit"),
  customerId: int("customerId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Referrals — tracks each referral click/conversion.
 */
export const referrals = mysqlTable("referrals", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliateId").notNull(),
  referralCode: varchar("referralCode", { length: 64 }).notNull(),
  visitorId: varchar("visitorId", { length: 128 }),
  trialLeadId: int("trialLeadId"),
  customerId: int("customerId"),
  stripeCustomerId: varchar("stripeCustomerId", { length: 128 }),
  subscriptionId: varchar("subscriptionId", { length: 128 }),
  firstPaymentAmount: int("firstPaymentAmount"),
  status: mysqlEnum("status", ["clicked", "trial_requested", "purchased", "active_14_days", "credit_due", "credit_applied", "rejected"]).default("clicked").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Service credits — rewards for affiliates/referrers.
 */
export const serviceCredits = mysqlTable("service_credits", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliateId"),
  customerId: int("customerId"),
  referralId: int("referralId"),
  creditType: mysqlEnum("creditType", ["stripe_customer_balance", "free_month_manual", "renewal_credit_manual"]).default("renewal_credit_manual").notNull(),
  creditValueGbp: int("creditValueGbp"),
  creditMonths: int("creditMonths"),
  status: mysqlEnum("status", ["pending", "approved", "applied", "rejected"]).default("pending").notNull(),
  applyAfterDate: bigint("applyAfterDate", { mode: "number" }),
  appliedAt: timestamp("appliedAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TrialLead = typeof trialLeads.$inferSelect;
export type InsertTrialLead = typeof trialLeads.$inferInsert;
export type FollowUpTask = typeof followUpTasks.$inferSelect;
export type InsertFollowUpTask = typeof followUpTasks.$inferInsert;
export type HermesEvent = typeof hermesEvents.$inferSelect;
export type InsertHermesEvent = typeof hermesEvents.$inferInsert;
export type Affiliate = typeof affiliates.$inferSelect;
export type InsertAffiliate = typeof affiliates.$inferInsert;
export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;
export type ServiceCredit = typeof serviceCredits.$inferSelect;
export type InsertServiceCredit = typeof serviceCredits.$inferInsert;
