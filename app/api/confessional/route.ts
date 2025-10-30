import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth";
import { confessionalSchema } from "@schemas";

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const data = confessionalSchema.parse(body);

    // TODO: Get player_id from session, create confessional record
    const confessionalId = crypto.randomUUID();

    return NextResponse.json({ id: confessionalId, success: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
