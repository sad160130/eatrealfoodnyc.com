import "dotenv/config"
import { defineConfig } from "prisma/config"

// Prisma 7 moved connection URLs out of schema.prisma. This file wires
// `prisma db push` / `prisma migrate` to use DIRECT_URL (port 5432) — the
// pooled DATABASE_URL (port 6543, PgBouncer) doesn't support the DDL the
// migrate engine emits. Runtime queries still go through DATABASE_URL via
// src/lib/db.ts; this file is only consumed by the Prisma CLI.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DIRECT_URL!,
  },
})
