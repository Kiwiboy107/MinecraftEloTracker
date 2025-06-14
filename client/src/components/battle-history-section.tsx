import { useQuery, useMutation } from "@tanstack/react-query";
import { History, Trash2, Swords } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Player, Battle } from "@shared/schema";

export default function BattleHistorySection() {
  const { toast } = useToast();
  
  const { data: players = [] } = useQuery<Player[]>({
    queryKey: ['/api/players'],
  });

  const { data: battles = [] } = useQuery<Battle[]>({
    queryKey: ['/api/battles'],
  });

  const deleteBattleMutation = useMutation({
    mutationFn: async (battleId: number) => {
      return apiRequest('DELETE', `/api/battles/${battleId}`);
    },
    onSuccess: () => {
      toast({
        title: "Battle Deleted",
        description: "The battle has been removed and Elo changes have been reversed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/players'] });
      queryClient.invalidateQueries({ queryKey: ['/api/battles'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete battle",
        variant: "destructive",
      });
    },
  });

  const formatBattleDescription = (battle: Battle) => {
    const teamANames = battle.teamA as number[];
    const teamBNames = battle.teamB as number[];
    
    const getPlayerName = (id: number) => {
      const player = players.find(p => p.id === id);
      return player?.name || `Player ${id}`;
    };

    const teamAStr = teamANames.map(getPlayerName).join(", ");
    const teamBStr = teamBNames.map(getPlayerName).join(", ");
    
    return `${teamAStr} vs ${teamBStr}`;
  };

  const formatTime = (date: Date | string) => {
    const battleDate = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - battleDate.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  const handleDeleteBattle = (battleId: number, battleDescription: string) => {
    if (window.confirm(`Are you sure you want to delete this battle: ${battleDescription}? This will reverse all Elo changes from this battle.`)) {
      deleteBattleMutation.mutate(battleId);
    }
  };

  return (
    <section id="battle-history" className="gaming-card rounded-xl p-6">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl font-bold text-gray-100 flex items-center space-x-2">
          <History className="text-yellow-500" />
          <span>Battle History</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {battles.length === 0 ? (
          <div className="text-center py-12">
            <Swords className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No Battles Yet</h3>
            <p className="text-gray-500">Record some battles to see the history!</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {battles.map((battle) => {
              const eloChanges = battle.eloChanges as Record<string, number>;
              const maxEloChange = Math.max(...Object.values(eloChanges).map(Math.abs));
              const winningTeam = battle.winningTeam === 'A' ? 'Team A' : 'Team B';
              
              return (
                <div key={battle.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/30">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Swords className="text-red-400 w-5 h-5" />
                      <span className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded font-mono">
                        {battle.battleType}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-200">{formatBattleDescription(battle)}</div>
                      <div className="text-sm text-gray-400">
                        Winner: <span className="text-[var(--minecraft-green)]">{winningTeam}</span>
                        {battle.notes && (
                          <span className="ml-2 text-gray-500">• {battle.notes}</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{formatTime(battle.createdAt)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-sm font-mono text-[var(--minecraft-green)] font-bold">
                        ±{maxEloChange}
                      </div>
                      <div className="text-xs text-gray-400">Elo change</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteBattle(battle.id, formatBattleDescription(battle))}
                      disabled={deleteBattleMutation.isPending}
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-2"
                      title="Delete battle and reverse Elo changes"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </section>
  );
}