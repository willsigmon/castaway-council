/**
 * Challenge Template Library
 * Predefined challenge structures with strategic depth
 */

export type ChallengeDifficulty = "easy" | "medium" | "hard" | "extreme";
export type StatFocus = "energy" | "social" | "balanced" | "endurance";

export interface ChallengeEncounter {
  id: string;
  name: string;
  description: string;
  statFocus: StatFocus;
  difficultyModifier: number; // Added to target difficulty
}

export interface ChallengeTemplate {
  id: string;
  name: string;
  description: string;
  type: "team" | "individual";
  difficulty: ChallengeDifficulty;
  encounters: ChallengeEncounter[];
  rewards: {
    winner: string;
    loser: string;
  };
  targetScore?: number; // For team challenges
  topKPlayers?: number; // How many player scores count for team (e.g., top 3)
}

export const CHALLENGE_ENCOUNTERS: Record<string, ChallengeEncounter> = {
  // Physical Encounters
  climb: {
    id: "climb",
    name: "Rope Climb",
    description: "Scale a 30-foot rope wall",
    statFocus: "energy",
    difficultyModifier: 2,
  },
  swim: {
    id: "swim",
    name: "Ocean Swim",
    description: "Swim through choppy waters to retrieve a buoy",
    statFocus: "energy",
    difficultyModifier: 3,
  },
  balance: {
    id: "balance",
    name: "Balance Beam",
    description: "Cross narrow beam while carrying weight",
    statFocus: "balanced",
    difficultyModifier: 1,
  },
  dig: {
    id: "dig",
    name: "Sand Dig",
    description: "Dig through sand to find buried keys",
    statFocus: "endurance",
    difficultyModifier: 2,
  },

  // Mental Encounters
  puzzle: {
    id: "puzzle",
    name: "Logic Puzzle",
    description: "Solve multi-step combination lock",
    statFocus: "social", // Intelligence/focus (mapped to social for now)
    difficultyModifier: 2,
  },
  memory: {
    id: "memory",
    name: "Memory Match",
    description: "Recall sequence of symbols shown earlier",
    statFocus: "social",
    difficultyModifier: 3,
  },
  navigation: {
    id: "navigation",
    name: "Jungle Navigation",
    description: "Use map and compass to find checkpoints",
    statFocus: "balanced",
    difficultyModifier: 2,
  },

  // Endurance Encounters
  hold: {
    id: "hold",
    name: "Endurance Hold",
    description: "Hold uncomfortable position as long as possible",
    statFocus: "endurance",
    difficultyModifier: 4,
  },
  carry: {
    id: "carry",
    name: "Heavy Carry",
    description: "Transport heavy supplies across beach",
    statFocus: "endurance",
    difficultyModifier: 3,
  },

  // Social/Teamwork Encounters
  communicate: {
    id: "communicate",
    name: "Blind Communication",
    description: "One player guides blindfolded teammate",
    statFocus: "social",
    difficultyModifier: 2,
  },
  assemble: {
    id: "assemble",
    name: "Team Assembly",
    description: "Work together to build structure",
    statFocus: "social",
    difficultyModifier: 1,
  },
};

