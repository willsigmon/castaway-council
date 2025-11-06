import { pgTable, text, timestamp, integer, boolean, jsonb, pgEnum, uuid, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const seasonStatusEnum = pgEnum("season_status", ["planned", "active", "complete"]);
export const gameModeEnum = pgEnum("game_mode", ["classic", "speed", "hardcore", "casual"]);
export const characterArchetypeEnum = pgEnum("character_archetype", [
  "hunter",
  "strategist",
  "builder",
  "medic",
  "leader",
  "scout",
]);
export const playerRoleEnum = pgEnum("player_role", ["contestant", "jury", "spectator"]);
export const channelTypeEnum = pgEnum("channel_type", ["tribe", "dm", "public"]);
export const itemTypeEnum = pgEnum("item_type", ["idol", "tool", "event"]);
export const challengeTypeEnum = pgEnum("challenge_type", ["team", "individual"]);
export const subjectTypeEnum = pgEnum("subject_type", ["player", "tribe"]);
export const eventKindEnum = pgEnum("event_kind", [
  "phase_open",
  "phase_close",
  "idol_found",
  "storm",
  "swap",
  "eliminate",
  "merge",
  "medevac",
]);

// Tables
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  handle: text("handle").notNull().unique(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const seasons = pgTable(
  "seasons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    status: seasonStatusEnum("status").notNull().default("planned"),
    gameMode: gameModeEnum("game_mode").notNull().default("classic"),
    startAt: timestamp("start_at"),
    dayIndex: integer("day_index").notNull().default(0),
  },
  (table) => ({
    statusIdx: index("seasons_status_idx").on(table.status),
  })
);

export const players = pgTable(
  "players",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id),
    seasonId: uuid("season_id").notNull().references(() => seasons.id),
    displayName: text("display_name").notNull(),
    archetype: characterArchetypeEnum("archetype").notNull().default("hunter"),
    eliminatedAt: timestamp("eliminated_at"),
    evacuatedAt: timestamp("evacuated_at"),
    evacuationReason: text("evacuation_reason"), // 'inactivity' | 'medical'
    lastActiveAt: timestamp("last_active_at").defaultNow().notNull(),
    role: playerRoleEnum("role").notNull().default("contestant"),
  },
  (table) => ({
    userIdIdx: index("players_user_id_idx").on(table.userId),
    seasonIdIdx: index("players_season_id_idx").on(table.seasonId),
  })
);

export const tribes = pgTable("tribes", {
  id: uuid("id").primaryKey().defaultRandom(),
  seasonId: uuid("season_id").notNull().references(() => seasons.id),
  name: text("name").notNull(),
  color: text("color").notNull(),
});

export const tribeMembers = pgTable(
  "tribe_members",
  {
    tribeId: uuid("tribe_id")
      .notNull()
      .references(() => tribes.id, { onDelete: "cascade" }),
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: index("tribe_members_pk").on(table.tribeId, table.playerId),
  })
);

export const alliances = pgTable("alliances", {
  id: uuid("id").primaryKey().defaultRandom(),
  seasonId: uuid("season_id").notNull().references(() => seasons.id),
  name: text("name").notNull(),
});

export const allianceMembers = pgTable(
  "alliance_members",
  {
    allianceId: uuid("alliance_id")
      .notNull()
      .references(() => alliances.id, { onDelete: "cascade" }),
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: index("alliance_members_pk").on(table.allianceId, table.playerId),
  })
);

export const stats = pgTable(
  "stats",
  {
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    day: integer("day").notNull(),
    energy: integer("energy").notNull().default(100),
    hunger: integer("hunger").notNull().default(100),
    thirst: integer("thirst").notNull().default(100),
    social: integer("social").notNull().default(50),
  },
  (table) => ({
    pk: index("stats_pk").on(table.playerId, table.day),
  })
);

export const debuffs = pgTable(
  "debuffs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    seasonId: uuid("season_id").notNull().references(() => seasons.id),
    day: integer("day").notNull(),
    kind: text("kind").notNull(), // 'exhausted', 'critically_exhausted', 'starving', 'dehydrated', 'tainted_water', 'heat_stroke', 'injured'
    severity: integer("severity").notNull().default(1), // 1-3
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    playerIdx: index("debuffs_player_idx").on(table.playerId),
    activeIdx: index("debuffs_active_idx").on(table.playerId, table.expiresAt),
  })
);

export const actions = pgTable(
  "actions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    seasonId: uuid("season_id").notNull().references(() => seasons.id),
    day: integer("day").notNull(),
    actionType: text("action_type").notNull(), // 'forage', 'fish', 'water', 'rest', 'help', 'build', 'explore', 'craft'
    success: boolean("success").notNull(),
    outcomeText: text("outcome_text").notNull(),
    statDeltas: jsonb("stat_deltas"), // { energy: 10, hunger: -5 }
    targetPlayerId: uuid("target_player_id").references(() => players.id), // For help action
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    playerDayIdx: index("actions_player_day_idx").on(table.playerId, table.day),
    seasonDayIdx: index("actions_season_day_idx").on(table.seasonId, table.day),
  })
);

