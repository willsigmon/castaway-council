import { describe, it, expect } from "vitest";
import { generateRoll, verifyChallengeResult } from "../index";

describe("Challenge Verification", () => {
  it("should verify results from published seeds", () => {
    const serverSeed = "test-server-seed";
    const clientSeeds = {
      "player-1": "test-client-seed-1",
      "player-2": "test-client-seed-2",
    };

    // Generate result
    const result = generateRoll({
      serverSeed,
      clientSeed: clientSeeds["player-1"],
      encounterId: "encounter-1",
      subjectId: "player-1",
      energy: 100,
    });

    // Verify
    const isValid = verifyChallengeResult(
      serverSeed,
      clientSeeds,
      "encounter-1",
      "player-1",
      result.total
    );

    expect(isValid).toBe(true);
  });
});