export const CHALLENGE_TEMPLATES: Record<string, ChallengeTemplate> = {
  // Classic Team Challenges
  obstacleCourse: {
    id: "obstacleCourse",
    name: "Island Gauntlet",
    description: "Navigate obstacle course through jungle, beach, and water",
    type: "team",
    difficulty: "medium",
    encounters: [
      CHALLENGE_ENCOUNTERS.climb,
      CHALLENGE_ENCOUNTERS.swim,
      CHALLENGE_ENCOUNTERS.puzzle,
    ],
    rewards: {
      winner: "Immunity + fishing gear",
      loser: "Attend tribal council",
    },
    topKPlayers: 3, // Top 3 scores from each tribe count
  },

  tribalQuest: {
    id: "tribalQuest",
    name: "Tribal Quest",
    description: "Teamwork-focused challenge requiring coordination",
    type: "team",
    difficulty: "easy",
    encounters: [
      CHALLENGE_ENCOUNTERS.communicate,
      CHALLENGE_ENCOUNTERS.assemble,
    ],
    rewards: {
      winner: "Immunity + comfort items",
      loser: "Tribal council",
    },
    topKPlayers: 4,
  },

  beachAssault: {
    id: "beachAssault",
    name: "Beach Assault",
    description: "Physical endurance course across sand and surf",
    type: "team",
    difficulty: "hard",
    encounters: [
      CHALLENGE_ENCOUNTERS.dig,
      CHALLENGE_ENCOUNTERS.swim,
      CHALLENGE_ENCOUNTERS.carry,
    ],
    rewards: {
      winner: "Immunity + full meal",
      loser: "Tribal council + hunger penalty",
    },
    topKPlayers: 3,
  },

  // Individual Immunity Challenges
  enduranceStand: {
    id: "enduranceStand",
    name: "Last One Standing",
    description: "Hold difficult position until everyone else drops",
    type: "individual",
    difficulty: "extreme",
    encounters: [CHALLENGE_ENCOUNTERS.hold],
    rewards: {
      winner: "Individual immunity necklace",
      loser: "Vulnerable at tribal council",
    },
  },

  soloPursuit: {
    id: "soloPursuit",
    name: "Solo Pursuit",
    description: "Individual race through jungle obstacles",
    type: "individual",
    difficulty: "medium",
    encounters: [
      CHALLENGE_ENCOUNTERS.climb,
      CHALLENGE_ENCOUNTERS.balance,
      CHALLENGE_ENCOUNTERS.puzzle,
    ],
    rewards: {
      winner: "Individual immunity + advantage",
      loser: "Vulnerable",
    },
  },

  memoryMaze: {
    id: "memoryMaze",
    name: "Memory Maze",
    description: "Mental challenge testing recall and navigation",
    type: "individual",
    difficulty: "hard",
    encounters: [
      CHALLENGE_ENCOUNTERS.memory,
      CHALLENGE_ENCOUNTERS.navigation,
    ],
    rewards: {
      winner: "Individual immunity + idol clue",
      loser: "Vulnerable",
    },
  },

  survivor101: {
    id: "survivor101",
    name: "Survivor 101",
    description: "Multi-stage survival skills test",
    type: "individual",
    difficulty: "medium",
    encounters: [
      CHALLENGE_ENCOUNTERS.dig,
      CHALLENGE_ENCOUNTERS.puzzle,
      CHALLENGE_ENCOUNTERS.carry,
    ],
    rewards: {
      winner: "Individual immunity",
      loser: "Vulnerable",
    },
  },

  // Merge Challenges (post-Day 10)
  finalStand: {
    id: "finalStand",
    name: "Final Stand",
    description: "Ultimate endurance test for final immunity",
    type: "individual",
    difficulty: "extreme",
    encounters: [
      CHALLENGE_ENCOUNTERS.hold,
      CHALLENGE_ENCOUNTERS.balance,
    ],
    rewards: {
      winner: "Final immunity + guaranteed Final 3",
      loser: "At risk of elimination",
    },
  },

  championRun: {
    id: "championRun",
    name: "Champion's Run",
    description: "Revisit iconic challenges from the season",
    type: "individual",
    difficulty: "hard",
    encounters: [
      CHALLENGE_ENCOUNTERS.climb,
      CHALLENGE_ENCOUNTERS.swim,
      CHALLENGE_ENCOUNTERS.memory,
      CHALLENGE_ENCOUNTERS.puzzle,
    ],
    rewards: {
      winner: "Final immunity",
      loser: "Jury awaits",
    },
  },
};

/**
 * Generate challenge schedule for a season
 */
export interface ChallengeSchedule {
  day: number;
  templateId: string;
  type: "team" | "individual";
}

export function generateSeasonChallengeSchedule(
  totalDays: number = 12,
  mergeDay: number = 10
): ChallengeSchedule[] {
  const schedule: ChallengeSchedule[] = [];

  // Pre-merge: Team challenges (Days 1-9)
  const teamChallenges = [
    "tribalQuest", // Day 1 - Easy starter
    "obstacleCourse", // Day 3
    "beachAssault", // Day 5
    "tribalQuest", // Day 7 - Repeat
    "obstacleCourse", // Day 9
  ];

  let teamIndex = 0;
  for (let day = 1; day < mergeDay; day += 2) {
    schedule.push({
      day,
      templateId: teamChallenges[teamIndex % teamChallenges.length],
      type: "team",
    });
    teamIndex++;
  }

  // Post-merge: Individual challenges (Day 10+)
  const individualChallenges = [
    "soloPursuit", // Day 10 - First individual
    "memoryMaze", // Day 11
    "enduranceStand", // Day 12 - Classic endurance
  ];

  let individualIndex = 0;
  for (let day = mergeDay; day <= totalDays; day++) {
    const templateId =
      day === totalDays
        ? "finalStand" // Always use final stand for last challenge
        : individualChallenges[individualIndex % individualChallenges.length];

    schedule.push({
      day,
      templateId,
      type: "individual",
    });
    individualIndex++;
  }

  return schedule;
}

/**
 * Get challenge template by ID
 */
export function getChallengeTemplate(templateId: string): ChallengeTemplate | null {
  return CHALLENGE_TEMPLATES[templateId] || null;
}

/**
 * Generate encounters JSON for database storage
 */
export function generateEncountersJson(templateId: string): Array<{
  id: string;
  type: "team" | "individual";
  name: string;
  description: string;
  statFocus: StatFocus;
}> {
  const template = getChallengeTemplate(templateId);
  if (!template) return [];

  return template.encounters.map((encounter) => ({
    id: encounter.id,
    type: template.type,
    name: encounter.name,
    description: encounter.description,
    statFocus: encounter.statFocus,
  }));
}
