import Stripe from "stripe";
import { ENV } from "./_core/env";

let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    if (!ENV.stripeSecretKey) throw new Error("STRIPE_SECRET_KEY is not configured");
    _stripe = new Stripe(ENV.stripeSecretKey);
  }
  return _stripe;
}

// Device tiers
export const DEVICE_TIERS = [
  { id: "1-connection", name: "1 Connection", devices: 1, description: "Perfect for personal use" },
  { id: "2-connections", name: "2 Connections", devices: 2, description: "Great for couples" },
  { id: "4-connections", name: "4 Connections", devices: 4, description: "Best for families" },
];

// Duration options
export const DURATIONS = [
  { id: "1-month", months: 1, label: "1 Month" },
  { id: "3-months", months: 3, label: "3 Months" },
  { id: "6-months", months: 6, label: "6 Months" },
  { id: "12-months", months: 12, label: "12 Months" },
];

// Price matrix: [devices][months] in cents
export const PRICE_MATRIX: Record<number, Record<number, number>> = {
  1: { 1: 1499, 3: 3499, 6: 5999, 12: 8999 },
  2: { 1: 2499, 3: 5999, 6: 9999, 12: 14999 },
  4: { 1: 3999, 3: 8999, 6: 14999, 12: 21999 },
};

// Build full plan list for frontend
export const PLANS = DEVICE_TIERS.flatMap((tier) =>
  DURATIONS.map((dur) => ({
    id: `${tier.devices}-device-${dur.months}-month`,
    tierId: tier.id,
    tierName: tier.name,
    devices: tier.devices,
    tierDescription: tier.description,
    months: dur.months,
    durationLabel: dur.label,
    price: PRICE_MATRIX[tier.devices][dur.months],
    interval: "month" as const,
    intervalCount: dur.months,
    features: [
      `${tier.devices} simultaneous stream${tier.devices > 1 ? "s" : ""}`,
      "20,000+ Live Channels",
      "100,000+ Movies & Shows",
      "HD & 4K Quality",
      "24/7 Support",
      ...(dur.months >= 6 ? [`Save ${dur.months === 6 ? "33" : "50"}%`] : []),
    ],
  }))
);

/**
 * Create a Stripe Checkout Session for a given plan.
 */
/**
 * Create a Stripe Customer Portal session for subscription management.
 */
export async function createPortalSession(customerEmail: string, returnUrl: string): Promise<string> {
  const stripe = getStripe();
  
  // Find the Stripe customer by email
  const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
  if (customers.data.length === 0) {
    throw new Error("No subscription found for this email. Please check the email address used during purchase.");
  }
  
  const session = await stripe.billingPortal.sessions.create({
    customer: customers.data[0].id,
    return_url: returnUrl,
  });
  
  return session.url;
}

export async function createCheckoutSession(planId: string, successUrl: string, cancelUrl: string): Promise<string> {
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan) throw new Error(`Invalid plan: ${planId}`);

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "gbp",
          product_data: {
            name: `Viewora TV — ${plan.tierName} (${plan.durationLabel})`,
            description: `Premium streaming subscription: ${plan.devices} device${plan.devices > 1 ? "s" : ""}, ${plan.durationLabel.toLowerCase()} billing`,
          },
          recurring: {
            interval: plan.interval,
            interval_count: plan.intervalCount,
          },
          unit_amount: plan.price,
        },
        quantity: 1,
      },
    ],
    metadata: {
      devices: String(plan.devices),
      months: String(plan.months),
      tier_name: plan.tierName,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    billing_address_collection: "auto",
  });

  return session.url || "";
}
