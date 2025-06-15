import { players, battles, users, type Player, type InsertPlayer, type Battle, type InsertBattle, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Player operations
  getPlayer(id: number): Promise<Player | undefined>;
  getPlayerByName(name: string): Promise<Player | undefined>;
  getAllPlayers(): Promise<Player[]>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayer(id: number, updates: Partial<Player>): Promise<Player | undefined>;
  deletePlayer(id: number): Promise<boolean>;
  
  // Battle operations
  createBattle(battle: InsertBattle): Promise<Battle>;
  getAllBattles(): Promise<Battle[]>;
  getRecentBattles(limit: number): Promise<Battle[]>;
  getBattle(id: number): Promise<Battle | undefined>;
  deleteBattle(id: number): Promise<boolean>;
  
  // Utility operations
  resetAllData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getPlayer(id: number): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.id, id));
    return player || undefined;
  }

  async getPlayerByName(name: string): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.name, name));
    return player || undefined;
  }

  async getAllPlayers(): Promise<Player[]> {
    const allPlayers = await db.select().from(players);
    return allPlayers.sort((a, b) => b.elo - a.elo);
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const [player] = await db
      .insert(players)
      .values({
        ...insertPlayer,
        elo: insertPlayer.elo || 1200,
      })
      .returning();
    return player;
  }

  async updatePlayer(id: number, updates: Partial<Player>): Promise<Player | undefined> {
    const [player] = await db
      .update(players)
      .set(updates)
      .where(eq(players.id, id))
      .returning();
    return player || undefined;
  }

  async deletePlayer(id: number): Promise<boolean> {
    const result = await db.delete(players).where(eq(players.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async createBattle(insertBattle: InsertBattle): Promise<Battle> {
    const [battle] = await db
      .insert(battles)
      .values({
        ...insertBattle,
        notes: insertBattle.notes || null,
      })
      .returning();
    return battle;
  }

  async getAllBattles(): Promise<Battle[]> {
    const allBattles = await db.select().from(battles);
    return allBattles.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getRecentBattles(limit: number): Promise<Battle[]> {
    const recentBattles = await db
      .select()
      .from(battles)
      .orderBy(desc(battles.createdAt))
      .limit(limit);
    return recentBattles;
  }

  async getBattle(id: number): Promise<Battle | undefined> {
    const [battle] = await db.select().from(battles).where(eq(battles.id, id));
    return battle || undefined;
  }

  async deleteBattle(id: number): Promise<boolean> {
    const result = await db.delete(battles).where(eq(battles.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async resetAllData(): Promise<void> {
    await db.delete(battles);
    await db.delete(players);
  }
}

export const storage = new DatabaseStorage();
