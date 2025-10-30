import { NextResponse } from "next/server";
import { getCurrentPlayer } from "@/server/auth";
import { db } from "@/server/db/client";
import { tribeMembers } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { handleApiError } from "@/server/errors";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const seasonId = searchParams.get("seasonId");

    if (!seasonId) {
      return NextResponse.json({ error: "seasonId is required" }, { status: 400 });
    }

    const player = await getCurrentPlayer(seasonId);

    const [tribeMember] = await db
      .select()
      .from(tribeMembers)
      .where(eq(tribeMembers.playerId, player.id))
      .limit(1);

    return NextResponse.json({
      tribeId: tribeMember?.tribeId || null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

