import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { TrendingUp, PieChart, Calendar, BarChart3, Swords, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Player, Battle } from "@shared/schema";

// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

export default function StatisticsSection() {
  const { toast } = useToast();
  
  const { data: players = [] } = useQuery<Player[]>({
    queryKey: ['/api/players'],
  });

  const { data: battles = [] } = useQuery<Battle[]>({
    queryKey: ['/api/battles'],
  });

  const { data: recentBattles = [] } = useQuery<Battle[]>({
    queryKey: ['/api/battles/recent'],
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

  const handleDeleteBattle = (battleId: number, battleDescription: string) => {
    if (window.confirm(`Are you sure you want to delete this battle: ${battleDescription}? This will reverse all Elo changes from this battle.`)) {
      deleteBattleMutation.mutate(battleId);
    }
  };

  // Calculate battle type distribution
  const battleTypeData = battles.reduce((acc, battle) => {
    acc[battle.battleType] = (acc[battle.battleType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Prepare Elo progression data (simplified - showing current Elo vs starting)
  const eloProgressionData = {
    labels: players.map(p => p.name),
    datasets: [
      {
        label: 'Current Elo',
        data: players.map(p => p.elo),
        borderColor: 'hsl(142, 86%, 28%)',
        backgroundColor: 'hsla(142, 86%, 28%, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Starting Elo',
        data: players.map(() => 1200),
        borderColor: 'hsl(217, 91%, 60%)',
        backgroundColor: 'hsla(217, 91%, 60%, 0.1)',
        tension: 0.4,
      },
    ],
  };

  // Battle types chart data
  const battleTypesChartData = {
    labels: Object.keys(battleTypeData),
    datasets: [
      {
        data: Object.values(battleTypeData),
        backgroundColor: [
          'hsl(142, 86%, 28%)',
          'hsl(217, 91%, 60%)',
          'hsl(45, 93%, 50%)',
          'hsl(0, 84%, 60%)',
        ],
        borderColor: 'hsl(220, 13%, 18%)',
        borderWidth: 2,
      },
    ],
  };

  // Win rate distribution
  const winRateData = {
    labels: players.map(p => p.name),
    datasets: [
      {
        label: 'Win Rate %',
        data: players.map(p => {
          const total = p.wins + p.losses;
          return total > 0 ? (p.wins / total) * 100 : 0;
        }),
        backgroundColor: 'hsl(142, 86%, 28%)',
        borderColor: 'hsl(142, 86%, 25%)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#F9FAFB',
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#9CA3AF' },
        grid: { color: '#374151' },
      },
      y: {
        ticks: { color: '#9CA3AF' },
        grid: { color: '#374151' },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#F9FAFB',
        },
      },
    },
  };

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

  if (players.length === 0) {
    return (
      <section id="statistics" className="gaming-card rounded-xl p-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-100 flex items-center space-x-2">
            <BarChart3 className="text-[var(--accent-blue)]" />
            <span>Statistics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No Data Yet</h3>
            <p className="text-gray-500">Add players and record battles to see statistics!</p>
          </div>
        </CardContent>
      </section>
    );
  }

  // Wins vs Losses chart data
  const winsLossesData = {
    labels: players.map(p => p.name),
    datasets: [
      {
        label: 'Wins',
        data: players.map(p => p.wins),
        backgroundColor: 'hsl(142, 86%, 28%)',
        borderColor: 'hsl(142, 86%, 25%)',
        borderWidth: 1,
      },
      {
        label: 'Losses',
        data: players.map(p => p.losses),
        backgroundColor: 'hsl(0, 84%, 60%)',
        borderColor: 'hsl(0, 84%, 55%)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <section id="statistics" className="grid md:grid-cols-2 gap-6">
      <Card className="gaming-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-gray-100 flex items-center space-x-2">
            <TrendingUp className="text-[var(--accent-blue)]" />
            <span>Elo Progression</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Line data={eloProgressionData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      <Card className="gaming-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-gray-100 flex items-center space-x-2">
            <BarChart3 className="text-green-500" />
            <span>Wins vs Losses</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Bar data={winsLossesData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      <Card className="gaming-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-gray-100 flex items-center space-x-2">
            <PieChart className="text-[var(--minecraft-green)]" />
            <span>Battle Types</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {Object.keys(battleTypeData).length > 0 ? (
              <Doughnut data={battleTypesChartData} options={doughnutOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No battles recorded yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="gaming-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-gray-100 flex items-center space-x-2">
            <Calendar className="text-yellow-500" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentBattles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No recent battles
              </div>
            ) : (
              recentBattles.map((battle) => {
                const eloChanges = battle.eloChanges as Record<string, number>;
                const maxEloChange = Math.max(...Object.values(eloChanges).map(Math.abs));
                
                return (
                  <div key={battle.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Swords className="text-red-400 w-4 h-4" />
                      <div>
                        <div className="font-semibold text-sm">{formatBattleDescription(battle)}</div>
                        <div className="text-xs text-gray-400">{formatTime(battle.createdAt)}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-sm font-mono text-[var(--minecraft-green)]">
                        ±{maxEloChange}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBattle(battle.id, formatBattleDescription(battle))}
                        disabled={deleteBattleMutation.isPending}
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="gaming-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-gray-100 flex items-center space-x-2">
            <BarChart3 className="text-purple-500" />
            <span>Win Rate Distribution</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Bar data={winRateData} options={{
              ...chartOptions,
              scales: {
                ...chartOptions.scales,
                y: {
                  ...chartOptions.scales.y,
                  beginAtZero: true,
                  max: 100,
                },
              },
            }} />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
