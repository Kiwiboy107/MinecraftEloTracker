import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Clock, ChevronUp, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { Player } from "@shared/schema";

type SortField = 'elo' | 'wins' | 'losses' | 'winRate';
type SortDirection = 'asc' | 'desc';

const getRankIcon = (rank: number) => {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return null;
};

const getRankColor = (rank: number) => {
  if (rank === 1) return "text-yellow-400";
  if (rank === 2) return "text-gray-400";
  if (rank === 3) return "text-amber-600";
  return "text-gray-500";
};

export default function RankingsSection() {
  const [sortField, setSortField] = useState<SortField>('elo');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const { data: players, isLoading } = useQuery<Player[]>({
    queryKey: ['/api/players'],
  });

  const formatLastBattle = (lastBattle: string | null) => {
    if (!lastBattle) return "Never";
    const date = new Date(lastBattle);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  const calculateWinRate = (wins: number, losses: number) => {
    const total = wins + losses;
    if (total === 0) return 0;
    return (wins / total) * 100;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'losses' ? 'asc' : 'desc'); // Losses should default to ascending (lower is better)
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  const sortedPlayers = players ? [...players].sort((a, b) => {
    let aValue: number;
    let bValue: number;

    switch (sortField) {
      case 'elo':
        aValue = a.elo;
        bValue = b.elo;
        break;
      case 'wins':
        aValue = a.wins;
        bValue = b.wins;
        break;
      case 'losses':
        aValue = a.losses;
        bValue = b.losses;
        break;
      case 'winRate':
        aValue = calculateWinRate(a.wins, a.losses);
        bValue = calculateWinRate(b.wins, b.losses);
        break;
    }

    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
  }) : [];

  return (
    <section id="rankings" className="gaming-card rounded-xl p-6">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-gray-100 flex items-center space-x-2">
            <Trophy className="text-yellow-500" />
            <span>Current Rankings</span>
          </CardTitle>
          <div className="text-sm text-gray-400 flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>Live rankings</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4">
                <Skeleton className="w-8 h-8 rounded" />
                <Skeleton className="w-32 h-6" />
                <Skeleton className="w-16 h-6" />
                <Skeleton className="w-12 h-6" />
                <Skeleton className="w-12 h-6" />
                <Skeleton className="w-16 h-6" />
                <Skeleton className="w-24 h-6" />
              </div>
            ))}
          </div>
        ) : !players || players.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No Players Yet</h3>
            <p className="text-gray-500">Add some players to start tracking rankings!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left py-3 px-4 font-semibold text-gray-300">Rank</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-300">Player</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-300">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('elo')}
                      className="text-gray-300 hover:text-[var(--minecraft-green)] p-0 h-auto font-semibold flex items-center space-x-1"
                    >
                      <span>Elo Rating</span>
                      {getSortIcon('elo')}
                    </Button>
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-300">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('wins')}
                      className="text-gray-300 hover:text-[var(--minecraft-green)] p-0 h-auto font-semibold flex items-center space-x-1"
                    >
                      <span>Wins</span>
                      {getSortIcon('wins')}
                    </Button>
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-300">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('losses')}
                      className="text-gray-300 hover:text-[var(--minecraft-green)] p-0 h-auto font-semibold flex items-center space-x-1"
                    >
                      <span>Losses</span>
                      {getSortIcon('losses')}
                    </Button>
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-300">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('winRate')}
                      className="text-gray-300 hover:text-[var(--minecraft-green)] p-0 h-auto font-semibold flex items-center space-x-1"
                    >
                      <span>Win Rate</span>
                      {getSortIcon('winRate')}
                    </Button>
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-300">Last Battle</th>
                </tr>
              </thead>
              <tbody>
                {sortedPlayers.map((player, index) => {
                  const rank = index + 1;
                  const rankIcon = getRankIcon(rank);
                  const rankColor = getRankColor(rank);
                  
                  return (
                    <tr key={player.id} className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {rankIcon && <span className="text-2xl rank-medal">{rankIcon}</span>}
                          <span className={`font-bold ${rankColor}`}>{rank}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-[var(--minecraft-green)] to-emerald-600 rounded flex items-center justify-center text-white font-bold text-sm">
                            {player.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold">{player.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-mono text-lg font-bold text-[var(--minecraft-green)]">{player.elo}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-green-400 font-semibold">{player.wins}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-red-400 font-semibold">{player.losses}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-gray-200">
                          {calculateWinRate(player.wins, player.losses) === 0 ? "0%" : `${calculateWinRate(player.wins, player.losses).toFixed(1)}%`}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-400 text-sm">
                          {formatLastBattle(player.lastBattle ? new Date(player.lastBattle).toISOString() : null)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </section>
  );
}
