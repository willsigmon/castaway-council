import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth";
import { voteSchema, type voteResultSchema } from "@schemas";
import type { z } from "zod";

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { day, targetPlayerId } = voteSchema.parse(body);

    // TODO: Validate phase is 'vote', check if already voted, create vote record
    const voteId = crypto.randomUUID();

    const result: z.infer<typeof voteResultSchema> = {
      success: true,
      voteId,
    };

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
