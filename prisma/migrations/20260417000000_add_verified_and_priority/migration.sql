-- AlterTable
ALTER TABLE "restaurants" ADD COLUMN "is_verified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "restaurants" ADD COLUMN "priority_rank" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "restaurants_priority_rank_rating_idx" ON "restaurants"("priority_rank" DESC, "rating" DESC);
