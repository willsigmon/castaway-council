import { NextResponse } from "next/server";
import { db } from "@/server/db/client";
import { seasons } from "@/server/db/schema";
import { desc } from "drizzle-orm";
import { handleApiError } from "@/server/errors";

export async function GET() {
  try {
    const allSeasons = await db.select().from(seasons).orderBy(desc(seasons.startAt)).limit(50);

    return NextResponse.json({
      seasons: allSeasons.map((season) => ({
        id: season.id,
        name: season.name,
        status: season.status,
        dayIndex: season.dayIndex,
        startAt: season.startAt?.toISOString() ?? null,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

