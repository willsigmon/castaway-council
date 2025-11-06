/**
 * Character Archetype System
 * Defines player character traits that affect gameplay mechanics
 */

export type ArchetypeId =
  | "hunter"
  | "strategist"
  | "builder"
  | "medic"
  | "leader"
  | "scout";

export interface CharacterTrait {
  // Stat modifiers (applied to base stats)
  energyMultiplier: number;
  hungerDecay: number; // Rate at which hunger decreases (1.0 = normal)
  thirstDecay: number;
  socialBonus: number; // Added to base social stat

  // Challenge bonuses
  challengeBonus: number; // Added to roll total
  teamChallengeBonus: number;
  individualChallengeBonus: number;

  // Voting mechanics
  votingInfluence: number; // Multiplier for alliance strength (future feature)
  idolFindChance: number; // Multiplier for idol discovery (1.0 = normal)

  // Recovery & resilience
  energyRecoveryRate: number; // Multiplier for camp phase recovery
  debuffResistance: number; // Reduces debuff penalty (0-1, where 1 = immune)

  // Description
  description: string;
  strengths: string[];
  weaknesses: string[];
}

export const CHARACTER_ARCHETYPES: Record<ArchetypeId, CharacterTrait> = {
  hunter: {
    energyMultiplier: 1.0,
    hungerDecay: 0.75, // Better at finding food
    thirstDecay: 1.0,
    socialBonus: 0,
    challengeBonus: 0,
    teamChallengeBonus: 0,
    individualChallengeBonus: -2, // Loses energy faster in challenges
    votingInfluence: 1.0,
    idolFindChance: 1.25, // 25% higher chance to find resources
    energyRecoveryRate: 0.9, // Loses energy faster in challenges
    debuffResistance: 0.2,
    description: "🪓 Provider who excels at gathering resources for the tribe",
    strengths: [
      "Forage Boost: 25% higher chance of finding food/materials",
      "Track Game: Guarantee 1 food item every 3 days",
      "Reduced hunger decay (0.75x)",
    ],
    weaknesses: [
      "Loses energy faster in challenges (-2 individual)",
      "Slower energy recovery (0.9x)",
    ],
  },

  strategist: {
    energyMultiplier: 0.9,
    hungerDecay: 0.9,
    thirstDecay: 0.9,
    socialBonus: 10,
    challengeBonus: -1,
    teamChallengeBonus: 1,
    individualChallengeBonus: -2,
    votingInfluence: 1.5,
    idolFindChance: 1.3,
    energyRecoveryRate: 1.0,
    debuffResistance: 0.3,
    description: "🧠 Mastermind who manipulates social dynamics and predicts outcomes",
    strengths: [
      "Insight: See hints about vote intentions and alliances",
      "Predict Outcome: Cancel 1 twist event before merge",
      "High social influence (+10)",
      "Stronger voting influence (1.5x)",
    ],
    weaknesses: [
      "Weaker in physical challenges (-2 individual)",
      "Gains less comfort from camp upgrades (detached)",
    ],
  },

  builder: {
    energyMultiplier: 1.0,
    hungerDecay: 1.0,
    thirstDecay: 1.0,
    socialBonus: 5,
    challengeBonus: 1,
    teamChallengeBonus: 2,
    individualChallengeBonus: -2, // Weaker in mental challenges
    votingInfluence: 1.0,
    idolFindChance: 1.2,
    energyRecoveryRate: 1.2,
    debuffResistance: 0.4,
    description: "💪 Craftsman who sustains camp infrastructure and creates tools",
    strengths: [
      "Engineer: Shelter and fire last 1 day longer",
      "Construct Tool: Craft usable items every 3 days",
      "Strong in team challenges (+2)",
      "Good energy recovery (1.2x)",
    ],
    weaknesses: [
      "Weaker in mental challenges (-2 individual)",
      "Average social influence",
    ],
  },

  medic: {
    energyMultiplier: 0.95,
    hungerDecay: 1.3, // Consumes more hunger/thirst (focuses on others)
    thirstDecay: 1.3,
    socialBonus: 12,
    challengeBonus: 0,
    teamChallengeBonus: 2,
    individualChallengeBonus: 0,
    votingInfluence: 1.2,
    idolFindChance: 1.0,
    energyRecoveryRate: 1.1,
    debuffResistance: 0.6, // 10% reduced medical evacuation risk
    description: "🩹 Caregiver who boosts morale and tends to tribe members",
    strengths: [
      "Tend Wounds: Restore +15% Energy/Comfort to others daily",
      "Medical Check: 10% reduced evacuation risk",
      "High social bonus (+12)",
      "Strong debuff resistance (60%)",
    ],
    weaknesses: [
      "Consumes more hunger/thirst daily (1.3x)",
      "Slightly lower base energy",
    ],
  },

  leader: {
    energyMultiplier: 1.0,
    hungerDecay: 1.0,
    thirstDecay: 1.0,
    socialBonus: 15,
    challengeBonus: 1,
    teamChallengeBonus: 3,
    individualChallengeBonus: 0,
    votingInfluence: 1.6,
    idolFindChance: 1.0,
    energyRecoveryRate: 1.1,
    debuffResistance: 0.3,
    description: "🔥 Motivator who inspires the tribe and commands decisive moments",
    strengths: [
      "Inspire Tribe: Increase tribe Energy/Comfort at camp",
      "Command: Decide tied votes (loses 25% comfort)",
      "Highest social bonus (+15)",
      "Exceptional in team challenges (+3)",
      "Strongest voting influence (1.6x)",
    ],
    weaknesses: [
      "Attracts more suspicion",
      "Can't go idle in chat (social pressure penalty)",
    ],
  },

  scout: {
    energyMultiplier: 1.1,
    hungerDecay: 1.1,
    thirstDecay: 1.2, // Higher risk of exhaustion
    socialBonus: 0,
    challengeBonus: 1,
    teamChallengeBonus: 0,
    individualChallengeBonus: 2,
    votingInfluence: 1.0,
    idolFindChance: 1.6, // 10% chance for hidden advantages
    energyRecoveryRate: 0.85, // Energy drops faster when exploring
    debuffResistance: 0.2,
    description: "🕵️ Explorer who uncovers secrets and spies on rivals",
    strengths: [
      "Pathfinder: Move faster, 10% chance for hidden advantages",
      "Spy Mission: View rival tribe chat every 2 days",
      "Best idol finder (1.6x chance)",
      "Good in individual challenges (+2)",
    ],
    weaknesses: [
      "Energy drops faster when exploring (0.85x recovery)",
      "Higher thirst decay from exhaustion (1.2x)",
      "No social advantages",
    ],
  },
};

