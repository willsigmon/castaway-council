import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/server/auth";
import { sendMessageSchema } from "@schemas";
import { rateLimitMiddleware } from "@/server/middleware/rateLimit";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const rateLimitResponse = rateLimitMiddleware(request);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const data = sendMessageSchema.parse(body);

    // TODO: Validate channel access (RLS will handle, but check phase too)
    // TODO: Create message in DB
    const messageId = crypto.randomUUID();

    return NextResponse.json({ id: messageId, success: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
