import { NextResponse } from "next/server";
import { getRecentWinners } from "@/server/analytics/queries";

export async function GET() {
    try {
        const winners = await getRecentWinners(4);
        return NextResponse.json({ winners });
    } catch (error) {
        console.error("Failed to fetch recent winners:", error);
        return NextResponse.json(
            { error: "Failed to fetch winners", winners: [] },
            { status: 500 }
        );
    }
}
