# Work Notes — Viewora TV Readiness Audit

## Current State (verified)
- Stripe checkout: subscription mode ✓, GBP currency ✓, monthly recurring ✓
- Plans: 1-conn £14.99, 2-conn £24.99, 4-conn £39.99 (only 1-month shown)
- Webhook handles: checkout.session.completed ✓, invoice.paid ✓
- Missing webhook handlers: invoice.payment_failed, customer.subscription.updated, customer.subscription.deleted
- Customer data saved: email, name, stripeCustomerId, stripeSubscriptionId, stripePriceId, planName, xtreamUsername, xtreamPassword, xtreamUrl, status, subscriptionStart, subscriptionEnd, country, notes
- Missing from saved data: connectionCount as explicit field (derived from notes JSON), billingInterval as explicit field
- Duplicate protection: checks existing customer by subscriptionId ✓
- Multi-device: provisions correct number of accounts ✓

## Remaining Implementation
1. Add webhook handlers for: invoice.payment_failed, customer.subscription.updated, customer.subscription.deleted
2. Add Stripe Customer Portal link (success page, email, account area)
3. Trial: keep FAQ saying no free trials, add limited trial language if needed
4. WhatsApp: currently group link (https://chat.whatsapp.com/DzL8dDYSjOTE3j59PKP0qf) — flag as recommendation
5. Setup page: add Telegram/WhatsApp buttons at top and bottom
6. Footer: verify all links present
7. Analytics: add view_pricing, begin_checkout, checkout_started, purchase_success, purchase_failed events
8. Compliance scan: search for risky terms
9. SEO pages: /firestick-setup, /smart-tv-setup, /android-setup, /iphone-ipad-setup, /web-player-login, /fix-buffering
10. Final build/test verification

## Key URLs
- Telegram: https://t.me/+EbGpQ2NZyhhhMzYx
- WhatsApp: https://chat.whatsapp.com/DzL8dDYSjOTE3j59PKP0qf
- Web Player: http://162.0.216.135/playlists
- Xtream API: https://8k.cms-only.ru/api/api.php
- Domain: vieworatv.live
