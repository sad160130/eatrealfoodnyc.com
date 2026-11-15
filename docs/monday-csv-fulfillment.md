# NYC Restaurant Compliance Weekly: Monday CSV fulfillment

This is a spec. It does not send email, charge anyone, or turn on the Stripe Payment Links. Those links stay in the unmerged checkout pull request until a Monday send has succeeded once.

## What is missing

`/data` describes a Monday email with two CSVs. Nothing in the repo sends it.

- There is no `vercel.json` cron.
- There is no Stripe webhook. A return to `/data?subscribed=1` does not include the buyer’s email.
- There is no Resend (or any other) mailer. Vercel has no `RESEND_API_KEY`.
- The early-access form writes a `data_waitlist` row. That is not a paid subscriber list.
- The directory has no pre-permit column. The openings file can name that column and leave it empty.

## Smallest reliable design

Two pieces, in this order.

### 1. Stripe webhook records who paid

`POST /api/stripe/compliance-weekly` verifies the Stripe signature and upserts one row per subscription.

Listen for:

- `checkout.session.completed` when the session mode is `subscription`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Store only these fields:

| Column | Source |
| --- | --- |
| `stripe_customer_id` | subscription customer |
| `stripe_subscription_id` | unique |
| `email` | customer email |
| `plan` | `monthly` or `yearly`, matched to the price ids below |
| `status` | Stripe status (`active`, `past_due`, `canceled`, and the other Stripe statuses as stored) |
| `current_period_end` | Stripe timestamp |

Ignore any other product. A signature failure returns 400 and writes nothing.

The table is applied on Supabase by hand, the same way `catering_leads` was. The Vercel build does not run migrations.

### 2. Monday cron builds the files once and emails active subscribers

`vercel.json`:

```json
{ "crons": [{ "path": "/api/cron/compliance-weekly", "schedule": "0 13 * * 1" }] }
```

`0 13 * * 1` is 08:00 America/New_York in standard time and 09:00 in daylight time. One UTC hour is simpler than a second job for the clock change.

The route rejects any request whose `Authorization` header is not `Bearer ${CRON_SECRET}`.

On each run:

1. Build both CSVs once. Do not rebuild them per recipient.
2. Select subscribers whose `status` is `active`.
3. Send one email per subscriber through Resend, with both CSVs attached.
4. Record `stripe_subscription_id` plus the Monday date in `compliance_weekly_sends`, unique on that pair. A retry the same Monday skips anyone already recorded.
5. If Resend fails for one address, leave that send unrecorded and continue with the rest. The next Monday retries only the people who were not recorded.

The email is plain text. Subject: `NYC Restaurant Compliance Weekly, {Mon D, YYYY}`. Body names the extract date, the two filenames, and the NYC Open Data dataset `43nn-pn8j`. It does not quote traffic or promise a grade change.

From address, after the domain is verified: `compliance@eatrealfoodnyc.com`.

## The two files

Both files use the live `restaurants` table. They do not invent rows. Street addresses are included here because this is the paid file, not the public redacted sample.

`inspection-leads.csv`

A row is included when any of these is true:

- `inspection_grade` is `Z` or `P` (grade pending)
- `inspection_score` is 28 or more (the city’s Grade C threshold)
- `business_status` is present and is not `OPERATIONAL`

Columns: `lead_type`, `name`, `address`, `borough`, `neighborhood`, `phone`, `inspection_grade`, `inspection_score`, `inspection_date`, `business_status`.

`lead_type` may list more than one reason, separated by `|`.

`new-openings.csv`

A row is a published operational restaurant with no inspection date and no A, B, or C grade.

Columns: `name`, `address`, `borough`, `neighborhood`, `phone`, `pre_permit`, `inspection_grade`, `inspection_date`.

`pre_permit` is an empty column until the database has a real pre-permit flag. Do not guess it from the name or the grade.

## Keys we need before implementation

Set these on the Vercel project for Production (and Preview only if a test webhook is wanted). Do not commit them.

| Name | Who creates it | Why |
| --- | --- | --- |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys. A restricted key is enough: Customers read, Subscriptions read, Checkout Sessions read. | The cron and webhook look up the customer email and subscription status. |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Developers → Webhooks, after the route is deployed. Endpoint: `https://www.eatrealfoodnyc.com/api/stripe/compliance-weekly`. Events listed above. | Verifies that the event came from Stripe. |
| `STRIPE_PRICE_MONTHLY` | The `price_...` id on Payment Link `14A6oHbt93sc7sqgu1cV203`. | Marks a subscription as the $79 monthly plan. |
| `STRIPE_PRICE_YEARLY` | The `price_...` id on Payment Link `5kQ9AT7cT5Ak4ge3HfcV204`. | Marks a subscription as the $790 yearly plan. |
| `RESEND_API_KEY` | Resend → API keys. | Sends the Monday email. |
| `CRON_SECRET` | A long random string you choose. | Stops anyone else from calling the cron route. |

Also required, and not a Vercel secret: verify `eatrealfoodnyc.com` in Resend and add the DNS records Resend shows. Without that, `compliance@eatrealfoodnyc.com` cannot send.

Already present, do not rotate it for this: `DATABASE_URL`.

Not required: a Stripe publishable key, the Payment Link URLs themselves, or a second mail provider.

## What stays off until the first real send

Leave the Stripe buttons on `/data` disconnected until:

1. The webhook has stored one test subscription.
2. A manual cron call, with `CRON_SECRET`, has emailed that test address both CSVs.
3. The test send row is visible in `compliance_weekly_sends`.

Until then, `/data` should not tell a buyer that the Monday files are already going out.
