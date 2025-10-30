import { NextResponse } from "next/server";
import { getCurrentPlayer } from "@/server/auth";
import { db } from "@/server/db/client";
import { players, seasons } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { helpTaskSchema, type helpResultSchema } from "@schemas";
import type { z } from "zod";
import { updateStats } from "@/server/db/helpers";
import { handleApiError, BadRequestError, ForbiddenError, NotFoundError } from "@/server/errors";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { seasonId, targetPlayerId } = helpTaskSchema.parse(body);

    // Get current player for this season
    const player = await getCurrentPlayer(seasonId);

    // Validate target player exists and is in the same season
    const [targetPlayer] = await db
      .select()
      .from(players)
      .where(
        eq(players.id, targetPlayerId)
      )
      .limit(1);

    if (!targetPlayer) {
      throw new NotFoundError("Target player not found");
    }

    if (targetPlayer.seasonId !== seasonId) {
      throw new BadRequestError("Target player is not in the same season");
    }

    if (targetPlayer.id === player.id) {
      throw new BadRequestError("Cannot help yourself");
    }

    // Get current day from season
    const [season] = await db
      .select()
      .from(seasons)
      .where(eq(seasons.id, seasonId))
      .limit(1);

    if (!season) {
      throw new BadRequestError("Season not found");
    }

    if (season.status !== "active") {
      throw new ForbiddenError("Season is not active");
    }

    const currentDay = season.dayIndex;

    // Generate help outcome
    const socialDelta = Math.floor(Math.random() * 10) + 5; // 5-15 social

    // Update stats for both players
    await updateStats(player.id, currentDay, { social: socialDelta });
    await updateStats(targetPlayerId, currentDay, { social: socialDelta });

    const result: z.infer<typeof helpResultSchema> = {
      delta: {
        social: socialDelta,
      },
    };

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
