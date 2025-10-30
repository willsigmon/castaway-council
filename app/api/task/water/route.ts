import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth";
import type { waterResultSchema } from "@schemas";
import type { z } from "zod";
import { handleApiError } from "@/server/errors";
import { logger } from "@/server/logger";

export async function POST() {
  try {
    const session = await requireAuth();

    const thirstDelta = Math.floor(Math.random() * 20) + 10; // 10-30 thirst
    const isTainted = Math.random() < 0.15; // 15% chance

    const result: z.infer<typeof waterResultSchema> = {
      delta: {
        thirst: thirstDelta,
      },
      debuff: isTainted ? "tainted_water" : undefined,
    };

    // TODO: Update stats, apply debuff if tainted
    logger.info("Water task completed", { userId: session.user.id, thirstDelta, isTainted });

    return NextResponse.json(result);
  } catch (error) {
    const { response, logMessage } = handleApiError(error);
    if (logMessage) {
      logger.error("Failed to complete water task", { error: logMessage });
    }
    return response;
  }
}
