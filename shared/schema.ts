import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  elo: integer("elo").notNull().default(1200),
  wins: integer("wins").notNull().default(0),
  losses: integer("losses").notNull().default(0),
  lastBattle: timestamp("last_battle"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const battles = pgTable("battles", {
  id: serial("id").primaryKey(),
  teamA: jsonb("team_a").notNull(), // array of player ids
  teamB: jsonb("team_b").notNull(), // array of player ids
  winningTeam: text("winning_team").notNull(), // 'A' or 'B'
  eloChanges: jsonb("elo_changes").notNull(), // object mapping player id to elo change
  battleType: text("battle_type").notNull(), // '1v1', '2v2', etc.
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
  wins: true,
  losses: true,
  lastBattle: true,
  createdAt: true,
}).extend({
  elo: z.number().min(100).max(3000).optional(),
});

export const insertBattleSchema = createInsertSchema(battles).omit({
  id: true,
  createdAt: true,
}).extend({
  teamA: z.array(z.number()).min(1),
  teamB: z.array(z.number()).min(1),
  winningTeam: z.enum(['A', 'B']),
  eloChanges: z.record(z.string(), z.number()),
  notes: z.string().optional(),
});

export type Player = typeof players.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Battle = typeof battles.$inferSelect;
export type InsertBattle = z.infer<typeof insertBattleSchema>;
