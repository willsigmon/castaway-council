import { NextResponse } from "next/server";
import { handleApiError, UnauthorizedError } from "@/server/errors";
import { logger } from "@/server/logger";

// Admin/worker-only endpoint
export async function POST(request: Request) {
  try {
    // TODO: Verify admin/worker auth
    // For now, check for a secret header or similar
    const authHeader = request.headers.get("authorization");
    const workerSecret = process.env.WORKER_SECRET;
    
    if (workerSecret && authHeader !== `Bearer ${workerSecret}`) {
      throw new UnauthorizedError("Invalid worker authentication");
    }

    const body = await request.json();
    const { challengeId } = body;

    if (!challengeId) {
      throw new Error("challengeId is required");
    }

    // TODO: Get challenge, commits, generate server seed
    // TODO: Calculate rolls, store results
    // TODO: Emit events

    logger.info("Challenge scored", { challengeId });

    return NextResponse.json({ success: true });
  } catch (error) {
    const { response, logMessage } = handleApiError(error);
    if (logMessage) {
      logger.error("Failed to score challenge", { error: logMessage });
    }
    return response;
  }
}
