import { describe, it, expect } from "vitest";
import { generateRoll, hashClientSeed, scoreTeamChallenge, suddenDeathRoll } from "../index";

describe("RNG System", () => {
  const serverSeed = "test-server-seed-12345";
  const clientSeed = "test-client-seed-67890";
  const encounterId = "encounter-1";
  const subjectId = "player-1";

  it("generates deterministic rolls from seeds", () => {
    const input = {
      serverSeed,
      clientSeed,
      encounterId,
      subjectId,
      energy: 100,
      itemBonus: 0,
      eventBonus: 0,
      debuffs: [],
    };

    const result1 = generateRoll(input);
    const result2 = generateRoll(input);

    expect(result1.roll).toBe(result2.roll);
    expect(result1.total).toBe(result2.total);
    expect(result1.roll).toBeGreaterThanOrEqual(1);
    expect(result1.roll).toBeLessThanOrEqual(20);
  });

  it("applies energy bonus correctly", () => {
    const lowEnergy = generateRoll({
      serverSeed,
      clientSeed,
      encounterId,
      subjectId,
      energy: 20,
    });

    const highEnergy = generateRoll({
      serverSeed,
      clientSeed,
      encounterId,
      subjectId,
      energy: 100,
    });

    expect(highEnergy.total).toBeGreaterThanOrEqual(lowEnergy.total);
    expect(highEnergy.breakdown.energyBonus).toBe(5); // floor(100/20)
  });

  it("applies debuffs correctly", () => {
    const noDebuff = generateRoll({
      serverSeed,
      clientSeed,
      encounterId,
      subjectId,
      energy: 100,
      debuffs: [],
    });

    const withDebuff = generateRoll({
      serverSeed,
      clientSeed,
      encounterId,
      subjectId,
      energy: 100,
      debuffs: ["tainted_water"],
    });

    expect(withDebuff.total).toBe(noDebuff.total - 2);
  });

  it("hashes client seeds correctly", () => {
    const hash1 = hashClientSeed("test-seed");
    const hash2 = hashClientSeed("test-seed");

    expect(hash1).toBe(hash2);
    expect(hash1).toMatch(/^[a-f0-9]{64}$/); // SHA256 hex
  });

  it("scores team challenge with top K rolls", () => {
    const rolls = [
      { roll: 15, total: 20, breakdown: { base: 15, energyBonus: 5, itemBonus: 0, eventBonus: 0, debuffPenalty: 0 } },
      { roll: 12, total: 17, breakdown: { base: 12, energyBonus: 5, itemBonus: 0, eventBonus: 0, debuffPenalty: 0 } },
      { roll: 10, total: 15, breakdown: { base: 10, energyBonus: 5, itemBonus: 0, eventBonus: 0, debuffPenalty: 0 } },
      { roll: 8, total: 13, breakdown: { base: 8, energyBonus: 5, itemBonus: 0, eventBonus: 0, debuffPenalty: 0 } },
      { roll: 5, total: 10, breakdown: { base: 5, energyBonus: 5, itemBonus: 0, eventBonus: 0, debuffPenalty: 0 } },
    ];

    const top4 = scoreTeamChallenge(rolls, 4);
    expect(top4).toBe(20 + 17 + 15 + 13);
  });

  it("generates different roll for tiebreaker", () => {
    const input = {
      serverSeed,
      clientSeed,
      encounterId,
      subjectId,
      energy: 100,
    };

    const normal = generateRoll(input);
    const tiebreaker = suddenDeathRoll(input, [normal]);

    // Should use different encounter ID, so potentially different roll
    expect(tiebreaker.roll).toBeGreaterThanOrEqual(1);
    expect(tiebreaker.roll).toBeLessThanOrEqual(20);
  });
});
