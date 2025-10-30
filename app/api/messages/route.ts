import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/server/auth";
import { sendMessageSchema } from "@schemas";
import { rateLimitMiddleware } from "@/server/middleware/rateLimit";
import { handleApiError } from "@/server/errors";
import { logger } from "@/server/logger";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const rateLimitResponse = await rateLimitMiddleware(request);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const data = sendMessageSchema.parse(body);

    // TODO: Validate channel access (RLS will handle, but check phase too)
    // TODO: Create message in DB
    const messageId = crypto.randomUUID();

    logger.info("Message created", { messageId, channelType: data.channelType, userId: session.user.id });

    return NextResponse.json({ id: messageId, success: true });
  } catch (error) {
    const { response, logMessage } = handleApiError(error);
    if (logMessage) {
      logger.error("Failed to create message", { error: logMessage });
    }
    return response;
  }
}
