import { NextResponse } from "next/server";
import { getCurrentPlayer } from "@/server/auth";
import { db } from "@/server/db/client";
import { challenges, challengeCommits } from "@/server/db/schema";
import { challengeCommitSchema, type challengeCommitResultSchema } from "@schemas";
import { handleApiError, BadRequestError, ForbiddenError, ConflictError } from "@/server/errors";
import { eq, and } from "drizzle-orm";
import type { z } from "zod";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { seasonId, day, clientSeedHash } = challengeCommitSchema.parse(body);

    // Get current player for this season
    const player = await getCurrentPlayer(seasonId);

    // Find challenge for this day
    const [challenge] = await db
      .select()
      .from(challenges)
      .where(
        and(
          eq(challenges.seasonId, seasonId),
          eq(challenges.day, day)
        )
      )
      .limit(1);

    if (!challenge) {
      throw new BadRequestError("Challenge not found for this day");
    }

    // TODO: Validate phase is 'challenge' (would need phase tracking)
    // For now, check if challenge already has server seed (phase closed)
    if (challenge.serverSeed) {
      throw new ForbiddenError("Challenge commit phase has closed");
    }

    // Check if player already committed
    const [existingCommit] = await db
      .select()
      .from(challengeCommits)
      .where(
        and(
          eq(challengeCommits.challengeId, challenge.id),
          eq(challengeCommits.playerId, player.id)
        )
      )
      .limit(1);

    if (existingCommit) {
      throw new ConflictError("Already committed for this challenge");
    }

    // Store commit
    await db.insert(challengeCommits).values({
      challengeId: challenge.id,
      playerId: player.id,
      clientSeedHash,
    });

    const result: z.infer<typeof challengeCommitResultSchema> = {
      success: true,
      committed: true,
    };

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
