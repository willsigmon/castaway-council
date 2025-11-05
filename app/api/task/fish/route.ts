import { NextResponse } from "next/server";
import { getCurrentPlayer } from "@/server/auth";
import { db } from "@/server/db/client";
import { seasons, players } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { updateStats, getOrCreateStats, updateLastActive, logAction, applyDebuff } from "@/server/db/helpers";
import { handleApiError, BadRequestError, ForbiddenError } from "@/server/errors";
import { generateNarrative, determineSuccessLevel } from "@game-logic";
import type { ArchetypeId as CharacterArchetype } from "@game-logic";

const fishTaskSchema = z.object({
  seasonId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { seasonId } = fishTaskSchema.parse(body);

    // Get current player for this season
    const player = await getCurrentPlayer(seasonId);

    // Get player's full data including archetype
    const [playerData] = await db
      .select()
      .from(players)
      .where(eq(players.id, player.id))
      .limit(1);

    if (!playerData) {
      throw new BadRequestError("Player not found");
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

    // Get current stats
    const stats = await getOrCreateStats(player.id, currentDay);
    const archetype = playerData.archetype as CharacterArchetype;

    // Calculate success chance based on energy + archetype
    // Base: 40% + (energy/2) + archetype modifiers
    // Fishing is harder than foraging
    let successChance = 40 + (stats.energy / 2);
    if (archetype === "survivalist") successChance += 25; // Best at fishing
    if (archetype === "athlete") successChance += 15; // Good coordination
    if (archetype === "opportunist") successChance += 10; // Knows when fish bite

    // Low energy penalty (need patience and strength)
    if (stats.energy < 20) successChance -= 20;

    // Low thirst penalty (standing in sun/water)
    if (stats.thirst < 30) successChance -= 10;

    // Roll for success
    const roll = Math.random() * 100;
    const successLevel = determineSuccessLevel(roll, successChance);
    const isSuccess = roll >= (100 - successChance);

    // Calculate stat deltas based on success level
    let hungerDelta: number;
    let energyDelta = -15; // Fishing costs more energy than foraging
    let thirstDelta = -5; // Standing in sun

    switch (successLevel) {
      case "critical_success":
        hungerDelta = 40 + Math.floor(Math.random() * 10); // 40-50 (big catch!)
        energyDelta = -8;
        thirstDelta = -3;
        break;
      case "success":
        hungerDelta = 20 + Math.floor(Math.random() * 10); // 20-30
        energyDelta = -12;
        break;
      case "partial":
        hungerDelta = 5 + Math.floor(Math.random() * 5); // 5-10 (tiny fish)
        energyDelta = -18; // Exhausting for little reward
        thirstDelta = -8;
        break;
      case "failure":
        hungerDelta = 0;
        energyDelta = -20; // Wasted lots of energy
        thirstDelta = -10;
        break;
      case "critical_failure":
        hungerDelta = 0;
        energyDelta = -25;
        thirstDelta = -15; // Dehydrated in sun
        break;
    }

    // Generate narrative
    const narrative = generateNarrative("fish", successLevel, playerData.displayName, archetype);

    // Apply critical failure debuff if applicable
    if (successLevel === "critical_failure") {
      const debuffRoll = Math.random();
      if (debuffRoll < 0.5) {
        await applyDebuff(player.id, seasonId, currentDay, "injured", 1, 2);
      } else {
        await applyDebuff(player.id, seasonId, currentDay, "dehydrated", 1, 1);
      }
    }

    // Update stats
    await updateStats(player.id, currentDay, {
      hunger: hungerDelta,
      energy: energyDelta,
      thirst: thirstDelta,
    });

    // Log action
    await logAction(
      player.id,
      seasonId,
      currentDay,
      "fish",
      isSuccess,
      narrative,
      { hunger: hungerDelta, energy: energyDelta, thirst: thirstDelta }
    );

    // Update last active
    await updateLastActive(player.id);

    const result = {
      delta: {
        hunger: hungerDelta,
        energy: energyDelta,
        thirst: thirstDelta,
      },
      narrative,
    };

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
