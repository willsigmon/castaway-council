import type { SeasonWorkflowInput } from "./workflows";

export async function emitPush(input: {
  seasonId: string;
  type: string;
  phase?: string;
  day?: number;
  closesAt?: string;
}): Promise<void> {
  // TODO: Query push subscriptions for season participants
  // TODO: Send web push notifications
  console.log(`[Activity] Emit push:`, input);
}

export async function scoreChallenge(input: { seasonId: string; day: number }): Promise<void> {
  // TODO: Get challenge for day, get commits, generate server seed
  // TODO: Calculate rolls using game-logic package
  // TODO: Store results in challenge_results table
  console.log(`[Activity] Score challenge:`, input);
}

export async function tallyVotes(input: { seasonId: string; day: number }): Promise<void> {
  // TODO: Get all votes for day
  // TODO: Apply idols if any
  // TODO: Find player with most votes, handle ties (revote/fire-making)
  // TODO: Eliminate player, set revealed_at on votes
  console.log(`[Activity] Tally votes:`, input);
}

export async function mergeTribes(input: { seasonId: string }): Promise<void> {
  // TODO: Merge all active tribes into one
  // TODO: Emit merge event
  console.log(`[Activity] Merge tribes:`, input);
}

export async function emitDailySummary(input: { seasonId: string; day: number }): Promise<void> {
  // TODO: Generate summary of day events
  // TODO: Emit to public log channel
  console.log(`[Activity] Daily summary:`, input);
}
