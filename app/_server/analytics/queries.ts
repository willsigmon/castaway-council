import { db } from "../db/client";
import { events, messages, votes, players, seasons } from "../db/schema";
import { eq, and, sql, count } from "drizzle-orm";

export async function getDailyActiveUsers(seasonId: string, day: number) {
  // Count unique message senders for the season
  const result = await db
    .select({ playerId: messages.fromPlayerId })
    .from(messages)
    .where(eq(messages.seasonId, seasonId))
    .groupBy(messages.fromPlayerId);

  return result.length;
}

export async function getMessagesPerUserPerDay(seasonId: string) {
  const result = await db
    .select({
      playerId: messages.fromPlayerId,
      day: messages.day,
      count: count(),
    })
    .from(messages)
    .where(eq(messages.seasonId, seasonId))
    .groupBy(messages.fromPlayerId, messages.day);

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

export async function getPhaseOnTimePercentage(seasonId: string) {
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
