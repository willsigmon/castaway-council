import { db } from "./client";
import { players, seasons, stats } from "./schema";
import { eq, and, desc, lt } from "drizzle-orm";

/**
 * Get the active season for a player
 * Returns the season with status='active' that the player is in
 */
export async function getActiveSeasonForPlayer(playerId: string) {
  const result = await db
    .select({
      season: seasons,
      player: players,
    })
    .from(players)
    .innerJoin(seasons, eq(players.seasonId, seasons.id))
    .where(
      and(
        eq(players.id, playerId),
        eq(seasons.status, "active")
      )
    )
    .limit(1);

  return result[0] ?? null;
}

/**
 * Get or create stats for a player on a specific day
 * If stats don't exist, create them from the previous day's stats or defaults
 */
export async function getOrCreateStats(playerId: string, day: number) {
  // Try to get existing stats
  const existing = await db
    .select()
    .from(stats)
    .where(
      and(
        eq(stats.playerId, playerId),
        eq(stats.day, day)
      )
    )
    .limit(1);

  if (existing[0]) {
    return existing[0];
  }

  // Get previous day's stats or use defaults
  const previousStats = await db
    .select()
    .from(stats)
    .where(
      and(
        eq(stats.playerId, playerId),
        lt(stats.day, day)
      )
    )
    .orderBy(desc(stats.day))
    .limit(1);

  const baseStats = previousStats[0] ?? {
    energy: 100,
    hunger: 100,
    thirst: 100,
    social: 50,
  };

  // Create new stats entry
  const [newStats] = await db
    .insert(stats)
    .values({
      playerId,
      day,
      energy: baseStats.energy,
      hunger: baseStats.hunger,
      thirst: baseStats.thirst,
      social: baseStats.social,
    })
    .returning();

  return newStats;
}

/**
 * Update player stats with deltas, clamping values between 0-100
 */
export async function updateStats(
  playerId: string,
  day: number,
  deltas: {
    energy?: number;
    hunger?: number;
    thirst?: number;
    social?: number;
  }
) {
  // Get current stats
  const currentStats = await getOrCreateStats(playerId, day);

  // Calculate new values with clamping
  const clamp = (value: number) => Math.max(0, Math.min(100, value));

  const updated = await db
    .update(stats)
    .set({
      energy: deltas.energy !== undefined
        ? clamp(currentStats.energy + deltas.energy)
        : currentStats.energy,
      hunger: deltas.hunger !== undefined
        ? clamp(currentStats.hunger + deltas.hunger)
        : currentStats.hunger,
      thirst: deltas.thirst !== undefined
        ? clamp(currentStats.thirst + deltas.thirst)
        : currentStats.thirst,
      social: deltas.social !== undefined
        ? clamp(currentStats.social + deltas.social)
        : currentStats.social,
    })
    .where(
      and(
        eq(stats.playerId, playerId),
        eq(stats.day, day)
      )
    )
    .returning();

  return updated[0]!;
}