/**
 * Apply character traits to base stats
 */
export function applyCharacterModifiers(
  baseStats: {
    energy: number;
    hunger: number;
    thirst: number;
    social: number;
  },
  archetype: ArchetypeId
): {
  energy: number;
  hunger: number;
  thirst: number;
  social: number;
} {
  const trait = CHARACTER_ARCHETYPES[archetype];

  return {
    energy: Math.floor(baseStats.energy * trait.energyMultiplier),
    hunger: baseStats.hunger,
    thirst: baseStats.thirst,
    social: baseStats.social + trait.socialBonus,
  };
}

/**
 * Calculate stat decay for camp phase
 */
export function calculateStatDecay(
  currentStats: { hunger: number; thirst: number },
  archetype: ArchetypeId,
  decayRate: number = 10 // Base decay per camp phase
): { hungerDecay: number; thirstDecay: number } {
  const trait = CHARACTER_ARCHETYPES[archetype];

  return {
    hungerDecay: Math.floor(decayRate * trait.hungerDecay),
    thirstDecay: Math.floor(decayRate * trait.thirstDecay),
  };
}

/**
 * Get challenge bonus for archetype
 */
export function getChallengeBonus(
  archetype: ArchetypeId,
  challengeType: "team" | "individual"
): number {
  const trait = CHARACTER_ARCHETYPES[archetype];
  const typeBonus = challengeType === "team"
    ? trait.teamChallengeBonus
    : trait.individualChallengeBonus;

  return trait.challengeBonus + typeBonus;
}

/**
 * Calculate debuff penalty with resistance
 */
export function calculateDebuffPenalty(
  debuffs: string[],
  archetype: ArchetypeId,
  baseDebuffPenalty: number = 2
): number {
  const trait = CHARACTER_ARCHETYPES[archetype];
  const rawPenalty = debuffs.length * baseDebuffPenalty;
  const reducedPenalty = rawPenalty * (1 - trait.debuffResistance);

  return Math.floor(reducedPenalty);
}
