-- Catering requests from /catering. Idempotent so a database that already
-- has the table can still record this migration.

CREATE TABLE IF NOT EXISTS "catering_leads" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "event_date" DATE NOT NULL,
    "headcount" INTEGER NOT NULL,
    "place" TEXT NOT NULL,
    "dietary_needs" TEXT NOT NULL DEFAULT '',
    "budget" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "restaurant_slug" TEXT,
    "source_path" TEXT NOT NULL,
    "consent" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'new',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "catering_leads_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "catering_leads_status_idx" ON "catering_leads"("status");
CREATE INDEX IF NOT EXISTS "catering_leads_event_date_idx" ON "catering_leads"("event_date");
