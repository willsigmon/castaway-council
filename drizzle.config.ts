import type { Config } from "drizzle-kit";

export default {
  schema: "./app/_server/db/schema.ts",
  out: "./sql/migrations",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/castaway",
  },
} satisfies Config;
