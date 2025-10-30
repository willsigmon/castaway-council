import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth";
import type { restResultSchema } from "@schemas";
import type { z } from "zod";
import { handleApiError } from "@/server/errors";
import { logger } from "@/server/logger";

export async function POST() {
  try {
    const session = await requireAuth();

    const energyDelta = Math.floor(Math.random() * 30) + 20; // 20-50 energy

    const result: z.infer<typeof restResultSchema> = {
      delta: {
        energy: energyDelta,
      },
    };

    // TODO: Update stats
    logger.info("Rest task completed", { userId: session.user.id, energyDelta });

    return NextResponse.json(result);
  } catch (error) {
    const { response, logMessage } = handleApiError(error);
    if (logMessage) {
      logger.error("Failed to complete rest task", { error: logMessage });
    }
    return response;
  }
}
