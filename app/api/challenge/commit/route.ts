import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth";
import { challengeCommitSchema, type challengeCommitResultSchema } from "@schemas";
import type { z } from "zod";
import { handleApiError } from "@/server/errors";
import { logger } from "@/server/logger";

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { clientSeedHash } = challengeCommitSchema.parse(body);

    // TODO: Validate phase is 'challenge', store commit in DB
    // Check if already committed for this challenge/day

    logger.info("Challenge commit received", { userId: session.user.id });

    const result: z.infer<typeof challengeCommitResultSchema> = {
      success: true,
      committed: true,
    };

    return NextResponse.json(result);
  } catch (error) {
    const { response, logMessage } = handleApiError(error);
    if (logMessage) {
      logger.error("Failed to commit challenge seed", { error: logMessage });
    }
    return response;
  }
}
