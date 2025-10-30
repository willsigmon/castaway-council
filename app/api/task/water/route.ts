import { NextResponse } from "next/server";
import { getCurrentPlayer } from "@/server/auth";
import { db } from "@/server/db/client";
import { seasons } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { waterTaskSchema, type waterResultSchema } from "@schemas";
import type { z } from "zod";
import { updateStats } from "@/server/db/helpers";
import { handleApiError, BadRequestError, ForbiddenError } from "@/server/errors";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { seasonId } = waterTaskSchema.parse(body);

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

    // Generate water outcome
    const thirstDelta = Math.floor(Math.random() * 20) + 10; // 10-30 thirst
    const isTainted = Math.random() < 0.15; // 15% chance

    // Update stats
    await updateStats(player.id, currentDay, { thirst: thirstDelta });

    // TODO: Apply debuff if tainted (could store in a debuffs table or stats JSON field)
    // For now, we just return the debuff status in the response

    const result: z.infer<typeof waterResultSchema> = {
      delta: {
        thirst: thirstDelta,
      },
      debuff: isTainted ? "tainted_water" : undefined,
    };

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
