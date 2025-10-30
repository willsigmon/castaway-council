import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth";
import type { restResultSchema } from "@schemas";
import type { z } from "zod";

export async function POST() {
  try {
    await requireAuth();

    const energyDelta = Math.floor(Math.random() * 30) + 20; // 20-50 energy

    const result: z.infer<typeof restResultSchema> = {
      delta: {
        energy: energyDelta,
      },
    };

    // TODO: Update stats
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
