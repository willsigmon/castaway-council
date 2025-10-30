import { NextResponse } from "next/server";
import { db } from "@/server/db/client";
import { sql } from "drizzle-orm";

/**
 * Health check endpoint
 * Returns 200 if all systems are operational
 */
export async function GET() {
  const checks: Record<string, { status: "ok" | "error"; message?: string }> = {
    api: { status: "ok" },
  };

  // Check database connection
  try {
    await db.execute(sql`SELECT 1`);
    checks.database = { status: "ok" };
  } catch (error) {
    checks.database = {
      status: "error",
      message: error instanceof Error ? error.message : "Database connection failed",
    };
  }

  // Check environment variables
  const requiredEnvVars = ["DATABASE_URL"];
  const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);
  if (missingEnvVars.length > 0) {
    checks.environment = {
      status: "error",
      message: `Missing required environment variables: ${missingEnvVars.join(", ")}`,
    };
  } else {
    checks.environment = { status: "ok" };
  }

  const allHealthy = Object.values(checks).every((check) => check.status === "ok");
  const status = allHealthy ? 200 : 503;

  return NextResponse.json(
    {
      status: allHealthy ? "healthy" : "degraded",
      checks,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}
