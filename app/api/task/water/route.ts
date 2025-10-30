import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth";
import type { waterResultSchema } from "@schemas";
import type { z } from "zod";

export async function POST() {
  try {
    await requireAuth();

    const thirstDelta = Math.floor(Math.random() * 20) + 10; // 10-30 thirst
    const isTainted = Math.random() < 0.15; // 15% chance

    const result: z.infer<typeof waterResultSchema> = {
      delta: {
        thirst: thirstDelta,
      },
      debuff: isTainted ? "tainted_water" : undefined,
    };

    // TODO: Update stats, apply debuff if tainted
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
