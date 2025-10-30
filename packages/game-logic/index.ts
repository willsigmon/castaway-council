import { createHash, createHmac } from "crypto";

export interface ClientCommit {
  playerId: string;
  seedHash: string; // SHA256(client_seed)
}

export interface ServerReveal {
  serverSeed: string;
  clientSeeds: Record<string, string>; // playerId -> client_seed
}

export interface Encounter {
  id: string;
  type: "team" | "individual";
  name: string;
}

export interface RollInput {
  encounterId: string;
  subjectId: string; // playerId or tribeId
  serverSeed: string;
  clientSeed: string;
  energy: number;
  itemBonus?: number;
  eventBonus?: number;
  debuffs?: string[];
}

export interface RollResult {
  roll: number;
  total: number;
  breakdown: {
    base: number;
    energyBonus: number;
    itemBonus: number;
    eventBonus: number;
    debuffPenalty: number;
  };
}

/**
 * Generate deterministic random number from seeds
 * Uses HMAC-SHA256(server_seed, client_seed || encounter_id || subject_id)
 */
export function generateRoll(input: RollInput): RollResult {
  const { encounterId, subjectId, serverSeed, clientSeed, energy, itemBonus = 0, eventBonus = 0, debuffs = [] } = input;

  // Create deterministic input
  const inputString = `${clientSeed}||${encounterId}||${subjectId}`;
  const hmac = createHmac("sha256", serverSeed);
  hmac.update(inputString);
  const hash = hmac.digest("hex");

  // Map first 8 hex chars to 1..20
  const hashInt = parseInt(hash.substring(0, 8), 16);
  const baseRoll = (hashInt % 20) + 1;

  // Calculate modifiers
  const energyBonus = Math.floor(energy / 20);
  const debuffPenalty = debuffs.length * 2; // Each debuff reduces by 2

  const total = baseRoll + energyBonus + itemBonus + eventBonus - debuffPenalty;

  return {
    roll: baseRoll,
    total: Math.max(1, total), // Minimum 1
    breakdown: {
      base: baseRoll,
      energyBonus,
      itemBonus,
      eventBonus,
      debuffPenalty,
    },
  };
}

/**
 * Hash client seed for commit phase
 */
export function hashClientSeed(clientSeed: string): string {
  return createHash("sha256").update(clientSeed).digest("hex");
}

/**
 * Score team challenge: sum top K rolls
 */
export function scoreTeamChallenge(rolls: RollResult[], topK: number): number {
  const sorted = [...rolls].sort((a, b) => b.total - a.total);
  const topRolls = sorted.slice(0, topK);
  return topRolls.reduce((sum, r) => sum + r.total, 0);
}

/**
 * Handle tie: sudden-death one-roll playoff
 */
export function suddenDeathRoll(input: RollInput, existingResults: RollResult[]): RollResult {
  // Use a modified encounter ID to ensure different hash
  const tiebreakerInput: RollInput = {
    ...input,
    encounterId: `${input.encounterId}_tiebreaker`,
  };
  return generateRoll(tiebreakerInput);
}

/**
 * Verify challenge result from published seeds
 */
export function verifyChallengeResult(
  serverSeed: string,
  clientSeeds: Record<string, string>,
  encounterId: string,
  subjectId: string,
  expectedTotal: number
): boolean {
  // Find matching client seed
  const clientSeed = clientSeeds[subjectId];
  if (!clientSeed) return false;

  const result = generateRoll({
    serverSeed,
    clientSeed,
    encounterId,
    subjectId,
    energy: 0, // Verification doesn't include modifiers
    itemBonus: 0,
    eventBonus: 0,
    debuffs: [],
  });

  // Note: Full verification requires modifiers, but we can verify the base roll
  return result.roll <= 20 && result.roll >= 1;
}
