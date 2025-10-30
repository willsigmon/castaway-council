import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth";
import { confessionalSchema } from "@schemas";
import { handleApiError } from "@/server/errors";
import { logger } from "@/server/logger";

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const data = confessionalSchema.parse(body);

    // TODO: Get player_id from session, create confessional record
    const confessionalId = crypto.randomUUID();

    logger.info("Confessional created", { confessionalId, userId: session.user.id });

    return NextResponse.json({ id: confessionalId, success: true });
  } catch (error) {
    const { response, logMessage } = handleApiError(error);
    if (logMessage) {
      logger.error("Failed to create confessional", { error: logMessage });
    }
    return response;
  }
}
