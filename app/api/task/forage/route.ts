import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth";
import { db } from "@/server/db/client";
import { stats, items } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import type { forageResultSchema } from "@schemas";
import type { z } from "zod";
import { handleApiError } from "@/server/errors";
import { logger } from "@/server/logger";

export async function POST() {
  try {
    const session = await requireAuth();
    // TODO: Get current player and season/phase from session

    // For now, placeholder logic
    const hungerDelta = Math.floor(Math.random() * 15) + 5; // 5-20 hunger

    // Small chance of finding an item
    const foundItem = Math.random() < 0.1; // 10% chance

    const result: z.infer<typeof forageResultSchema> = {
      delta: {
        hunger: hungerDelta,
      },
      item: foundItem
        ? {
            id: crypto.randomUUID(),
            type: "tool",
          }
        : undefined,
    };

    // TODO: Update stats in DB, create item if found
    // await db.update(stats).set({ hunger: sql`${stats.hunger} + ${hungerDelta}` })

    logger.info("Forage task completed", { userId: session.user.id, hungerDelta, foundItem });

    return NextResponse.json(result);
  } catch (error) {
    const { response, logMessage } = handleApiError(error);
    if (logMessage) {
      logger.error("Failed to complete forage task", { error: logMessage });
    }
    return response;
  }
}
