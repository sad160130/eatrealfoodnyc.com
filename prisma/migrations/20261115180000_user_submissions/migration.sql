-- Anonymous experience-form submissions. Idempotent so a database that
-- already received the table from src/scripts/create-user-submissions-table.ts
-- can still record this migration.

CREATE TABLE IF NOT EXISTS "user_submissions" (
    "id" SERIAL NOT NULL,
    "restaurant_slug" TEXT NOT NULL,
    "restaurant_name" TEXT NOT NULL DEFAULT '',
    "submission_type" TEXT NOT NULL DEFAULT 'experience',
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_submissions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "user_submissions_restaurant_slug_idx" ON "user_submissions"("restaurant_slug");
CREATE INDEX IF NOT EXISTS "user_submissions_status_idx" ON "user_submissions"("status");
