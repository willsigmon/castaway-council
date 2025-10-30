import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth";
import { pushSubscribeSchema } from "@schemas";
import { handleApiError } from "@/server/errors";
import { logger } from "@/server/logger";

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { endpoint, keys } = pushSubscribeSchema.parse(body);

    // TODO: Store push subscription in DB
    // await db.insert(pushSubscriptions).values({ ... })

    logger.info("Push subscription received", { userId: session.user.id });

    return NextResponse.json({ success: true });
  } catch (error) {
    const { response, logMessage } = handleApiError(error);
    if (logMessage) {
      logger.error("Failed to subscribe to push notifications", { error: logMessage });
    }
    return response;
  }
}
