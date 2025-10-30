import { NextRequest, NextResponse } from "next/server";
import { getCurrentPlayer } from "@/server/auth";
import { db } from "@/server/db/client";
import { messages } from "@/server/db/schema";
import { sendMessageSchema, getMessagesSchema } from "@schemas";
import { rateLimitMiddleware } from "@/server/middleware/rateLimit";
import { handleApiError, BadRequestError } from "@/server/errors";
import { eq, and, desc } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = rateLimitMiddleware(request);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const data = sendMessageSchema.parse(body);

    // Get current player for this season
    const player = await getCurrentPlayer(data.seasonId);

    // Validate channel-specific requirements
    if (data.channelType === "tribe" && !data.tribeId) {
      throw new BadRequestError("tribeId required for tribe channel");
    }
    if (data.channelType === "dm" && !data.toPlayerId) {
      throw new BadRequestError("toPlayerId required for DM channel");
    }

    // Create message in DB (RLS will enforce access control)
    const [message] = await db
      .insert(messages)
      .values({
        seasonId: data.seasonId,
        channelType: data.channelType,
        tribeId: data.tribeId ?? null,
        fromPlayerId: player.id,
        toPlayerId: data.toPlayerId ?? null,
        body: data.body,
      })
      .returning();

    return NextResponse.json({ id: message.id, success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = getMessagesSchema.parse({
      seasonId: searchParams.get("seasonId"),
      channelType: searchParams.get("channelType"),
      tribeId: searchParams.get("tribeId") || undefined,
      toPlayerId: searchParams.get("toPlayerId") || undefined,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 50,
      offset: searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : 0,
    });

    // Get current player for this season (for RLS)
    await getCurrentPlayer(params.seasonId);

    // Build query conditions
    const conditions = [
      eq(messages.seasonId, params.seasonId),
      eq(messages.channelType, params.channelType),
    ];

    if (params.channelType === "tribe" && params.tribeId) {
      conditions.push(eq(messages.tribeId, params.tribeId));
    }

    // Fetch messages (RLS will filter based on player access)
    const messageList = await db
      .select()
      .from(messages)
      .where(and(...conditions))
      .orderBy(desc(messages.createdAt))
      .limit(params.limit)
      .offset(params.offset);

    // Reverse to show oldest first
    return NextResponse.json({ messages: messageList.reverse() });
  } catch (error) {
    return handleApiError(error);
  }
}
