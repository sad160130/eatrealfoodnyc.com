-- Advertising label only. NULL means the restaurant is not a partner.
-- This column must never be used to compute rating, reviews, inspection_grade,
-- inspection_score, dietary_tags, is_hidden_gem, Health Score, or organic sort.
-- No existing row is marked as a partner. Do not backfill.

CREATE TYPE "partner_status" AS ENUM ('partner', 'sponsored');

ALTER TABLE "restaurants" ADD COLUMN "partner_status" "partner_status";

COMMENT ON COLUMN "restaurants"."partner_status" IS
  'Advertising label only (partner or sponsored). NULL means not a partner. Must never affect rating, inspection grade, Health Score, dietary tags, hidden-gem status, or organic sort order.';
