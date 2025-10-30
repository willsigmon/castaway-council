import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth";
import { pushSubscribeSchema } from "@schemas";

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { endpoint, keys } = pushSubscribeSchema.parse(body);

    // TODO: Store push subscription in DB
    // await db.insert(pushSubscriptions).values({ ... })

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
