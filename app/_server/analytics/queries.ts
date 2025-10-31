import { db } from "../db/client";
import { events, messages, votes, players, seasons, tribes, tribeMembers } from "../db/schema";
import { eq, and, sql, count, desc, isNull, gte } from "drizzle-orm";

export async function getDailyActiveUsers(seasonId: string, _day: number) {
  // Count unique message senders for the season
  const result = await db
    .select({ playerId: messages.fromPlayerId })
    .from(messages)
    .where(eq(messages.seasonId, seasonId))
    .groupBy(messages.fromPlayerId);

  return result.length;
}

export async function getMessagesPerUserPerDay(seasonId: string) {
  // Extract day from createdAt timestamp and group by it
  const result = await db
    .select({
      playerId: messages.fromPlayerId,
      day: sql<number>`EXTRACT(DAY FROM ${messages.createdAt})`.as("day"),
      count: count(),
    })
    .from(messages)
    .where(eq(messages.seasonId, seasonId))
    .groupBy(messages.fromPlayerId, sql`EXTRACT(DAY FROM ${messages.createdAt})`);

  return result;
}

export async function getVoteParticipationRate(seasonId: string, day: number) {
  const totalPlayers = await db
    .select({ count: count() })
    .from(players)
    .where(and(eq(players.seasonId, seasonId), sql`${players.eliminatedAt} IS NULL`));

  const votesCast = await db
    .select({ count: count() })
    .from(votes)
    .where(and(eq(votes.seasonId, seasonId), eq(votes.day, day)));

  if (totalPlayers[0] && votesCast[0]) {
    return (votesCast[0].count / totalPlayers[0].count) * 100;
  }
  return 0;
}

export async function getPhaseOnTimePercentage(_seasonId: string) {
  // TODO: Compare scheduled vs actual phase transitions from events
  // For now, placeholder
  return 95.0;
}

export async function exportSeasonRecap(seasonId: string) {
  const season = await db.select().from(seasons).where(eq(seasons.id, seasonId)).limit(1);

  const stats = {
    totalDays: season[0]?.dayIndex || 0,
    totalMessages: await db.select({ count: count() }).from(messages).where(eq(messages.seasonId, seasonId)),
    totalVotes: await db.select({ count: count() }).from(votes).where(eq(votes.seasonId, seasonId)),
    totalEvents: await db.select({ count: count() }).from(events).where(eq(events.seasonId, seasonId)),
  };

  return {
    season,
    stats,
  };
}

// Global stats for public landing page
export async function getActivePlayersCount() {
  const result = await db
    .select({ count: count() })
    .from(players)
    .where(sql`${players.eliminatedAt} IS NULL`);

  return result[0]?.count || 0;
}

export async function getTotalSeasonsCount() {
  const result = await db.select({ count: count() }).from(seasons);
  return result[0]?.count || 0;
}

export async function getTotalVotesCount() {
  const result = await db.select({ count: count() }).from(votes);
  return result[0]?.count || 0;
}

export async function getMessagesCountToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result = await db
    .select({ count: count() })
    .from(messages)
    .where(gte(messages.createdAt, today));

  return result[0]?.count || 0;
}

export interface SeasonWinner {
  seasonId: string;
  seasonName: string;
  winnerDisplayName: string;
  tribeName: string | null;
}

/**
 * Get recent winners from completed seasons
 * Returns up to 4 most recent completed seasons with their winners
 * Optimized: Single JOIN query instead of N+1 pattern (9 queries → 1 query)
 */
export async function getRecentWinners(limit: number = 4): Promise<SeasonWinner[]> {
  const results = await db
    .select({
      seasonId: seasons.id,
      seasonName: seasons.name,
      winnerDisplayName: players.displayName,
      tribeName: tribes.name,
    })
    .from(seasons)
    .innerJoin(
      players,
      and(
        eq(players.seasonId, seasons.id),
        isNull(players.eliminatedAt) // Winner = not eliminated
      )
    )
    .leftJoin(tribeMembers, eq(tribeMembers.playerId, players.id))
    .leftJoin(tribes, eq(tribes.id, tribeMembers.tribeId))
    .where(eq(seasons.status, "complete"))
    .orderBy(desc(seasons.startAt), desc(seasons.id))
    .limit(limit);

  return results.map((r) => ({
    seasonId: r.seasonId,
    seasonName: r.seasonName,
    winnerDisplayName: r.winnerDisplayName,
    tribeName: r.tribeName,
  }));
}
