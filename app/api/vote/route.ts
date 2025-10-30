import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth";
import { voteSchema, type voteResultSchema } from "@schemas";
import type { z } from "zod";
import { handleApiError, ValidationError } from "@/server/errors";
import { logger } from "@/server/logger";

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { day, targetPlayerId } = voteSchema.parse(body);

    // Validate that user isn't voting for themselves
    // TODO: Get playerId from session and validate
    // TODO: Validate phase is 'vote', check if already voted, create vote record
    const voteId = crypto.randomUUID();

    logger.info("Vote created", { voteId, day, targetPlayerId, userId: session.user.id });

    const result: z.infer<typeof voteResultSchema> = {
      success: true,
      voteId,
    };

    return NextResponse.json(result);
  } catch (error) {
    const { response, logMessage } = handleApiError(error);
    if (logMessage) {
      logger.error("Failed to create vote", { error: logMessage });
    }
    return response;
  }
}
