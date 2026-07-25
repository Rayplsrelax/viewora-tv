/**
 * Hermes Agent message templates for trial follow-ups, winback, and notifications.
 */

export const HERMES_TEMPLATES = {
  // ==================== Trial Follow-up Templates ====================
  trial_confirmation: {
    key: "trial_confirmation",
    subject: "Trial Request Received",
    body: `Thanks for requesting a VieworaTV 24h test. Trial slots are limited each day and not guaranteed. We'll check availability and help confirm your device setup.`,
  },
  trial_waitlist: {
    key: "trial_waitlist",
    subject: "Trial Slots Full Today",
    body: `Trial slots are full today. We can still help check your device compatibility, or you can choose a paid plan at https://vieworatv.live.`,
  },
  trial_approved: {
    key: "trial_approved",
    subject: "Your 24h Trial is Ready",
    body: `Your 24h VieworaTV test is ready. Use the login details sent to you and follow the setup guide here: https://vieworatv.live/setup. Need help? Reply here.`,
  },
  trial_setup_check: {
    key: "trial_setup_check",
    subject: "Setup Check-in",
    body: `Just checking — did you get VieworaTV working on your device? Tell us what device you're using and what screen you're on if you need help.`,
  },
  trial_expiry_reminder: {
    key: "trial_expiry_reminder",
    subject: "Trial Ending Soon",
    body: `Your 24h VieworaTV test is almost finished. If everything is working, you can keep access active with a monthly plan here: https://vieworatv.live.`,
  },
  trial_expired_conversion: {
    key: "trial_expired_conversion",
    subject: "Trial Ended",
    body: `Your VieworaTV test has ended. If you want to keep access active, choose a subscription here: https://vieworatv.live. Message support if you need help choosing the right connection plan.`,
  },
  trial_final_followup: {
    key: "trial_final_followup",
    subject: "Last Chance",
    body: `Hi! Just following up — your VieworaTV trial ended a couple of days ago. If you're still interested, plans start from just £14.99/month: https://vieworatv.live. Let us know if you have any questions.`,
  },

  // ==================== Payment Failed Templates ====================
  payment_failed: {
    key: "payment_failed",
    subject: "Payment Issue",
    body: `Your VieworaTV renewal payment did not go through. To keep your access active, please update your payment method or contact support.`,
  },

  // ==================== Cancellation/Winback Templates ====================
  cancellation_confirmation: {
    key: "cancellation_confirmation",
    subject: "Cancellation Confirmed",
    body: `Your VieworaTV subscription cancellation has been received. Your access will remain active until the end of your current billing period. If you had setup or quality issues, message us and we'll help.`,
  },
  cancellation_reason_ask: {
    key: "cancellation_reason_ask",
    subject: "Quick Question",
    body: `Quick question — what made you cancel VieworaTV? Setup issue, price, buffering, not using it, or something else? Your feedback helps us improve.`,
  },
  winback_7day: {
    key: "winback_7day",
    subject: "We Can Help",
    body: `If you cancelled because of setup or connection issues, we can help fix it. Message us and we'll walk you through the best setup for your device.`,
  },
  winback_21day: {
    key: "winback_21day",
    subject: "Come Back to VieworaTV",
    body: `Want to restart VieworaTV? You can reactivate here: https://vieworatv.live. Message support if you want help choosing the right plan.`,
  },

  // ==================== Affiliate Templates ====================
  affiliate_credit_earned: {
    key: "affiliate_credit_earned",
    subject: "Referral Credit Earned",
    body: `Great news! Your referral has been active for 14 days. You've earned a service credit toward your next invoice. Check your affiliate dashboard for details.`,
  },
  affiliate_free_month: {
    key: "affiliate_free_month",
    subject: "Free Month Earned",
    body: `Amazing! You've referred 3 active customers. You've earned 1 free month of VieworaTV. The credit will be applied to your next billing cycle.`,
  },
} as const;

export type TemplateKey = keyof typeof HERMES_TEMPLATES;
