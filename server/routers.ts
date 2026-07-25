import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createCheckoutSession, PLANS, createPortalSession } from "./stripe-checkout";
import { hermesRouter } from "./hermes-router";
import { getAllCustomers, getProvisioningLogsByCustomer, getAllProvisioningLogs, trackEvent, getAnalyticsSummary, getRecentEvents } from "./db";
import { TRPCError } from "@trpc/server";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  plans: router({
    list: publicProcedure.query(() => {
      return PLANS.map((p) => ({
        id: p.id,
        tierId: p.tierId,
        tierName: p.tierName,
        devices: p.devices,
        tierDescription: p.tierDescription,
        months: p.months,
        durationLabel: p.durationLabel,
        price: p.price,
        interval: p.interval,
        intervalCount: p.intervalCount,
        features: p.features,
      }));
    }),
  }),

  checkout: router({
    create: publicProcedure
      .input(z.object({ planId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const baseUrl = `${ctx.req.protocol}://${ctx.req.get("host")}`;
        const successUrl = `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${baseUrl}/#pricing`;
        const url = await createCheckoutSession(input.planId, successUrl, cancelUrl);
        return { url };
      }),
    portal: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input, ctx }) => {
        const baseUrl = `${ctx.req.protocol}://${ctx.req.get("host")}`;
        const url = await createPortalSession(input.email, baseUrl);
        return { url };
      }),
  }),

  analytics: router({
    track: publicProcedure
      .input(z.object({
        event: z.string(),
        page: z.string().optional(),
        planId: z.string().optional(),
        referrer: z.string().optional(),
        utmSource: z.string().optional(),
        utmMedium: z.string().optional(),
        utmCampaign: z.string().optional(),
        utmContent: z.string().optional(),
        sessionId: z.string().optional(),
        metadata: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const userAgent = ctx.req.get("user-agent") || "";
        const ip = ctx.req.get("x-forwarded-for") || ctx.req.ip || "";
        await trackEvent({ ...input, userAgent, ip });
        return { success: true };
      }),
  }),

  hermes: hermesRouter,

  admin: router({
    customers: adminProcedure.query(async () => {
      return getAllCustomers();
    }),
    customerLogs: adminProcedure
      .input(z.object({ customerId: z.number() }))
      .query(async ({ input }) => {
        return getProvisioningLogsByCustomer(input.customerId);
      }),
    allLogs: adminProcedure.query(async () => {
      return getAllProvisioningLogs();
    }),
    analyticsSummary: adminProcedure.query(async () => {
      return getAnalyticsSummary();
    }),
    recentEvents: adminProcedure
      .input(z.object({ limit: z.number().min(1).max(200).default(50) }))
      .query(async ({ input }) => {
        return getRecentEvents(input.limit);
      }),
  }),
});

export type AppRouter = typeof appRouter;
