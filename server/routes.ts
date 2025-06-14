import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPlayerSchema, insertBattleSchema } from "@shared/schema";
import { calculateEloChanges } from "../client/src/lib/elo";

export async function registerRoutes(app: Express): Promise<Server> {
  // Player routes
  app.get("/api/players", async (req, res) => {
    try {
      const players = await storage.getAllPlayers();
      res.json(players);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch players" });
    }
  });

  app.post("/api/players", async (req, res) => {
    try {
      const result = insertPlayerSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid player data", errors: result.error.errors });
      }

      // Check if player name already exists
      const existingPlayer = await storage.getPlayerByName(result.data.name);
      if (existingPlayer) {
        return res.status(400).json({ message: "Player name already exists" });
      }

      const player = await storage.createPlayer(result.data);
      res.status(201).json(player);
    } catch (error) {
      res.status(500).json({ message: "Failed to create player" });
    }
  });

  app.delete("/api/players/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePlayer(id);
      if (!success) {
        return res.status(404).json({ message: "Player not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete player" });
    }
  });

  // Battle routes
  app.post("/api/battles", async (req, res) => {
    try {
      const result = insertBattleSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid battle data", errors: result.error.errors });
      }

      const battleData = result.data;

      // Validate that all players exist
      const allPlayerIds = [...battleData.teamA, ...battleData.teamB];
      const players = new Map();
      for (const playerId of allPlayerIds) {
        const player = await storage.getPlayer(playerId);
        if (!player) {
          return res.status(400).json({ message: `Player with id ${playerId} not found` });
        }
        players.set(playerId, player);
      }

      // Calculate Elo changes
      const teamAPlayers = battleData.teamA.map(id => players.get(id));
      const teamBPlayers = battleData.teamB.map(id => players.get(id));
      const eloChanges = calculateEloChanges(teamAPlayers, teamBPlayers, battleData.winningTeam);

      // Update battle data with calculated Elo changes
      battleData.eloChanges = eloChanges;

      // Create battle record
      const battle = await storage.createBattle(battleData);

      // Update player stats
      const now = new Date();
      for (const [playerIdStr, eloChange] of Object.entries(eloChanges)) {
        const playerId = parseInt(playerIdStr);
        const player = players.get(playerId);
        const isWinner = (battleData.winningTeam === 'A' && battleData.teamA.includes(playerId)) ||
                        (battleData.winningTeam === 'B' && battleData.teamB.includes(playerId));
        
        await storage.updatePlayer(playerId, {
          elo: player.elo + eloChange,
          wins: player.wins + (isWinner ? 1 : 0),
          losses: player.losses + (isWinner ? 0 : 1),
          lastBattle: now,
        });
      }

      res.status(201).json(battle);
    } catch (error) {
      console.error('Battle creation error:', error);
      res.status(500).json({ message: "Failed to create battle" });
    }
  });

  app.get("/api/battles", async (req, res) => {
    try {
      const battles = await storage.getAllBattles();
      res.json(battles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch battles" });
    }
  });

  app.get("/api/battles/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const battles = await storage.getRecentBattles(limit);
      res.json(battles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent battles" });
    }
  });

  // Statistics routes
  app.get("/api/statistics", async (req, res) => {
    try {
      const players = await storage.getAllPlayers();
      const battles = await storage.getAllBattles();

      // Calculate battle type distribution
      const battleTypes = battles.reduce((acc, battle) => {
        acc[battle.battleType] = (acc[battle.battleType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      res.json({
        totalPlayers: players.length,
        totalBattles: battles.length,
        battleTypes,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Reset route
  app.post("/api/reset", async (req, res) => {
    try {
      await storage.resetAllData();
      res.json({ message: "All data has been reset" });
    } catch (error) {
      res.status(500).json({ message: "Failed to reset data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
