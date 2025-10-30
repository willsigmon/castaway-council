import { NextResponse } from "next/server";
import { getCurrentPlayer } from "@/server/auth";
import { db } from "@/server/db/client";
import { items, seasons } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { forageTaskSchema, type forageResultSchema } from "@schemas";
import type { z } from "zod";
import { updateStats } from "@/server/db/helpers";
import { handleApiError, BadRequestError, ForbiddenError } from "@/server/errors";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { seasonId } = forageTaskSchema.parse(body);

    // Get current player for this season
    const player = await getCurrentPlayer(seasonId);

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

    // Generate forage outcome
    const hungerDelta = Math.floor(Math.random() * 15) + 5; // 5-20 hunger
    const foundItem = Math.random() < 0.1; // 10% chance

    // Update stats
    await updateStats(player.id, currentDay, { hunger: hungerDelta });

    // Create item if found
    let itemId: string | undefined;
    if (foundItem) {
      const [item] = await db
        .insert(items)
        .values({
          seasonId,
          type: "tool",
          ownerPlayerId: player.id,
          charges: 1,
        })
        .returning();
      itemId = item.id;
    }

    const result: z.infer<typeof forageResultSchema> = {
      delta: {
        hunger: hungerDelta,
      },
      item: foundItem && itemId
        ? {
            id: itemId,
            type: "tool",
          }
        : undefined,
    };

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
