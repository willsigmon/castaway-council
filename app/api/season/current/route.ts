import { NextResponse } from "next/server";
import { getCurrentPlayer } from "@/server/auth";
import { db } from "@/server/db/client";
import { seasons, events } from "@/server/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { handleApiError } from "@/server/errors";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

async function getServerSession() {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ season: null, player: null, phase: null });
    }

    // Find active season
    const [activeSeason] = await db
      .select()
      .from(seasons)
      .where(eq(seasons.status, "active"))
      .limit(1);

    if (!activeSeason) {
      return NextResponse.json({ season: null, player: null, phase: null });
    }

    // Get current player
    let player = null;
    try {
      player = await getCurrentPlayer(activeSeason.id);
    } catch {
      // Player not in season
    }

    // Get current phase from latest phase_open event
    const [latestPhase] = await db
      .select()
      .from(events)
      .where(
        and(
          eq(events.seasonId, activeSeason.id),
          eq(events.kind, "phase_open")
        )
      )
      .orderBy(desc(events.createdAt))
      .limit(1);

    let phase: "camp" | "challenge" | "vote" | null = null;
    if (latestPhase?.payloadJson && typeof latestPhase.payloadJson === "object" && "phase" in latestPhase.payloadJson) {
      const phaseValue = latestPhase.payloadJson.phase;
      if (phaseValue === "camp" || phaseValue === "challenge" || phaseValue === "vote") {
        phase = phaseValue;
      }
    }

    return NextResponse.json({
      season: {
        id: activeSeason.id,
        name: activeSeason.name,
        status: activeSeason.status,
        dayIndex: activeSeason.dayIndex,
        startAt: activeSeason.startAt?.toISOString() ?? null,
      },
      player: player
        ? {
            id: player.id,
            displayName: player.displayName,
          }
        : null,
      phase,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

