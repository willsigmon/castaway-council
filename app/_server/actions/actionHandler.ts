/**
 * Shared action handler utilities for player camp actions
 */

import { db } from "../db/client";
import { players, seasons } from "../db/schema";
import { eq } from "drizzle-orm";
import {
  getOrCreateStats,
  updateStats,
  updateLastActive,
  logAction,
  applyDebuff,
} from "../db/helpers";
import { generateNarrative, determineSuccessLevel } from "@game-logic";
import type { CharacterArchetype, SuccessLevel } from "@game-logic";

export interface ActionConfig {
  baseSuccessChance: number;
  archetypeModifiers: Partial<Record<CharacterArchetype, number>>;
  energyCost: number;
  statPenalties?: {
    lowEnergy?: { threshold: number; penalty: number };
    lowHunger?: { threshold: number; penalty: number };
    lowThirst?: { threshold: number; penalty: number };
  };
  outcomes: {
    critical_success: ActionOutcome;
    success: ActionOutcome;
    partial: ActionOutcome;
    failure: ActionOutcome;
    critical_failure: ActionOutcome;
  };
  criticalFailureDebuff?: {
    kind: string;
    severity: number;
    duration: number;
  };
}

export interface ActionOutcome {
  statDeltas: {
    energy?: number;
    hunger?: number;
    thirst?: number;
    social?: number;
  };
}

export interface ActionResult {
  success: boolean;
  successLevel: SuccessLevel;
  narrative: string;
  statDeltas: {
    energy?: number;
    hunger?: number;
    thirst?: number;
    social?: number;
  };
  debuffApplied?: string;
}

/**
 * Execute a player action with stat-based success and narrative generation
 */
export async function executeAction(
  playerId: string,
  seasonId: string,
  actionType: string,
  config: ActionConfig
): Promise<ActionResult> {
  // Get player data including archetype
  const [playerData] = await db
    .select()
    .from(players)
    .where(eq(players.id, playerId))
    .limit(1);

  if (!playerData) {
    throw new Error("Player not found");
  }

  // Get current season
  const [season] = await db
    .select()
    .from(seasons)
    .where(eq(seasons.id, seasonId))
    .limit(1);

  if (!season) {
    throw new Error("Season not found");
  }

  if (season.status !== "active") {
    throw new Error("Season is not active");
  }

  const currentDay = season.dayIndex;

  // Get current stats
  const stats = await getOrCreateStats(playerId, currentDay);
  const archetype = playerData.archetype as CharacterArchetype;

  // Calculate success chance
  let successChance = config.baseSuccessChance + (stats.energy / 2);

  // Apply archetype modifiers
  const archetypeModifier = config.archetypeModifiers[archetype] || 0;
  successChance += archetypeModifier;

  // Apply stat penalties
  if (config.statPenalties?.lowEnergy && stats.energy < config.statPenalties.lowEnergy.threshold) {
    successChance -= config.statPenalties.lowEnergy.penalty;
  }
  if (config.statPenalties?.lowHunger && stats.hunger < config.statPenalties.lowHunger.threshold) {
    successChance -= config.statPenalties.lowHunger.penalty;
  }
  if (config.statPenalties?.lowThirst && stats.thirst < config.statPenalties.lowThirst.threshold) {
    successChance -= config.statPenalties.lowThirst.penalty;
  }

  // Roll for success
  const roll = Math.random() * 100;
  const successLevel = determineSuccessLevel(roll, successChance);
  const isSuccess = successLevel === "success" || successLevel === "critical_success";

  // Get stat deltas from config
  const statDeltas = config.outcomes[successLevel].statDeltas;

  // Generate narrative
  const narrative = generateNarrative(actionType, successLevel, playerData.displayName, archetype);

  // Apply critical failure debuff if applicable
  let debuffApplied: string | undefined;
  if (successLevel === "critical_failure" && config.criticalFailureDebuff) {
    await applyDebuff(
      playerId,
      seasonId,
      currentDay,
      config.criticalFailureDebuff.kind,
      config.criticalFailureDebuff.severity,
      config.criticalFailureDebuff.duration
    );
    debuffApplied = config.criticalFailureDebuff.kind;
  }

  // Update stats
  await updateStats(playerId, currentDay, statDeltas);

  // Log action
  await logAction(playerId, seasonId, currentDay, actionType, isSuccess, narrative, statDeltas);

  // Update last active
  await updateLastActive(playerId);

  return {
    success: isSuccess,
    successLevel,
    narrative,
    statDeltas,
    debuffApplied,
  };
}