export const items = pgTable("items", {
  id: uuid("id").primaryKey().defaultRandom(),
  seasonId: uuid("season_id").notNull().references(() => seasons.id),
  type: itemTypeEnum("type").notNull(),
  ownerPlayerId: uuid("owner_player_id").references(() => players.id),
  hiddenLocation: text("hidden_location"),
  charges: integer("charges").default(1),
});

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    seasonId: uuid("season_id").notNull().references(() => seasons.id),
    channelType: channelTypeEnum("channel_type").notNull(),
    tribeId: uuid("tribe_id").references(() => tribes.id),
    fromPlayerId: uuid("from_player_id").notNull().references(() => players.id),
    toPlayerId: uuid("to_player_id").references(() => players.id),
    body: text("body").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    seasonIdx: index("messages_season_idx").on(table.seasonId),
    tribeIdx: index("messages_tribe_idx").on(table.tribeId),
    channelIdx: index("messages_channel_idx").on(table.channelType, table.seasonId),
  })
);

export const confessionals = pgTable(
  "confessionals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    playerId: uuid("player_id").notNull().references(() => players.id),
    body: text("body").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    visibility: text("visibility").notNull().default("private"), // 'private' | 'postseason'
  },
  (table) => ({
    playerIdx: index("confessionals_player_idx").on(table.playerId),
  })
);

export const challenges = pgTable("challenges", {
  id: uuid("id").primaryKey().defaultRandom(),
  seasonId: uuid("season_id").notNull().references(() => seasons.id),
  day: integer("day").notNull(),
  type: challengeTypeEnum("type").notNull(),
  encountersJson: jsonb("encounters_json").notNull(),
  seedCommit: text("seed_commit"), // SHA256 hash of server seed
  serverSeed: text("server_seed"), // Revealed after commit phase closes
  clientSeedsJson: jsonb("client_seeds_json"), // playerId -> client_seed (revealed after commit phase)
});

export const challengeCommits = pgTable(
  "challenge_commits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    challengeId: uuid("challenge_id").notNull().references(() => challenges.id, { onDelete: "cascade" }),
    playerId: uuid("player_id").notNull().references(() => players.id),
    clientSeedHash: text("client_seed_hash").notNull(), // SHA256 hash
    clientSeed: text("client_seed"), // Revealed after commit phase closes
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    challengePlayerIdx: index("challenge_commits_challenge_player_idx").on(table.challengeId, table.playerId),
  })
);

export const challengeResults = pgTable(
  "challenge_results",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    challengeId: uuid("challenge_id").notNull().references(() => challenges.id),
    subjectType: subjectTypeEnum("subject_type").notNull(),
    subjectId: uuid("subject_id").notNull(),
    roll: integer("roll").notNull(),
    modifiersJson: jsonb("modifiers_json"),
    total: integer("total").notNull(),
  },
  (table) => ({
    challengeIdx: index("challenge_results_challenge_idx").on(table.challengeId),
  })
);

export const votes = pgTable(
  "votes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    seasonId: uuid("season_id").notNull().references(() => seasons.id),
    day: integer("day").notNull(),
    voterPlayerId: uuid("voter_player_id").notNull().references(() => players.id),
    targetPlayerId: uuid("target_player_id").notNull().references(() => players.id),
    idolPlayed: boolean("idol_played").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    revealedAt: timestamp("revealed_at"),
  },
  (table) => ({
    seasonDayIdx: index("votes_season_day_idx").on(table.seasonId, table.day),
    voterIdx: index("votes_voter_idx").on(table.voterPlayerId),
  })
);

export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    seasonId: uuid("season_id").notNull().references(() => seasons.id),
    day: integer("day").notNull(),
    kind: eventKindEnum("kind").notNull(),
    payloadJson: jsonb("payload_json"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    seasonDayIdx: index("events_season_day_idx").on(table.seasonId, table.day),
    kindIdx: index("events_kind_idx").on(table.kind),
  })
);

export const pushSubscriptions = pgTable(
  "push_subscriptions",
  {
    userId: uuid("user_id").notNull().references(() => users.id),
    endpoint: text("endpoint").notNull(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("push_subscriptions_user_idx").on(table.userId),
  })
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  players: many(players),
  pushSubscriptions: many(pushSubscriptions),
}));

export const seasonsRelations = relations(seasons, ({ many }) => ({
  players: many(players),
  tribes: many(tribes),
  challenges: many(challenges),
  votes: many(votes),
  events: many(events),
  items: many(items),
  messages: many(messages),
  debuffs: many(debuffs),
  actions: many(actions),
}));

export const playersRelations = relations(players, ({ one, many }) => ({
  user: one(users, {
    fields: [players.userId],
    references: [users.id],
  }),
  season: one(seasons, {
    fields: [players.seasonId],
    references: [seasons.id],
  }),
  stats: many(stats),
  debuffs: many(debuffs),
  actions: many(actions),
  votesCast: many(votes, { relationName: "votesCast" }),
  votesReceived: many(votes, { relationName: "votesReceived" }),
}));

export const debuffsRelations = relations(debuffs, ({ one }) => ({
  player: one(players, {
    fields: [debuffs.playerId],
    references: [players.id],
  }),
  season: one(seasons, {
    fields: [debuffs.seasonId],
    references: [seasons.id],
  }),
}));

export const actionsRelations = relations(actions, ({ one }) => ({
  player: one(players, {
    fields: [actions.playerId],
    references: [players.id],
  }),
  season: one(seasons, {
    fields: [actions.seasonId],
    references: [seasons.id],
  }),
  targetPlayer: one(players, {
    fields: [actions.targetPlayerId],
    references: [players.id],
  }),
}));
