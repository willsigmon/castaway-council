import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth";
import { playIdolSchema } from "@schemas";

export async function POST(request: Request) {
  try {
    await requireAuth();
    const body = await request.json();
    playIdolSchema.parse(body); // Validate schema, day will be used when implementing TODO

    // TODO: Validate phase is 'vote' and before tally
    // TODO: Check player owns an idol, mark as used
    // TODO: Create event record

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
