import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth";
import { db } from "@/server/db/client";
import { users } from "@/server/db/schema";
import { handleApiError } from "@/server/errors";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const { handle } = await request.json();

    if (!handle || typeof handle !== "string") {
      return NextResponse.json({ error: "Handle is required" }, { status: 400 });
    }

    // Check if user already exists
    const [existing] = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);

    if (existing) {
      return NextResponse.json({ success: true, message: "User already exists" });
    }

    // Create user record
    await db.insert(users).values({
      id: session.user.id,
      email: session.user.email!,
      handle,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

