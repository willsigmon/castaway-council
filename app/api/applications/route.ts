import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth";
import { db } from "@/server/db/client";
import { playerApplications } from "@/server/db/schema";
import { playerApplicationSchema } from "@schemas";
import { handleApiError } from "@/server/errors";
import { eq } from "drizzle-orm";

function countWords(answer: string): number {
  return answer
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export async function GET() {
  try {
    const session = await requireAuth();

    const [application] = await db
      .select({
        id: playerApplications.id,
        q1: playerApplications.q1,
        q2: playerApplications.q2,
        q3: playerApplications.q3,
        q4: playerApplications.q4,
        q5: playerApplications.q5,
        status: playerApplications.status,
        wordScore: playerApplications.wordScore,
        createdAt: playerApplications.createdAt,
        updatedAt: playerApplications.updatedAt,
      })
      .from(playerApplications)
      .where(eq(playerApplications.userId, session.user.id))
      .limit(1);

    if (!application) {
      return NextResponse.json({ application: null });
    }

    return NextResponse.json({ application });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const payload = playerApplicationSchema.parse(await request.json());

    const answers = [payload.q1, payload.q2, payload.q3, payload.q4, payload.q5];
    const wordCounts = answers.map(countWords);
    const wordScore = wordCounts.reduce((sum, value) => sum + value, 0);
    const status = wordCounts.every((count) => count > 1) ? "shortlist" : "not_considered";

    const [existing] = await db
      .select({ id: playerApplications.id })
      .from(playerApplications)
      .where(eq(playerApplications.userId, session.user.id))
      .limit(1);

    if (existing) {
      const updatedAt = new Date();
      const [updated] = await db
        .update(playerApplications)
        .set({
          q1: payload.q1,
          q2: payload.q2,
          q3: payload.q3,
          q4: payload.q4,
          q5: payload.q5,
          status,
          wordScore,
          updatedAt,
        })
        .where(eq(playerApplications.id, existing.id))
        .returning({
          updatedAt: playerApplications.updatedAt,
        });

      return NextResponse.json({
        success: true,
        status,
        wordScore,
        updatedAt: updated?.updatedAt ?? updatedAt.toISOString(),
      });
    } else {
      const [created] = await db
        .insert(playerApplications)
        .values({
          userId: session.user.id,
          q1: payload.q1,
          q2: payload.q2,
          q3: payload.q3,
          q4: payload.q4,
          q5: payload.q5,
          status,
          wordScore,
        })
        .returning({
          updatedAt: playerApplications.updatedAt,
        });

      return NextResponse.json({
        success: true,
        status,
        wordScore,
        updatedAt: created?.updatedAt ?? new Date().toISOString(),
      });
    }
  } catch (error) {
    return handleApiError(error);
  }
}
