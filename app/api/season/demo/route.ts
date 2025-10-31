import { NextResponse } from "next/server";
import { db } from "@/app/_server/db/client";
import { seasons } from "@/app/_server/db/schema";

// Demo endpoint to create sample seasons for testing
export async function POST() {
  try {
    // Check if demo seasons already exist
    const existing = await db.select().from(seasons).limit(1);
    
    if (existing.length > 0) {
      return NextResponse.json(
        { message: "Seasons already exist. Use the seed script instead." },
        { status: 400 }
      );
    }

    // Create demo seasons
    const demoSeasons = [
      {
        name: "Season 1: Tropical Paradise",
        status: "active" as const,
        startAt: new Date(),
        dayIndex: 3,
      },
      {
        name: "Season 2: Desert Island",
        status: "planned" as const,
        startAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        dayIndex: 0,
      },
      {
        name: "Season 0: The First Castaways",
        status: "complete" as const,
        startAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        dayIndex: 10,
      },
    ];

    const created = await db.insert(seasons).values(demoSeasons).returning();

    return NextResponse.json({
      message: "Demo seasons created",
      seasons: created,
    });
  } catch (error) {
    console.error("Failed to create demo seasons:", error);
    return NextResponse.json(
      { error: "Failed to create demo seasons" },
      { status: 500 }
    );
  }
}

