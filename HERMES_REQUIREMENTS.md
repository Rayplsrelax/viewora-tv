# Hermes Agent Requirements Summary

## Integration Pattern
Pattern C (Human-approval mode) — Hermes creates message drafts in admin dashboard with copy/send buttons. Admin marks sent/replied/converted. Can upgrade to Pattern B (cron/polling) later.

## Database Tables Needed

### trial_leads
id, name, email, telegram, whatsapp, country, device_type, preferred_support_channel, source, utm_source, utm_medium, utm_campaign, utm_content, referrer, landing_page, affiliate_code, consent_to_followup, status (requested/waitlisted/approved/credentials_sent/activated/converted/expired/disqualified), trial_start_at, trial_end_at, follow_up_due_at, converted_customer_id, converted_subscription_id, notes, created_at, updated_at

### follow_up_tasks
id, task_type (trial_request/trial_setup_check/trial_expiry/trial_conversion/payment_failed/cancellation_reason/winback/affiliate_reward/renewal_reminder), related_trial_lead_id, related_customer_id, related_subscription_id, related_affiliate_id, due_at, priority (urgent/high/normal/low), channel (telegram/whatsapp/email/admin_only), status (queued/drafted/sent/skipped/failed/completed), message_template_key, message_body, hermes_notes, last_error, created_at, updated_at

### hermes_events
id, event_type, source (app/stripe/admin/hermes/telegram/whatsapp), payload_json, processed, processed_at, error, created_at

### affiliates
id, name, email, telegram, whatsapp, referral_code, status (pending/active/paused/banned), reward_type (service_credit), created_at, updated_at

### referrals
id, affiliate_id, referral_code, visitor_id, trial_lead_id, customer_id, stripe_customer_id, subscription_id, first_payment_amount, status (clicked/trial_requested/purchased/active_14_days/credit_due/credit_applied/rejected), created_at, updated_at

### service_credits
id, affiliate_id, customer_id, referral_id, credit_type (stripe_customer_balance/free_month_manual/renewal_credit_manual), credit_value_gbp, credit_months, status (pending/approved/applied/rejected), apply_after_date, applied_at, notes, created_at, updated_at

## Trial System
- Max 10 approved/active trials per calendar day
- 24-hour duration
- CTA on homepage, pricing, setup, contact, footer
- Form collects: name, email, telegram, whatsapp, country, device_type, preferred_support_channel, affiliate_code, consent

## Follow-up Schedule
1. Immediate confirmation after trial request
2. Trial approved / credentials sent
3. 2-hour setup check-in
4. 20-hour expiry reminder
5. Trial expired conversion offer
6. 2-day final follow-up

## Winback Schedule
1. Immediate cancellation confirmation
2. 3-day cancellation reason ask
3. 7-day support/winback message
4. 21-day reactivation message

## Affiliate Rewards
- Refer 1 paid customer (active 14 days) = service credit toward next invoice
- Refer 3 paid customers (active 14 days) = 1 free month
- Use Stripe customer balance if possible, otherwise manual credits
- Ref link format: https://vieworatv.live/?ref=CODE
- Store ref in cookie/localStorage 30 days

## Hermes API Endpoints
All REST endpoints below are protected with `HERMES_AGENT_API_KEY` via either `x-hermes-api-key: <key>` or `Authorization: Bearer <key>`.

### Follow-up Tasks
- GET /api/admin/hermes/tasks/due
- GET /api/admin/hermes/tasks
- POST /api/admin/hermes/tasks/:id/draft
- POST /api/admin/hermes/tasks/:id/mark-sent
- POST /api/admin/hermes/tasks/:id/skip
- POST /api/admin/hermes/tasks/:id/complete

### Summaries and Events
- GET /api/admin/hermes/daily-summary
- GET /api/admin/hermes/events
- POST /api/admin/hermes/events

### Affiliates, Trials, and Service Credits
- GET /api/admin/hermes/affiliates
- GET /api/admin/hermes/trials
- GET /api/admin/hermes/credits/pending
- GET /api/admin/hermes/affiliate-credits-due (compatibility alias)
- POST /api/admin/hermes/credits/:id/apply
- POST /api/admin/hermes/service-credit/:id/apply (compatibility alias)
- POST /api/admin/hermes/credits/:id/reject

## Message Templates
See pasted_content_3.txt for all template text (trial confirmation, waitlist, approved, 2h check, 20h reminder, expired conversion, payment failed, cancellation confirmation, 3-day reason, 7-day winback, 21-day reactivation)
