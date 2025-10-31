/**
 * Game Rules Configuration
 * Defines gameplay parameters for different game modes
 */

export type GameMode = "classic" | "speed" | "hardcore" | "casual";

export interface PhaseDurations {
  camp: number; // milliseconds
  challenge: number;
  vote: number;
}

export interface GameRules {
  mode: GameMode;
  description: string;

  // Season structure
  totalDays: number;
  mergeDay: number;
  finalDay: number;

  // Phase timing
  phaseDurations: PhaseDurations;

  // Stats & survival
  startingStats: {
    energy: number;
    hunger: number;
    thirst: number;
    social: number;
  };
  statDecayRate: number; // Base decay per camp phase
  minSurvivalStats: number; // Below this, player gets debuffs

  // Items & advantages
  idolsEnabled: boolean;
  maxIdolsPerSeason: number;
  idolRespawnEnabled: boolean; // Respawn after use
  advantagesEnabled: boolean;

  // Challenge mechanics
  challengeRewards: {
    energyBoost: number; // Boost for winners
    hungerRestore: number;
    thirstRestore: number;
  };
  challengeFailurePenalty: {
    energyLoss: number;
    hungerLoss: number;
  };

  // Voting & elimination
  tiebreakMechanic: "revote" | "firemaking" | "random" | "rocks";
  juryStartDay: number; // Day eliminated players join jury
  jurySize: number;

  // Difficulty modifiers
  debuffThreshold: number; // Energy % below which debuffs apply
  stormChance: number; // 0-1 probability of storm event per day
  swapEnabled: boolean;
  swapDay?: number;

  // Social mechanics
  alliancesVisible: boolean; // Can players see alliance memberships?
  confessionalCost: number; // Energy cost to write confessional
}

export const GAME_MODES: Record<GameMode, GameRules> = {
  classic: {
    mode: "classic",
    description: "Traditional Survivor experience with balanced pacing",
    totalDays: 12,
    mergeDay: 10,
    finalDay: 12,
    phaseDurations: {
      camp: 8 * 60 * 60 * 1000, // 8 hours
      challenge: 8 * 60 * 60 * 1000,
      vote: 6 * 60 * 60 * 1000,
    },
    startingStats: {
      energy: 100,
      hunger: 100,
      thirst: 100,
      social: 50,
    },
    statDecayRate: 10,
    minSurvivalStats: 30,
    idolsEnabled: true,
    maxIdolsPerSeason: 3,
    idolRespawnEnabled: false,
    advantagesEnabled: true,
    challengeRewards: {
      energyBoost: 20,
      hungerRestore: 30,
      thirstRestore: 30,
    },
    challengeFailurePenalty: {
      energyLoss: 10,
      hungerLoss: 5,
    },
    tiebreakMechanic: "firemaking",
    juryStartDay: 7,
    jurySize: 7,
    debuffThreshold: 40,
    stormChance: 0.1,
    swapEnabled: true,
    swapDay: 6,
    alliancesVisible: false,
    confessionalCost: 5,
  },

  speed: {
    mode: "speed",
    description: "Fast-paced chaos for quick seasons (perfect for testing)",
    totalDays: 6,
    mergeDay: 4,
    finalDay: 6,
    phaseDurations: {
      camp: 2 * 60 * 60 * 1000, // 2 hours
      challenge: 2 * 60 * 60 * 1000,
      vote: 1 * 60 * 60 * 1000,
    },
    startingStats: {
      energy: 100,
      hunger: 100,
      thirst: 100,
      social: 50,
    },
    statDecayRate: 20, // Faster decay
    minSurvivalStats: 20,
    idolsEnabled: false, // Too chaotic
    maxIdolsPerSeason: 0,
    idolRespawnEnabled: false,
    advantagesEnabled: false,
    challengeRewards: {
      energyBoost: 30,
      hungerRestore: 40,
      thirstRestore: 40,
    },
    challengeFailurePenalty: {
      energyLoss: 15,
      hungerLoss: 10,
    },
    tiebreakMechanic: "random",
    juryStartDay: 3,
    jurySize: 3,
    debuffThreshold: 30,
    stormChance: 0.2, // More chaos
    swapEnabled: false,
    alliancesVisible: true, // More transparency in speed mode
    confessionalCost: 2,
  },

  hardcore: {
    mode: "hardcore",
    description: "Brutal survival with harsh penalties and high stakes",
    totalDays: 15,
    mergeDay: 12,
    finalDay: 15,
    phaseDurations: {
      camp: 12 * 60 * 60 * 1000, // 12 hours
      challenge: 10 * 60 * 60 * 1000,
      vote: 8 * 60 * 60 * 1000,
    },
    startingStats: {
      energy: 80, // Start weaker
      hunger: 80,
      thirst: 80,
      social: 30,
    },
    statDecayRate: 15,
    minSurvivalStats: 40,
    idolsEnabled: true,
    maxIdolsPerSeason: 2, // Fewer idols
    idolRespawnEnabled: false,
    advantagesEnabled: true,
    challengeRewards: {
      energyBoost: 15, // Smaller rewards
      hungerRestore: 20,
      thirstRestore: 20,
    },
    challengeFailurePenalty: {
      energyLoss: 20, // Harsh penalties
      hungerLoss: 15,
    },
    tiebreakMechanic: "firemaking",
    juryStartDay: 10,
    jurySize: 9,
    debuffThreshold: 50, // Higher threshold = easier to get debuffed
    stormChance: 0.25,
    swapEnabled: true,
    swapDay: 7,
    alliancesVisible: false,
    confessionalCost: 10, // Expensive
  },

  casual: {
    mode: "casual",
    description: "Relaxed gameplay with forgiving mechanics",
    totalDays: 10,
    mergeDay: 8,
    finalDay: 10,
    phaseDurations: {
      camp: 6 * 60 * 60 * 1000, // 6 hours
      challenge: 6 * 60 * 60 * 1000,
      vote: 4 * 60 * 60 * 1000,
    },
    startingStats: {
      energy: 120, // Start stronger
      hunger: 120,
      thirst: 120,
      social: 60,
    },
    statDecayRate: 5, // Slow decay
    minSurvivalStats: 20,
    idolsEnabled: true,
    maxIdolsPerSeason: 5, // More idols
    idolRespawnEnabled: true,
    advantagesEnabled: true,
    challengeRewards: {
      energyBoost: 30,
      hungerRestore: 40,
      thirstRestore: 40,
    },
    challengeFailurePenalty: {
      energyLoss: 5,
      hungerLoss: 3,
    },
    tiebreakMechanic: "revote",
    juryStartDay: 6,
    jurySize: 5,
    debuffThreshold: 25, // Lower threshold = harder to get debuffed
    stormChance: 0.05,
    swapEnabled: true,
    swapDay: 5,
    alliancesVisible: true,
    confessionalCost: 0, // Free confessionals
  },
};

