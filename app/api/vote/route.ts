import { NextResponse } from "next/server";
import { getCurrentPlayer } from "@/server/auth";
import { db } from "@/server/db/client";
import { votes, seasons, players } from "@/server/db/schema";
import { voteSchema, type voteResultSchema } from "@schemas";
import { handleApiError, BadRequestError, ConflictError } from "@/server/errors";
import { eq, and } from "drizzle-orm";
import type { z } from "zod";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { seasonId, day, targetPlayerId } = voteSchema.parse(body);

    // Get current player
    const player = await getCurrentPlayer(seasonId);

    // Validate target player exists and is in same season
    const [targetPlayer] = await db
      .select()
      .from(players)
      .where(
        and(
          eq(players.id, targetPlayerId),
          eq(players.seasonId, seasonId)
        )
      )
      .limit(1);

    if (!targetPlayer) {
      throw new BadRequestError("Target player not found");
    }

    if (targetPlayer.id === player.id) {
      throw new BadRequestError("Cannot vote for yourself");
    }

    // Check if already voted for this day
    const [existingVote] = await db
      .select()
      .from(votes)
      .where(
        and(
          eq(votes.seasonId, seasonId),
          eq(votes.day, day),
          eq(votes.voterPlayerId, player.id)
        )
      )
      .limit(1);

    if (existingVote) {
      throw new ConflictError("Already voted for this day");
    }

    // TODO: Validate phase is 'vote' (would need phase tracking)

    // Create vote
    const [vote] = await db
      .insert(votes)
      .values({
        seasonId,
        day,
        voterPlayerId: player.id,
        targetPlayerId,
      })
      .returning();

    const result: z.infer<typeof voteResultSchema> = {
      success: true,
      voteId: vote.id,
    };

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
