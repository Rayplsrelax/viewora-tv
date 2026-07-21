import Stripe from "stripe";
import { ENV } from "./_core/env";

const stripe = new Stripe(ENV.stripeSecretKey);

// Plan configurations
export const PLANS = [
  {
    id: "1-month",
    name: "1 Month",
    price: 1499, // cents
    interval: "month" as const,
    intervalCount: 1,
    features: ["20,000+ Live Channels", "100,000+ Movies", "50,000+ TV Shows", "HD & 4K Quality", "24/7 Support"],
    popular: false,
  },
  {
    id: "3-month",
    name: "3 Months",
    price: 3499, // cents
    interval: "month" as const,
    intervalCount: 3,
    features: ["20,000+ Live Channels", "100,000+ Movies", "50,000+ TV Shows", "HD & 4K Quality", "24/7 Support", "Save 22%"],
    popular: false,
  },
  {
    id: "6-month",
    name: "6 Months",
    price: 5999, // cents
    interval: "month" as const,
    intervalCount: 6,
    features: ["20,000+ Live Channels", "100,000+ Movies", "50,000+ TV Shows", "HD & 4K Quality", "24/7 Support", "Save 33%"],
    popular: true,
  },
  {
    id: "12-month",
    name: "12 Months",
    price: 8999, // cents
    interval: "month" as const,
    intervalCount: 12,
    features: ["20,000+ Live Channels", "100,000+ Movies", "50,000+ TV Shows", "HD & 4K Quality", "24/7 Support", "Save 50%"],
    popular: false,
  },
];

/**
 * Create a Stripe Checkout Session for a given plan.
 */
export async function createCheckoutSession(planId: string, successUrl: string, cancelUrl: string): Promise<string> {
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan) throw new Error(`Invalid plan: ${planId}`);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Viewora TV — ${plan.name}`,
            description: `Premium IPTV subscription with ${plan.name.toLowerCase()} billing`,
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
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_creation: "always",
    billing_address_collection: "auto",
  });

  return session.url || "";
}