/**
 * Get rules for a specific game mode
 */
export function getGameRules(mode: GameMode = "classic"): GameRules {
  return GAME_MODES[mode];
}

/**
 * Apply difficulty scaling to challenge rewards
 */
export function scaleRewards(
  baseReward: number,
  difficulty: "easy" | "medium" | "hard" | "extreme"
): number {
  const multipliers = {
    easy: 0.8,
    medium: 1.0,
    hard: 1.3,
    extreme: 1.6,
  };

  return Math.floor(baseReward * multipliers[difficulty]);
}

/**
 * Calculate stat penalties for low survival stats
 */
export function calculateSurvivalPenalties(
  stats: { energy: number; hunger: number; thirst: number },
  rules: GameRules
): {
  debuffs: string[];
  energyPenalty: number;
  challengePenalty: number;
} {
  const debuffs: string[] = [];
  let energyPenalty = 0;
  let challengePenalty = 0;

  // Energy debuffs
  if (stats.energy < rules.debuffThreshold) {
    debuffs.push("exhausted");
    energyPenalty += 10;
    challengePenalty += 2;
  }

  if (stats.energy < rules.minSurvivalStats) {
    debuffs.push("critically_exhausted");
    energyPenalty += 20;
    challengePenalty += 4;
  }

  // Hunger debuffs
  if (stats.hunger < rules.minSurvivalStats) {
    debuffs.push("starving");
    energyPenalty += 15;
    challengePenalty += 3;
  }

  // Thirst debuffs
  if (stats.thirst < rules.minSurvivalStats) {
    debuffs.push("dehydrated");
    energyPenalty += 15;
    challengePenalty += 3;
  }

  return { debuffs, energyPenalty, challengePenalty };
}

/**
 * Check if idol can be found based on game rules
 */
export function canFindIdol(
  currentIdolCount: number,
  rules: GameRules,
  day: number
): boolean {
  if (!rules.idolsEnabled) return false;
  if (currentIdolCount >= rules.maxIdolsPerSeason && !rules.idolRespawnEnabled) {
    return false;
  }

  // Idols don't spawn in first 2 days or after merge in non-respawn modes
  if (day < 3) return false;
  if (day >= rules.mergeDay && !rules.idolRespawnEnabled) return false;

  return true;
}
