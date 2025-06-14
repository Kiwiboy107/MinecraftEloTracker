import type { Player } from "@shared/schema";

const K_FACTOR = 32;

export function calculateExpectedScore(playerElo: number, opponentElo: number): number {
  return 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
}

export function calculateEloChange(player: Player, expectedScore: number, actualScore: number): number {
  return Math.round(K_FACTOR * (actualScore - expectedScore));
}

export function calculateEloChanges(
  teamA: Player[],
  teamB: Player[],
  winningTeam: 'A' | 'B'
): Record<string, number> {
  // Calculate team Elo ratings by summing individual ratings
  const teamAElo = teamA.reduce((sum, player) => sum + player.elo, 0);
  const teamBElo = teamB.reduce((sum, player) => sum + player.elo, 0);

  // Calculate expected scores for each team
  const teamAExpected = calculateExpectedScore(teamAElo, teamBElo);
  const teamBExpected = calculateExpectedScore(teamBElo, teamAElo);

  // Determine actual scores (1 for win, 0 for loss)
  const teamAActual = winningTeam === 'A' ? 1 : 0;
  const teamBActual = winningTeam === 'B' ? 1 : 0;

  // Calculate total Elo change for each team
  const teamAEloChange = K_FACTOR * (teamAActual - teamAExpected);
  const teamBEloChange = K_FACTOR * (teamBActual - teamBExpected);

  // Distribute Elo changes equally among team members
  const changes: Record<string, number> = {};

  teamA.forEach(player => {
    changes[player.id.toString()] = Math.round(teamAEloChange / teamA.length);
  });

  teamB.forEach(player => {
    changes[player.id.toString()] = Math.round(teamBEloChange / teamB.length);
  });

  return changes;
}

export function calculateTeamStrength(players: Player[]): number {
  return players.reduce((sum, player) => sum + player.elo, 0);
}

export function calculateWinProbability(teamAElo: number, teamBElo: number): number {
  return calculateExpectedScore(teamAElo, teamBElo);
}
