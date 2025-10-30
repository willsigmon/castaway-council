import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth";
import { playIdolSchema } from "@schemas";
import { handleApiError } from "@/server/errors";
import { logger } from "@/server/logger";

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { day } = playIdolSchema.parse(body);

    // TODO: Validate phase is 'vote' and before tally
    // TODO: Check player owns an idol, mark as used
    // TODO: Create event record

    logger.info("Idol played", { day, userId: session.user.id });

    return NextResponse.json({ success: true });
  } catch (error) {
    const { response, logMessage } = handleApiError(error);
    if (logMessage) {
      logger.error("Failed to play idol", { error: logMessage });
    }
    return response;
  }
}
