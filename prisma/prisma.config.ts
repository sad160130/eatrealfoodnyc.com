import path from "node:path";
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env.local for local dev; on Vercel, env vars are injected automatically
config({ path: path.join(__dirname, "..", ".env.local"), override: false });

export default defineConfig({
  schema: path.join(__dirname, "schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL ?? "",
    shadowDatabaseUrl: process.env.DIRECT_URL,
  },
});
