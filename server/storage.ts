import { players, battles, type Player, type InsertPlayer, type Battle, type InsertBattle } from "@shared/schema";

export interface IStorage {
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
  
  // Utility operations
  resetAllData(): Promise<void>;
}

export class MemStorage implements IStorage {
  private players: Map<number, Player>;
  private battles: Map<number, Battle>;
  private currentPlayerId: number;
  private currentBattleId: number;

  constructor() {
    this.players = new Map();
    this.battles = new Map();
    this.currentPlayerId = 1;
    this.currentBattleId = 1;
  }

  async getPlayer(id: number): Promise<Player | undefined> {
    return this.players.get(id);
  }

  async getPlayerByName(name: string): Promise<Player | undefined> {
    return Array.from(this.players.values()).find(
      (player) => player.name === name,
    );
  }

  async getAllPlayers(): Promise<Player[]> {
    return Array.from(this.players.values()).sort((a, b) => b.elo - a.elo);
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const id = this.currentPlayerId++;
    const player: Player = {
      ...insertPlayer,
      id,
      elo: insertPlayer.elo || 1200,
      wins: 0,
      losses: 0,
      lastBattle: null,
      createdAt: new Date(),
    };
    this.players.set(id, player);
    return player;
  }

  async updatePlayer(id: number, updates: Partial<Player>): Promise<Player | undefined> {
    const player = this.players.get(id);
    if (!player) return undefined;
    
    const updatedPlayer = { ...player, ...updates };
    this.players.set(id, updatedPlayer);
    return updatedPlayer;
  }

  async deletePlayer(id: number): Promise<boolean> {
    return this.players.delete(id);
  }

  async createBattle(insertBattle: InsertBattle): Promise<Battle> {
    const id = this.currentBattleId++;
    const battle: Battle = {
      ...insertBattle,
      id,
      createdAt: new Date(),
    };
    this.battles.set(id, battle);
    return battle;
  }

  async getAllBattles(): Promise<Battle[]> {
    return Array.from(this.battles.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getRecentBattles(limit: number): Promise<Battle[]> {
    const allBattles = await this.getAllBattles();
    return allBattles.slice(0, limit);
  }

  async resetAllData(): Promise<void> {
    this.players.clear();
    this.battles.clear();
    this.currentPlayerId = 1;
    this.currentBattleId = 1;
  }
}

export const storage = new MemStorage();
