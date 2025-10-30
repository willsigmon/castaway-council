import type { SeasonWorkflowInput } from "./workflows";
import { db } from "../../app/_server/db/client";
import { challenges, votes, events, players, tribes, tribeMembers, pushSubscriptions, items } from "../../app/_server/db/schema";
import { eq, and, sql, isNull, desc } from "drizzle-orm";
import webpush from "web-push";

// Configure webpush with VAPID keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function emitPush(input: {
  seasonId: string;
  type: string;
  phase?: string;
  day?: number;
  closesAt?: string;
}): Promise<void> {
  try {
    // Emit phase_open event to DB if this is a phase event
    if (input.type === "phase_open" && input.phase && input.day) {
      await db.insert(events).values({
        seasonId: input.seasonId,
        day: input.day,
        kind: "phase_open",
        payloadJson: {
          phase: input.phase,
          opensAt: new Date().toISOString(),
          closesAt: input.closesAt,
        },
      });
    }

    // Get all players in season
    const seasonPlayers = await db
      .select({ userId: players.userId })
      .from(players)
      .where(eq(players.seasonId, input.seasonId));

    const userIds = seasonPlayers.map((p) => p.userId);

    if (userIds.length === 0) return;

    // Get push subscriptions for these users
    const subscriptions = await db
      .select()
      .from(pushSubscriptions)
      .where(sql`${pushSubscriptions.userId} = ANY(${userIds})`);

    // Send notifications
    const notificationPromises = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          JSON.stringify({
            title: input.phase ? `Phase: ${input.phase}` : "Castaway Council",
            body: input.type === "phase_open" ? `${input.phase} phase started` : "Update available",
            icon: "/icon-192x192.png",
          })
        );
      } catch (error) {
        // Ignore failed notifications (expired subscriptions, etc.)
        console.error(`Failed to send push to ${sub.endpoint}:`, error);
      }
    });

    await Promise.allSettled(notificationPromises);
  } catch (error) {
    console.error("[Activity] Emit push error:", error);
  }
}

export async function scoreChallenge(input: { seasonId: string; day: number }): Promise<void> {
  try {
    // Find challenge for this day
    const [challenge] = await db
      .select()
      .from(challenges)
      .where(
        and(
          eq(challenges.seasonId, input.seasonId),
          eq(challenges.day, input.day)
        )
      )
      .limit(1);

    if (!challenge) {
      throw new Error(`Challenge not found for season ${input.seasonId}, day ${input.day}`);
    }

    // Call the score API endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/challenge/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challengeId: challenge.id }),
    });

    if (!response.ok) {
      throw new Error(`Failed to score challenge: ${response.statusText}`);
    }
  } catch (error) {
    console.error("[Activity] Score challenge error:", error);
    throw error;
  }
}

export async function tallyVotes(input: { seasonId: string; day: number }): Promise<void> {
  try {
    // Get all votes for this day
    const dayVotes = await db
      .select()
      .from(votes)
      .where(
        and(
          eq(votes.seasonId, input.seasonId),
          eq(votes.day, input.day)
        )
      );

    // Get active players (not eliminated)
    const activePlayers = await db
      .select()
      .from(players)
      .where(
        and(
          eq(players.seasonId, input.seasonId),
          isNull(players.eliminatedAt)
        )
      );

    // Count votes per target
    const voteCounts: Record<string, number> = {};
    for (const vote of dayVotes) {
      voteCounts[vote.targetPlayerId] = (voteCounts[vote.targetPlayerId] || 0) + 1;
    }

    // Find player with most votes
    let maxVotes = 0;
    let eliminatedPlayerId: string | null = null;
    const tiedPlayers: string[] = [];

    for (const [playerId, count] of Object.entries(voteCounts)) {
      if (count > maxVotes) {
        maxVotes = count;
        eliminatedPlayerId = playerId;
        tiedPlayers.length = 0;
        tiedPlayers.push(playerId);
      } else if (count === maxVotes) {
        tiedPlayers.push(playerId);
      }
    }

    // Handle ties: for MVP, eliminate first tied player (in production, would trigger revote/fire-making)
    if (tiedPlayers.length > 1) {
      eliminatedPlayerId = tiedPlayers[0];
    }

    if (!eliminatedPlayerId) {
      throw new Error("No votes to tally");
    }

    // Eliminate player and reveal votes
    await db.transaction(async (tx) => {
      await tx
        .update(players)
        .set({ eliminatedAt: new Date() })
        .where(eq(players.id, eliminatedPlayerId!));

      await tx
        .update(votes)
        .set({ revealedAt: new Date() })
        .where(
          and(
            eq(votes.seasonId, input.seasonId),
            eq(votes.day, input.day)
          )
        );

      await tx.insert(events).values({
        seasonId: input.seasonId,
        day: input.day,
        kind: "eliminate",
        payloadJson: {
          playerId: eliminatedPlayerId,
          voteCounts,
        },
      });
    });
  } catch (error) {
    console.error("[Activity] Tally votes error:", error);
    throw error;
  }
}

export async function mergeTribes(input: { seasonId: string }): Promise<void> {
  try {
    // Get all active tribes
    const activeTribes = await db
      .select()
      .from(tribes)
      .where(eq(tribes.seasonId, input.seasonId));

    if (activeTribes.length <= 1) {
      return; // Already merged or only one tribe
    }

    // Create merged tribe (use first tribe as base)
    const mergedTribe = activeTribes[0];

    // Move all players from other tribes to merged tribe
    const otherTribeIds = activeTribes.slice(1).map((t) => t.id);

    await db.transaction(async (tx) => {
      // Update tribe memberships
      for (const tribeId of otherTribeIds) {
        await tx
          .update(tribeMembers)
          .set({ tribeId: mergedTribe.id })
          .where(eq(tribeMembers.tribeId, tribeId));
      }

      // Emit merge event
      await tx.insert(events).values({
        seasonId: input.seasonId,
        day: 10, // Merge happens at day 10
        kind: "merge",
        payloadJson: {
          mergedTribeId: mergedTribe.id,
          mergedTribes: otherTribeIds,
        },
      });
    });
  } catch (error) {
    console.error("[Activity] Merge tribes error:", error);
    throw error;
  }
}

export async function emitDailySummary(input: { seasonId: string; day: number }): Promise<void> {
  try {
    // Get events for this day
    const dayEvents = await db
      .select()
      .from(events)
      .where(
        and(
          eq(events.seasonId, input.seasonId),
          eq(events.day, input.day)
        )
      )
      .orderBy(desc(events.createdAt));

    // Create summary
    const summary = {
      day: input.day,
      events: dayEvents.map((e) => ({
        kind: e.kind,
        payload: e.payloadJson,
        timestamp: e.createdAt,
      })),
    };

    // Emit to public log (event is already in DB, Realtime will broadcast)
    await db.insert(events).values({
      seasonId: input.seasonId,
      day: input.day,
      kind: "phase_close",
      payloadJson: {
        phase: "summary",
        summary,
      },
    });
  } catch (error) {
    console.error("[Activity] Daily summary error:", error);
  }
}
