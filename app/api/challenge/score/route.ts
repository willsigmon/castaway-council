import { NextResponse } from "next/server";

// Admin/worker-only endpoint
export async function POST(request: Request) {
  // TODO: Verify admin/worker auth
  const body = await request.json();
  const { challengeId } = body;

  // TODO: Get challenge, commits, generate server seed
  // TODO: Calculate rolls, store results
  // TODO: Emit events

  return NextResponse.json({ success: true });
}
