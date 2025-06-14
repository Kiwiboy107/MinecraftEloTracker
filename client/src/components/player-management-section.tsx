import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Users, UserPlus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Player } from "@shared/schema";

const playerFormSchema = z.object({
  name: z.string().min(1, "Player name is required").max(50, "Name must be 50 characters or less"),
  elo: z.string().optional().transform((val) => val ? parseInt(val) : undefined),
});

type PlayerFormData = z.infer<typeof playerFormSchema>;

export default function PlayerManagementSection() {
  const { toast } = useToast();

  const { data: players = [], isLoading } = useQuery<Player[]>({
    queryKey: ['/api/players'],
  });

  const form = useForm<PlayerFormData>({
    resolver: zodResolver(playerFormSchema),
    defaultValues: {
      name: "",
      elo: "",
    },
  });

  const addPlayerMutation = useMutation({
    mutationFn: async (data: PlayerFormData) => {
      const payload: any = { name: data.name };
      if (data.elo) payload.elo = data.elo;
      
      return apiRequest('POST', '/api/players', payload);
    },
    onSuccess: () => {
      toast({
        title: "Player Added",
        description: "The player has been successfully added to the system.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/players'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add player",
        variant: "destructive",
      });
    },
  });

  const deletePlayerMutation = useMutation({
    mutationFn: async (playerId: number) => {
      return apiRequest('DELETE', `/api/players/${playerId}`);
    },
    onSuccess: () => {
      toast({
        title: "Player Removed",
        description: "The player has been removed from the system.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/players'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove player",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PlayerFormData) => {
    addPlayerMutation.mutate(data);
  };

  const handleDeletePlayer = (playerId: number, playerName: string) => {
    if (window.confirm(`Are you sure you want to remove ${playerName}? This action cannot be undone.`)) {
      deletePlayerMutation.mutate(playerId);
    }
  };

  return (
    <section id="players" className="gaming-card rounded-xl p-6">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl font-bold text-gray-100 flex items-center space-x-2">
          <Users className="text-[var(--accent-blue)]" />
          <span>Player Management</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Add New Player</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300 font-semibold">Player Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter player name..."
                          className="bg-gray-700 border-gray-600 text-gray-100 focus:border-[var(--minecraft-green)] focus:ring-1 focus:ring-[var(--minecraft-green)]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="elo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300 font-semibold">Starting Elo (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="100"
                          max="3000"
                          placeholder="1200"
                          className="bg-gray-700 border-gray-600 text-gray-100 focus:border-[var(--minecraft-green)] focus:ring-1 focus:ring-[var(--minecraft-green)]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={addPlayerMutation.isPending}
                  className="w-full bg-[var(--accent-blue)] hover:bg-blue-600 text-white py-3 font-semibold flex items-center justify-center space-x-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{addPlayerMutation.isPending ? "Adding..." : "Add Player"}</span>
                </Button>
              </form>
            </Form>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Current Players</h3>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-gray-600 rounded animate-pulse" />
                      <div className="w-24 h-4 bg-gray-600 rounded animate-pulse" />
                      <div className="w-12 h-4 bg-gray-600 rounded animate-pulse" />
                    </div>
                    <div className="w-6 h-6 bg-gray-600 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : players.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500">No players added yet</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {players.map((player) => (
                  <div key={player.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-[var(--minecraft-green)] to-emerald-600 rounded flex items-center justify-center text-white font-bold text-xs">
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold">{player.name}</span>
                      <span className="font-mono text-sm text-[var(--minecraft-green)]">({player.elo})</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePlayer(player.id, player.name)}
                      disabled={deletePlayerMutation.isPending}
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </section>
  );
}
