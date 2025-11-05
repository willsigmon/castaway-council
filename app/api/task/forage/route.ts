import { NextResponse } from "next/server";
import { getCurrentPlayer } from "@/server/auth";
import { db } from "@/server/db/client";
import { items, seasons, players } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { forageTaskSchema, type forageResultSchema } from "@schemas";
import type { z } from "zod";
import { updateStats, getOrCreateStats, updateLastActive, logAction, applyDebuff } from "@/server/db/helpers";
import { handleApiError, BadRequestError, ForbiddenError } from "@/server/errors";
import { generateNarrative, determineSuccessLevel } from "@game-logic";
import type { CharacterArchetype } from "@game-logic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { seasonId } = forageTaskSchema.parse(body);

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
    // const archetypeTrait = CHARACTER_ARCHETYPES[archetype];

    // Calculate success chance based on energy + archetype
    // Base: 50% + (energy/2) + archetype modifiers
    // Survivalist gets +20%, opportunist +10%
    let successChance = 50 + (stats.energy / 2);
    if (archetype === "survivalist") successChance += 20;
    if (archetype === "opportunist") successChance += 10;
    if (archetype === "athlete") successChance += 5; // Physical endurance helps

    // Low hunger penalty
    if (stats.hunger < 30) successChance -= 15;

    // Roll for success
    const roll = Math.random() * 100;
    const successLevel = determineSuccessLevel(roll, successChance);
    const isSuccess = roll >= (100 - successChance);

    // Calculate stat deltas based on success level
    let hungerDelta: number;
    let energyDelta = -10; // Foraging costs energy

    switch (successLevel) {
      case "critical_success":
        hungerDelta = 30 + Math.floor(Math.random() * 10); // 30-40
        energyDelta = -5; // Less tiring
        break;
      case "success":
        hungerDelta = 15 + Math.floor(Math.random() * 10); // 15-25
        break;
      case "partial":
        hungerDelta = 5 + Math.floor(Math.random() * 5); // 5-10
        energyDelta = -15; // More tiring for less reward
        break;
      case "failure":
        hungerDelta = 0;
        energyDelta = -15; // Wasted energy
        break;
      case "critical_failure":
        hungerDelta = -10; // Ate something bad
        energyDelta = -20;
        break;
    }

    // Generate narrative
    const narrative = generateNarrative("forage", successLevel, playerData.displayName, archetype);

    // Apply critical failure debuff if applicable
    if (successLevel === "critical_failure") {
      await applyDebuff(player.id, seasonId, currentDay, "poisoned", 1, 1);
    }

    // Update stats
    await updateStats(player.id, currentDay, {
      hunger: hungerDelta,
      energy: energyDelta,
    });

    // Tool finding chance (critical success only, or survivalist bonus)
    let foundItem = false;
    let itemId: string | undefined;

    const toolChance = archetype === "survivalist" ? 0.15 : 0.10;
    if (successLevel === "critical_success" && Math.random() < toolChance) {
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
      foundItem = true;
    }

    // Log action
    await logAction(
      player.id,
      seasonId,
      currentDay,
      "forage",
      isSuccess,
      narrative,
      { hunger: hungerDelta, energy: energyDelta }
    );

    // Update last active
    await updateLastActive(player.id);

    const result: z.infer<typeof forageResultSchema> = {
      delta: {
        hunger: hungerDelta,
        energy: energyDelta,
      },
      narrative,
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
