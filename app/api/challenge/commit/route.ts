import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth";
import { challengeCommitSchema, type challengeCommitResultSchema } from "@schemas";
import type { z } from "zod";

export async function POST(request: Request) {
  try {
    await requireAuth();
    const body = await request.json();
    challengeCommitSchema.parse(body);

    // TODO: Validate phase is 'challenge', store commit in DB
    // Check if already committed for this challenge/day

    const result: z.infer<typeof challengeCommitResultSchema> = {
      success: true,
      committed: true,
    };

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
