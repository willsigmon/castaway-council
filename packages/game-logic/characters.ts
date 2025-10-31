/**
 * Character Archetype System
 * Defines player character traits that affect gameplay mechanics
 */

export type ArchetypeId =
  | "athlete"
  | "strategist"
  | "survivalist"
  | "diplomat"
  | "opportunist"
  | "wildcard";

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
  athlete: {
    energyMultiplier: 1.2,
    hungerDecay: 1.2, // Athletes get hungrier faster
    thirstDecay: 1.1,
    socialBonus: -5,
    challengeBonus: 3,
    teamChallengeBonus: 2,
    individualChallengeBonus: 4,
    votingInfluence: 0.9,
    idolFindChance: 0.8,
    energyRecoveryRate: 1.3,
    debuffResistance: 0.2,
    description: "Peak physical condition with superior challenge performance",
    strengths: [
      "Excels in individual challenges (+4 bonus)",
      "Faster energy recovery (1.3x)",
      "Strong in team challenges (+2 bonus)",
    ],
    weaknesses: [
      "Burns through hunger/thirst faster",
      "Lower social skills (-5)",
      "Less likely to find idols",
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
    description: "Master of social manipulation and long-term planning",
    strengths: [
      "High social influence (+10)",
      "Better at finding idols (1.3x)",
      "Stronger voting influence (1.5x)",
      "Efficient resource management",
    ],
    weaknesses: [
      "Weaker in physical challenges (-2 individual)",
      "Lower base energy",
    ],
  },

  survivalist: {
    energyMultiplier: 1.0,
    hungerDecay: 0.6,
    thirstDecay: 0.5,
    socialBonus: 0,
    challengeBonus: 1,
    teamChallengeBonus: 0,
    individualChallengeBonus: 2,
    votingInfluence: 1.0,
    idolFindChance: 1.5,
    energyRecoveryRate: 1.4,
    debuffResistance: 0.5,
    description: "Expert at resource management and wilderness survival",
    strengths: [
      "Hunger/thirst decay at half speed",
      "Best idol finder (1.5x chance)",
      "Strong debuff resistance (50%)",
      "Excellent energy recovery (1.4x)",
    ],
    weaknesses: [
      "No social advantages",
      "Average in team challenges",
    ],
  },

  diplomat: {
    energyMultiplier: 0.95,
    hungerDecay: 1.0,
    thirstDecay: 1.0,
    socialBonus: 15,
    challengeBonus: 0,
    teamChallengeBonus: 3,
    individualChallengeBonus: -1,
    votingInfluence: 1.4,
    idolFindChance: 1.0,
    energyRecoveryRate: 1.1,
    debuffResistance: 0.4,
    description: "Natural leader who excels in group dynamics",
    strengths: [
      "Highest social bonus (+15)",
      "Exceptional in team challenges (+3)",
      "Strong voting influence (1.4x)",
      "Good debuff resistance",
    ],
    weaknesses: [
      "Slightly weaker energy",
      "Below average in solo challenges",
    ],
  },

  opportunist: {
    energyMultiplier: 1.05,
    hungerDecay: 1.0,
    thirstDecay: 1.0,
    socialBonus: 5,
    challengeBonus: 2,
    teamChallengeBonus: 1,
    individualChallengeBonus: 1,
    votingInfluence: 1.2,
    idolFindChance: 1.4,
    energyRecoveryRate: 1.2,
    debuffResistance: 0.15,
    description: "Adaptive jack-of-all-trades who capitalizes on opportunities",
    strengths: [
      "Well-rounded stats",
      "Great idol finder (1.4x)",
      "Good voting influence (1.2x)",
      "Solid challenge performance (+2)",
    ],
    weaknesses: [
      "Master of none - no exceptional abilities",
      "Lower debuff resistance",
    ],
  },

  wildcard: {
    energyMultiplier: 1.1,
    hungerDecay: 1.1,
    thirstDecay: 1.1,
    socialBonus: -10,
    challengeBonus: 0,
    teamChallengeBonus: -2,
    individualChallengeBonus: 5,
    votingInfluence: 0.7,
    idolFindChance: 1.2,
    energyRecoveryRate: 1.5,
    debuffResistance: 0.1,
    description: "Unpredictable loner who thrives in chaos",
    strengths: [
      "Massive individual challenge bonus (+5)",
      "Fastest energy recovery (1.5x)",
      "High base energy",
      "Good idol finder",
    ],
    weaknesses: [
      "Poor social skills (-10)",
      "Terrible in team challenges (-2)",
      "Weak voting influence",
      "Low debuff resistance",
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
