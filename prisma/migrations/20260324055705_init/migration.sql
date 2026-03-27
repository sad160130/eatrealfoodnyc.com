-- CreateTable
CREATE TABLE "restaurants" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT,
    "borough" TEXT,
    "neighborhood" TEXT,
    "address" TEXT NOT NULL,
    "street" TEXT,
    "city" TEXT,
    "state" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "rating" DOUBLE PRECISION,
    "reviews" INTEGER DEFAULT 0,
    "price_range" INTEGER,
    "dietary_tags" TEXT,
    "inspection_grade" TEXT,
    "inspection_date" TEXT,
    "inspection_score" INTEGER,
    "description" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "working_hours" TEXT,
    "photo" TEXT,
    "street_view" TEXT,
    "business_status" TEXT DEFAULT 'OPERATIONAL',
    "is_hidden_gem" BOOLEAN NOT NULL DEFAULT false,
    "email" TEXT,
    "company_facebook" TEXT,
    "company_instagram" TEXT,
    "company_linkedin" TEXT,
    "company_x" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "neighborhood_content" (
    "id" SERIAL NOT NULL,
    "borough" TEXT NOT NULL,
    "neighborhood" TEXT NOT NULL,
    "intro" TEXT,
    "faqs" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "neighborhood_content_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "restaurants_slug_key" ON "restaurants"("slug");

-- CreateIndex
CREATE INDEX "restaurants_borough_idx" ON "restaurants"("borough");

-- CreateIndex
CREATE INDEX "restaurants_neighborhood_idx" ON "restaurants"("neighborhood");

-- CreateIndex
CREATE INDEX "restaurants_rating_idx" ON "restaurants"("rating" DESC);

-- CreateIndex
CREATE INDEX "restaurants_borough_neighborhood_idx" ON "restaurants"("borough", "neighborhood");

-- CreateIndex
CREATE INDEX "restaurants_is_hidden_gem_idx" ON "restaurants"("is_hidden_gem");

-- CreateIndex
CREATE INDEX "restaurants_inspection_grade_idx" ON "restaurants"("inspection_grade");

-- CreateIndex
CREATE UNIQUE INDEX "neighborhood_content_borough_neighborhood_key" ON "neighborhood_content"("borough", "neighborhood");
