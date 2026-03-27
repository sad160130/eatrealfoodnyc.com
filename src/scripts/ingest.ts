import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

config({ path: path.join(__dirname, "..", "..", ".env.local") });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function parseFloat_(val: string): number | null {
  if (!val || val.trim() === "") return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

function parseInt_(val: string): number | null {
  if (!val || val.trim() === "") return null;
  const n = parseInt(val, 10);
  return isNaN(n) ? null : n;
}

function emptyToNull(val: string): string | null {
  if (!val || val.trim() === "") return null;
  return val.trim();
}

function parseBool(val: string): boolean {
  return val?.trim().toLowerCase() === "true";
}

async function main() {
  const csvPath = path.join(__dirname, "..", "..", "data", "NYC_Healthy_Restaurants_Final_v2.csv");
  const csvContent = fs.readFileSync(csvPath, "utf-8");

  const rows: Record<string, string>[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
  });

  console.log(`Total rows in CSV: ${rows.length}`);

  let successCount = 0;
  const errors: { name: string; error: string }[] = [];
  const BATCH_SIZE = 100;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);

    const results = await Promise.all(
      batch.map(async (row) => {
        try {
          const priceRange = parseInt_(row.price_range);
          const data = {
            name: row.name,
            type: emptyToNull(row.type),
            borough: emptyToNull(row.borough),
            neighborhood: emptyToNull(row.neighborhood),
            address: row.address,
            street: emptyToNull(row.street),
            city: emptyToNull(row.city),
            state: emptyToNull(row.state),
            latitude: parseFloat_(row.latitude),
            longitude: parseFloat_(row.longitude),
            rating: parseFloat_(row.rating),
            reviews: parseInt_(row.reviews),
            ...(priceRange != null ? { price_range: priceRange } : {}),
            dietary_tags: emptyToNull(row.dietary_tags),
            inspection_grade: emptyToNull(row.inspection_grade),
            inspection_date: emptyToNull(row.inspection_date),
            inspection_score: parseInt_(row.inspection_score),
            description: emptyToNull(row.description),
            phone: emptyToNull(row.phone),
            website: emptyToNull(row.website),
            working_hours: emptyToNull(row.working_hours),
            photo: emptyToNull(row.photo),
            street_view: emptyToNull(row.street_view),
            business_status: emptyToNull(row.business_status) ?? "OPERATIONAL",
            is_hidden_gem: parseBool(row.is_hidden_gem),
            email: emptyToNull(row.email),
            company_facebook: emptyToNull(row.company_facebook),
            company_instagram: emptyToNull(row.company_instagram),
            company_linkedin: emptyToNull(row.company_linkedin),
            company_x: emptyToNull(row.company_x),
          };

          await prisma.restaurant.upsert({
            where: { slug: row.slug },
            update: data,
            create: { slug: row.slug, ...data },
          });

          return { success: true };
        } catch (err: any) {
          return { success: false, name: row.name, error: err.message };
        }
      })
    );

    for (const r of results) {
      if (r.success) {
        successCount++;
      } else {
        errors.push({ name: r.name!, error: r.error! });
        console.error(`Error on "${r.name}": ${r.error}`);
      }
    }

    const processed = Math.min(i + BATCH_SIZE, rows.length);
    if (processed % 500 === 0 || processed === rows.length) {
      console.log(`Processed ${processed} / ${rows.length}`);
    }
  }

  console.log("\n=== Ingest Summary ===");
  console.log(`Total rows processed: ${rows.length}`);
  console.log(`Successful upserts:   ${successCount}`);
  console.log(`Errors:               ${errors.length}`);
  if (errors.length > 0) {
    console.log("\nFailed rows:");
    for (const e of errors) {
      console.log(`  - ${e.name}: ${e.error}`);
    }
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
