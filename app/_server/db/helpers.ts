import { db } from "./client";
import { players, seasons, stats, debuffs, actions } from "./schema";
import { eq, and, desc, lt, gt, or, isNull } from "drizzle-orm";

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

/**
 * Get active debuffs for a player (not expired)
 */
export async function getActiveDebuffs(playerId: string) {
  const now = new Date();
  return await db
    .select()
    .from(debuffs)
    .where(
      and(
        eq(debuffs.playerId, playerId),
        or(
          isNull(debuffs.expiresAt),
          gt(debuffs.expiresAt, now)
        )
      )
    )
    .orderBy(desc(debuffs.createdAt));
}

/**
 * Apply a debuff to a player
 */
export async function applyDebuff(
  playerId: string,
  seasonId: string,
  day: number,
  kind: string,
  severity: number = 1,
  durationDays?: number
) {
  // Check if debuff already exists
  const existing = await db
    .select()
    .from(debuffs)
    .where(
      and(
        eq(debuffs.playerId, playerId),
        eq(debuffs.kind, kind),
        or(
          isNull(debuffs.expiresAt),
          gt(debuffs.expiresAt, new Date())
        )
      )
    )
    .limit(1);

  // If it exists, update severity instead of creating duplicate
  if (existing[0]) {
    const [updated] = await db
      .update(debuffs)
      .set({
        severity: Math.max(existing[0].severity, severity),
        expiresAt: durationDays
          ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)
          : null,
      })
      .where(eq(debuffs.id, existing[0].id))
      .returning();
    return updated;
  }

  // Create new debuff
  const expiresAt = durationDays
    ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)
    : null;

  const [newDebuff] = await db
    .insert(debuffs)
    .values({
      playerId,
      seasonId,
      day,
      kind,
      severity,
      expiresAt,
    })
    .returning();

  return newDebuff;
}

/**
 * Remove a specific debuff from a player
 */
export async function removeDebuff(playerId: string, kind: string) {
  await db
    .delete(debuffs)
    .where(
      and(
        eq(debuffs.playerId, playerId),
        eq(debuffs.kind, kind)
      )
    );
}

/**
 * Remove all expired debuffs for a player
 */
export async function removeExpiredDebuffs(playerId: string) {
  const now = new Date();
  await db
    .delete(debuffs)
    .where(
      and(
        eq(debuffs.playerId, playerId),
        lt(debuffs.expiresAt, now)
      )
    );
}

/**
 * Log a player action with narrative outcome
 */
export async function logAction(
  playerId: string,
  seasonId: string,
  day: number,
  actionType: string,
  success: boolean,
  outcomeText: string,
  statDeltas?: Record<string, number>,
  targetPlayerId?: string
) {
  const [action] = await db
    .insert(actions)
    .values({
      playerId,
      seasonId,
      day,
      actionType,
      success,
      outcomeText,
      statDeltas: statDeltas || null,
      targetPlayerId: targetPlayerId || null,
    })
    .returning();

  return action;
}

/**
 * Get action history for a player
 */
export async function getActionHistory(
  playerId: string,
  limit: number = 10
) {
  return await db
    .select()
    .from(actions)
    .where(eq(actions.playerId, playerId))
    .orderBy(desc(actions.createdAt))
    .limit(limit);
}

/**
 * Get actions for a specific day/season
 */
export async function getActionsForDay(seasonId: string, day: number) {
  return await db
    .select()
    .from(actions)
    .where(
      and(
        eq(actions.seasonId, seasonId),
        eq(actions.day, day)
      )
    )
    .orderBy(desc(actions.createdAt));
}

/**
 * Update player's last active timestamp
 */
export async function updateLastActive(playerId: string) {
  await db
    .update(players)
    .set({ lastActiveAt: new Date() })
    .where(eq(players.id, playerId));
}
