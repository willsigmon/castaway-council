import { db } from "../app/_server/db/client";
import {
  users,
  seasons,
  players,
  tribes,
  tribeMembers,
  stats,
} from "../app/_server/db/schema";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  // Create users
  const userData = Array.from({ length: 18 }, (_, i) => ({
    email: `player${i + 1}@example.com`,
    handle: `Player${i + 1}`,
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=player${i + 1}`,
  }));

  const createdUsers = await db.insert(users).values(userData).returning();

  // Create season
  const [season] = await db
    .insert(seasons)
    .values({
      name: "Season 1: Tropical Paradise",
      status: "active",
      startAt: new Date(),
      dayIndex: 0,
    })
    .returning();

  // Create 3 tribes
  const tribeData = [
    { name: "Tribe A", color: "#FF6B6B" },
    { name: "Tribe B", color: "#4ECDC4" },
    { name: "Tribe C", color: "#95E1D3" },
  ];

  const createdTribes = await db
    .insert(tribes)
    .values(tribeData.map((t) => ({ ...t, seasonId: season.id })))
    .returning();

  // Create players (6 per tribe)
  const createdPlayers = [];
  for (let i = 0; i < createdUsers.length; i++) {
    const tribeIndex = Math.floor(i / 6);
    const [player] = await db
      .insert(players)
      .values({
        userId: createdUsers[i].id,
        seasonId: season.id,
        displayName: createdUsers[i].handle,
        role: "contestant",
      })
      .returning();

    createdPlayers.push(player);

    // Assign to tribe
    await db.insert(tribeMembers).values({
      tribeId: createdTribes[tribeIndex].id,
      playerId: player.id,
    });

    // Create initial stats
    await db.insert(stats).values({
      playerId: player.id,
      day: 0,
      energy: 100,
      hunger: 100,
      thirst: 100,
      social: 50,
    });
  }

  console.log(`Created ${createdUsers.length} users`);
  console.log(`Created season: ${season.name}`);
  console.log(`Created ${createdTribes.length} tribes`);
  console.log(`Created ${createdPlayers.length} players`);
  console.log("Seed complete!");
}

seed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
