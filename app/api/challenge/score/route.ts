import { NextResponse } from "next/server";
import { db } from "@/server/db/client";
import { challenges, challengeCommits, challengeResults, events, players, stats, tribes, tribeMembers } from "@/server/db/schema";
import { handleApiError, BadRequestError } from "@/server/errors";
import { eq, and } from "drizzle-orm";
import { generateRoll } from "@game-logic";
import { randomBytes } from "crypto";

// Admin/worker-only endpoint - called by Temporal activities
export async function POST(request: Request) {
  try {
    // TODO: Verify admin/worker auth (check Temporal worker token or admin key)
    const body = await request.json();
    const { challengeId } = body;

    // Get challenge
    const [challenge] = await db
      .select()
      .from(challenges)
      .where(eq(challenges.id, challengeId))
      .limit(1);

    if (!challenge) {
      throw new BadRequestError("Challenge not found");
    }

    // Check if already scored
    if (challenge.serverSeed) {
      throw new BadRequestError("Challenge already scored");
    }

    // Get all commits
    const commits = await db
      .select()
      .from(challengeCommits)
      .where(eq(challengeCommits.challengeId, challengeId));

    if (commits.length === 0) {
      throw new BadRequestError("No commits found for challenge");
    }

    // Generate server seed
    const serverSeed = randomBytes(32).toString("hex");

    // For MVP: Assume players reveal seeds immediately (in production, separate reveal phase)
    // Store server seed and client seeds mapping
    const clientSeeds: Record<string, string> = {};
    // In real implementation, players would POST their revealed seeds
    // For now, we'll use placeholder - this needs a reveal endpoint

    // Parse encounters from JSON
    const encounters = challenge.encountersJson as Array<{ id: string; type: "team" | "individual"; name: string }>;

    // Calculate rolls for each encounter
    const resultsToInsert = [];

    for (const encounter of encounters) {
      if (encounter.type === "team") {
        // Team challenge: get all tribes, calculate rolls per tribe
        const seasonTribes = await db
          .select()
          .from(tribes)
          .where(eq(tribes.seasonId, challenge.seasonId));

        for (const tribe of seasonTribes) {
          // Get tribe members
          const members = await db
            .select({ playerId: tribeMembers.playerId })
            .from(tribeMembers)
            .where(eq(tribeMembers.tribeId, tribe.id));

          const playerIds = members.map((m) => m.playerId);

          // Get stats for players
          const playerStatsList = await Promise.all(
            playerIds.map(async (playerId) => {
              const [stat] = await db
                .select()
                .from(stats)
                .where(
                  and(
                    eq(stats.playerId, playerId),
                    eq(stats.day, challenge.day)
                  )
                )
                .limit(1);
              return { playerId, stat: stat || { energy: 100 } };
            })
          );

          // Calculate rolls for each player in tribe
          const rolls = [];
          for (const { playerId, stat } of playerStatsList) {
            // Find commit for this player
            const commit = commits.find((c) => c.playerId === playerId);
            if (!commit || !commit.clientSeed) continue; // Skip if no seed revealed

            const rollResult = generateRoll({
              encounterId: encounter.id,
              subjectId: tribe.id,
              serverSeed,
              clientSeed: commit.clientSeed,
              energy: stat.energy,
            });

            rolls.push(rollResult);
            resultsToInsert.push({
              challengeId: challenge.id,
              subjectType: "tribe" as const,
              subjectId: tribe.id,
              roll: rollResult.roll,
              modifiersJson: rollResult.breakdown,
              total: rollResult.total,
            });
          }
        }
      } else {
        // Individual challenge: calculate rolls per player
        const activePlayers = await db
          .select()
          .from(players)
          .where(
            and(
              eq(players.seasonId, challenge.seasonId),
              eq(players.eliminatedAt, null)
            )
          );

        for (const player of activePlayers) {
          const commit = commits.find((c) => c.playerId === player.id);
          if (!commit || !commit.clientSeed) continue;

          const [stat] = await db
            .select()
            .from(stats)
            .where(
              and(
                eq(stats.playerId, player.id),
                eq(stats.day, challenge.day)
              )
            )
            .limit(1);

          const rollResult = generateRoll({
            encounterId: encounter.id,
            subjectId: player.id,
            serverSeed,
            clientSeed: commit.clientSeed,
            energy: stat?.energy ?? 100,
          });

          resultsToInsert.push({
            challengeId: challenge.id,
            subjectType: "player" as const,
            subjectId: player.id,
            roll: rollResult.roll,
            modifiersJson: rollResult.breakdown,
            total: rollResult.total,
          });
        }
      }
    }

    // Store results in transaction
    await db.transaction(async (tx) => {
      // Update challenge with server seed
      await tx
        .update(challenges)
        .set({
          serverSeed,
          clientSeedsJson: clientSeeds,
        })
        .where(eq(challenges.id, challengeId));

      // Insert results
      if (resultsToInsert.length > 0) {
        await tx.insert(challengeResults).values(resultsToInsert);
      }

      // Emit challenge_scored event
      await tx.insert(events).values({
        seasonId: challenge.seasonId,
        day: challenge.day,
        kind: "phase_close",
        payloadJson: {
          phase: "challenge",
          challengeId: challenge.id,
        },
      });
    });

    return NextResponse.json({ success: true, resultsCount: resultsToInsert.length });
  } catch (error) {
    return handleApiError(error);
  }
}
