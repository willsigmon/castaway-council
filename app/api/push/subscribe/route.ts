import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth";
import { db } from "@/server/db/client";
import { pushSubscriptions } from "@/server/db/schema";
import { pushSubscribeSchema } from "@schemas";
import { handleApiError } from "@/server/errors";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { endpoint, keys } = pushSubscribeSchema.parse(body);

    // Check if subscription already exists
    const [existing] = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, endpoint))
      .limit(1);

    if (existing) {
      // Update existing subscription
      await db
        .update(pushSubscriptions)
        .set({
          p256dh: keys.p256dh,
          auth: keys.auth,
        })
        .where(eq(pushSubscriptions.endpoint, endpoint));
    } else {
      // Create new subscription
      await db.insert(pushSubscriptions).values({
        userId: session.user.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
