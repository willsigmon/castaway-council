import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth";
import { helpTaskSchema, type helpResultSchema } from "@schemas";
import type { z } from "zod";
import { handleApiError } from "@/server/errors";
import { logger } from "@/server/logger";

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { targetPlayerId } = helpTaskSchema.parse(body);

    const socialDelta = Math.floor(Math.random() * 10) + 5; // 5-15 social

    const result: z.infer<typeof helpResultSchema> = {
      delta: {
        social: socialDelta,
      },
    };

    // TODO: Update stats for both players
    logger.info("Help task completed", { userId: session.user.id, targetPlayerId, socialDelta });

    return NextResponse.json(result);
  } catch (error) {
    const { response, logMessage } = handleApiError(error);
    if (logMessage) {
      logger.error("Failed to complete help task", { error: logMessage });
    }
    return response;
  }
}
