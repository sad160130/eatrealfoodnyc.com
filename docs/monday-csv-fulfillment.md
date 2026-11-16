# NYC Restaurant Compliance Weekly: Monday CSV fulfillment

The webhook and the Monday cron are implemented. Checkout buttons stay in the unmerged payment-link pull request. This code does not create a Stripe charge.

`STRIPE_SECRET_KEY` is a restricted live key with read access to Customers, Subscriptions, Checkout Sessions, Prices, Products, and Invoices. `src/lib/stripe-read.ts` only issues GET requests. It does not create, update, or cancel Stripe objects. Subscriber rows are written in our database.

## Env vars

Set on the Vercel project for Production and Preview. Do not commit the values.

| Name | Value in use |
| --- | --- |
| `STRIPE_SECRET_KEY` | Restricted read-only key. |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for endpoint `we_1UcDBqHcL01LkckafoJfD6Lk`, URL `https://www.eatrealfoodnyc.com/api/stripe/compliance-weekly`. |
| `STRIPE_PRICE_MONTHLY` | `price_1UcCAkHcL01LkckajruZhxpO` |
| `STRIPE_PRICE_YEARLY` | `price_1UcCAlHcL01Lkckav1bckNHc` |
| `RESEND_API_KEY` | Sends the Monday email. |
| `CRON_SECRET` | Required `Authorization: Bearer` value. Vercel Cron sends this when the env var is set. |

`DATABASE_URL` is already set. `eatrealfoodnyc.com` must be verified in Resend so `compliance@eatrealfoodnyc.com` can send.

The code reads the price ids from the env vars. It does not hardcode them.

## Webhook

`POST /api/stripe/compliance-weekly` reads the raw body and checks `Stripe-Signature` with `STRIPE_WEBHOOK_SECRET`. A bad or stale signature returns 400 and writes nothing.

Handled events:

- `checkout.session.completed` when `mode` is `subscription`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

Any other event, a one-time checkout, an invoice with no subscription, or a price other than `STRIPE_PRICE_MONTHLY` or `STRIPE_PRICE_YEARLY` returns 200 and writes nothing.

A matching subscription is upserted on `stripe_subscription_id` with `stripe_customer_id`, `email`, `plan` (`monthly` or `yearly`), the Stripe `status`, and `current_period_end`. The status is stored as Stripe reports it after a read. A failed invoice does not cancel the subscription in Stripe.

## Monday cron

`vercel.json` schedules `GET /api/cron/compliance-weekly` at `0 13 * * 1` (08:00 America/New_York standard time, 09:00 daylight time). The route returns 401 unless `Authorization` is `Bearer ${CRON_SECRET}`.

For subscribers whose `status` is `active`, it builds both CSVs once and sends one plain-text email per subscriber through Resend. Subject: `NYC Restaurant Compliance Weekly, {Mon D, YYYY}`. The body names the extract time, `inspection-leads.csv`, `new-openings.csv`, and NYC Open Data dataset `43nn-pn8j`.

`compliance_weekly_sends` is unique on `stripe_subscription_id` plus the Monday date in America/New_York. The row is inserted only after Resend accepts the email. A retry the same Monday skips recorded subscriptions. A Resend failure leaves that subscription unrecorded and continues with the rest.

## The two files

Both files are built from the live `restaurants` table. They do not invent rows. Street addresses are included because this is the paid file.

`inspection-leads.csv` includes a row when any of these is true:

- `inspection_grade` is `Z` or `P`
- `inspection_score` is 28 or more
- `business_status` is present and is not `OPERATIONAL`

`lead_type` joins the matching reasons with `|`: `grade-pending`, `high-score`, `not-operational`.

Columns: `lead_type`, `name`, `address`, `borough`, `neighborhood`, `phone`, `inspection_grade`, `inspection_score`, `inspection_date`, `business_status`.

`new-openings.csv` includes a published operational restaurant with no inspection date and no A, B, or C.

Columns: `name`, `address`, `borough`, `neighborhood`, `phone`, `pre_permit`, `inspection_grade`, `inspection_date`.

`pre_permit` is empty. There is no pre-permit column to copy.

## Checkout pull request

The payment links stay in the checkout pull request:

- Monthly `https://buy.stripe.com/14A6oHbt93sc7sqgu1cV203` uses `STRIPE_PRICE_MONTHLY`
- Yearly `https://buy.stripe.com/5kQ9AT7cT5Ak4ge3HfcV204` uses `STRIPE_PRICE_YEARLY`
- Stripe returns the buyer to `/data?subscribed=1`

This pull request does not change those links. The two branches edit different files, so they can merge in either order. Merge this one first if the buttons should not go live before the webhook is deployed.
