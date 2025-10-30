import { NextResponse } from "next/server";
import { getCurrentPlayer } from "@/server/auth";
import { db } from "@/server/db/client";
import { confessionals } from "@/server/db/schema";
import { confessionalSchema } from "@schemas";
import { handleApiError } from "@/server/errors";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { seasonId, body: confessionalBody, visibility } = confessionalSchema.parse(body);
    // Note: body variable name reused for destructuring, original body is shadowed

    // Get current player
    const player = await getCurrentPlayer(seasonId);

    // Create confessional
    const [confessional] = await db
      .insert(confessionals)
      .values({
        playerId: player.id,
        body: confessionalBody,
        visibility: visibility ?? "private",
      })
      .returning();

    return NextResponse.json({ id: confessional.id, success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
