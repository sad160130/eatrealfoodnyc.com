import path from "node:path";
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

config({ path: path.join(__dirname, "..", "..", ".env.local") });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Add tsvector column
  console.log("Adding search_vector column...");
  await prisma.$executeRaw`
    ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS search_vector tsvector
  `;

  // 2. Populate search_vector for all rows
  console.log("Populating search_vector for all rows...");
  await prisma.$executeRaw`
    UPDATE restaurants
    SET search_vector = to_tsvector('english',
      coalesce(name, '') || ' ' ||
      coalesce(type, '') || ' ' ||
      coalesce(description, '') || ' ' ||
      coalesce(neighborhood, '') || ' ' ||
      coalesce(borough, '') || ' ' ||
      coalesce(dietary_tags, '')
    )
  `;

  // 3. Create GIN index for full-text search
  console.log("Creating GIN index on search_vector...");
  await prisma.$executeRaw`
    CREATE INDEX IF NOT EXISTS idx_restaurants_search_vector
    ON restaurants USING GIN(search_vector)
  `;

  // 4. Create additional performance indexes
  console.log("Creating additional indexes...");
  await prisma.$executeRaw`
    CREATE INDEX IF NOT EXISTS idx_restaurants_borough ON restaurants(borough)
  `;
  await prisma.$executeRaw`
    CREATE INDEX IF NOT EXISTS idx_restaurants_neighborhood ON restaurants(neighborhood)
  `;
  await prisma.$executeRaw`
    CREATE INDEX IF NOT EXISTS idx_restaurants_rating ON restaurants(rating DESC)
  `;
  await prisma.$executeRaw`
    CREATE INDEX IF NOT EXISTS idx_restaurants_dietary_tags ON restaurants(dietary_tags)
  `;
  await prisma.$executeRaw`
    CREATE INDEX IF NOT EXISTS idx_restaurants_inspection_grade ON restaurants(inspection_grade)
  `;
  await prisma.$executeRaw`
    CREATE INDEX IF NOT EXISTS idx_restaurants_is_hidden_gem ON restaurants(is_hidden_gem)
  `;

  // 5. Log row count with non-null search_vector
  const result = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*) as count FROM restaurants WHERE search_vector IS NOT NULL
  `;
  console.log(`\nRows with search_vector: ${result[0].count}`);

  console.log("Search index build complete.");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
