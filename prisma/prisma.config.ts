import path from "node:path";
import { existsSync } from "node:fs";
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env.local only if it exists (local dev). On Vercel, env vars are injected.
const envPath = path.join(__dirname, "..", ".env.local");
if (existsSync(envPath)) {
  config({ path: envPath });
}

export default defineConfig({
  schema: path.join(__dirname, "schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL ?? "",
    shadowDatabaseUrl: process.env.DIRECT_URL,
  },
});
