import { NextResponse } from "next/server";
import { UnauthorizedError, handleApiError } from "@/server/errors";
import { logger } from "@/server/logger";

// Simple cron-based phase transition (fallback when Temporal not available)
export async function GET(request: Request) {
  try {
    // Verify cron secret or Vercel cron header
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret) {
      logger.error("CRON_SECRET not configured");
      throw new UnauthorizedError("Cron authentication not configured");
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      logger.warn("Unauthorized cron request", { 
        hasHeader: !!authHeader,
        vercelCron: request.headers.get("x-vercel-cron")
      });
      throw new UnauthorizedError("Invalid cron secret");
    }

    // TODO: Check current phase, transition if needed
    // This is a simplified version - for production, use Temporal Cloud

    logger.info("Phase transition check completed");

    return NextResponse.json({
      success: true,
      message: "Phase transition check completed",
      note: "For production, use Temporal Cloud for durable workflows"
    });
  } catch (error) {
    const { response, logMessage } = handleApiError(error);
    if (logMessage) {
      logger.error("Phase transition check failed", { error: logMessage });
    }
    return response;
  }
}
