-- Paid Compliance Weekly subscribers and the Monday send log.
-- Idempotent so a database that already has the tables can still record this migration.

CREATE TABLE IF NOT EXISTS "compliance_subscriptions" (
    "id" SERIAL NOT NULL,
    "stripe_customer_id" TEXT NOT NULL,
    "stripe_subscription_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "current_period_end" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "compliance_subscriptions_stripe_subscription_id_key"
    ON "compliance_subscriptions"("stripe_subscription_id");

CREATE INDEX IF NOT EXISTS "compliance_subscriptions_status_idx"
    ON "compliance_subscriptions"("status");

CREATE TABLE IF NOT EXISTS "compliance_weekly_sends" (
    "id" SERIAL NOT NULL,
    "stripe_subscription_id" TEXT NOT NULL,
    "monday_date" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compliance_weekly_sends_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "compliance_weekly_sends_stripe_subscription_id_monday_date_key"
    ON "compliance_weekly_sends"("stripe_subscription_id", "monday_date");

CREATE INDEX IF NOT EXISTS "compliance_weekly_sends_monday_date_idx"
    ON "compliance_weekly_sends"("monday_date");
