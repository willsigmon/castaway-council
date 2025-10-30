import { NextResponse } from "next/server";
import { getCurrentPlayer } from "@/server/auth";
import { db } from "@/server/db/client";
import { seasons } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { restTaskSchema, type restResultSchema } from "@schemas";
import type { z } from "zod";
import { updateStats } from "@/server/db/helpers";
import { handleApiError, BadRequestError, ForbiddenError } from "@/server/errors";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { seasonId } = restTaskSchema.parse(body);

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

    // Generate rest outcome
    const energyDelta = Math.floor(Math.random() * 30) + 20; // 20-50 energy

    // Update stats
    await updateStats(player.id, currentDay, { energy: energyDelta });

    const result: z.infer<typeof restResultSchema> = {
      delta: {
        energy: energyDelta,
      },
    };

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
