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
 */
export async function getRecentWinners(limit: number = 4): Promise<SeasonWinner[]> {
  // Get completed seasons ordered by most recent
  const completedSeasons = await db
    .select()
    .from(seasons)
    .where(eq(seasons.status, "complete"))
    .orderBy(desc(seasons.startAt), desc(seasons.id))
    .limit(limit);

  const winners: SeasonWinner[] = [];

  for (const season of completedSeasons) {
    // Find winner(s) - players not eliminated in this season
    const winnersList = await db
      .select({
        playerId: players.id,
        displayName: players.displayName,
      })
      .from(players)
      .where(
        and(
          eq(players.seasonId, season.id),
          isNull(players.eliminatedAt)
        )
      )
      .limit(1); // In case of ties, just take the first

    if (winnersList.length === 0) continue;

    const winner = winnersList[0];

    // Get winner's tribe (get their last tribe membership)
    const [tribeMember] = await db
      .select({
        tribeName: tribes.name,
      })
      .from(tribeMembers)
      .innerJoin(tribes, eq(tribeMembers.tribeId, tribes.id))
      .where(eq(tribeMembers.playerId, winner.playerId))
      .limit(1);

    winners.push({
      seasonId: season.id,
      seasonName: season.name,
      winnerDisplayName: winner.displayName,
      tribeName: tribeMember?.tribeName || null,
    });
  }

  return winners;
}
