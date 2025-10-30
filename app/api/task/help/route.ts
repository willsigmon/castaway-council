import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth";
import { helpTaskSchema, type helpResultSchema } from "@schemas";
import type { z } from "zod";

export async function POST(request: Request) {
  try {
    await requireAuth();
    const body = await request.json();
    const { targetPlayerId } = helpTaskSchema.parse(body);

    const socialDelta = Math.floor(Math.random() * 10) + 5; // 5-15 social

    const result: z.infer<typeof helpResultSchema> = {
      delta: {
        social: socialDelta,
      },
    };

    // TODO: Update stats for both players
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
