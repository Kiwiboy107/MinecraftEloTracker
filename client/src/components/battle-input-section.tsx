import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusCircle, Calculator, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { calculateTeamStrength, calculateWinProbability } from "@/lib/elo";
import type { Player } from "@shared/schema";

const battleFormSchema = z.object({
  battleType: z.string().min(1, "Battle type is required"),
  teamAPlayer1: z.string().min(1, "Team A player 1 is required"),
  teamAPlayer2: z.string().optional(),
  teamBPlayer1: z.string().min(1, "Team B player 1 is required"),
  teamBPlayer2: z.string().optional(),
  winningTeam: z.enum(['A', 'B']),
  notes: z.string().optional(),
});

type BattleFormData = z.infer<typeof battleFormSchema>;

export default function BattleInputSection() {
  const { toast } = useToast();
  const [selectedFormat, setSelectedFormat] = useState("1v1");

  const { data: players = [] } = useQuery<Player[]>({
    queryKey: ['/api/players'],
  });

  const form = useForm<BattleFormData>({
    resolver: zodResolver(battleFormSchema),
    defaultValues: {
      battleType: "1v1",
      winningTeam: "A",
    },
  });

  const recordBattleMutation = useMutation({
    mutationFn: async (data: BattleFormData) => {
      const teamA = [parseInt(data.teamAPlayer1)];
      if (data.teamAPlayer2) teamA.push(parseInt(data.teamAPlayer2));

      const teamB = [parseInt(data.teamBPlayer1)];
      if (data.teamBPlayer2) teamB.push(parseInt(data.teamBPlayer2));

      return apiRequest('POST', '/api/battles', {
        teamA,
        teamB,
        winningTeam: data.winningTeam,
        battleType: data.battleType,
        notes: data.notes || "",
        eloChanges: {}, // Will be calculated on the server
      });
    },
    onSuccess: () => {
      toast({
        title: "Battle Recorded",
        description: "The battle has been recorded and Elo ratings have been updated.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/players'] });
      queryClient.invalidateQueries({ queryKey: ['/api/battles'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record battle",
        variant: "destructive",
      });
    },
  });

  const previewData = useMemo(() => {
    const formData = form.getValues();
    
    const teamA: Player[] = [];
    const teamB: Player[] = [];

    if (formData.teamAPlayer1) {
      const player = players.find(p => p.id.toString() === formData.teamAPlayer1);
      if (player) teamA.push(player);
    }
    if (formData.teamAPlayer2) {
      const player = players.find(p => p.id.toString() === formData.teamAPlayer2);
      if (player) teamA.push(player);
    }
    if (formData.teamBPlayer1) {
      const player = players.find(p => p.id.toString() === formData.teamBPlayer1);
      if (player) teamB.push(player);
    }
    if (formData.teamBPlayer2) {
      const player = players.find(p => p.id.toString() === formData.teamBPlayer2);
      if (player) teamB.push(player);
    }

    const teamAElo = calculateTeamStrength(teamA);
    const teamBElo = calculateTeamStrength(teamB);
    const teamAWinProb = calculateWinProbability(teamAElo, teamBElo);

    return {
      teamAElo,
      teamBElo,
      teamAWinProb,
      teamBWinProb: 1 - teamAWinProb,
      estimatedEloChange: Math.round(32 * (0.5 - Math.min(teamAWinProb, 1 - teamAWinProb))),
    };
  }, [form.watch(), players]);

  const onSubmit = (data: BattleFormData) => {
    // Validate that teams don't have duplicate players
    const allPlayers = [data.teamAPlayer1, data.teamAPlayer2, data.teamBPlayer1, data.teamBPlayer2].filter(Boolean);
    const uniquePlayers = new Set(allPlayers);
    if (allPlayers.length !== uniquePlayers.size) {
      toast({
        title: "Error",
        description: "A player cannot be on both teams or appear multiple times",
        variant: "destructive",
      });
      return;
    }

    recordBattleMutation.mutate(data);
  };

  const needsSecondPlayer = selectedFormat !== "1v1";

  return (
    <section id="battles" className="gaming-card rounded-xl p-6">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl font-bold text-gray-100 flex items-center space-x-2">
          <PlusCircle className="text-[var(--minecraft-green)]" />
          <span>Record Battle Result</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {players.length < 2 ? (
          <div className="text-center py-12">
            <PlusCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">Need More Players</h3>
            <p className="text-gray-500">Add at least 2 players to start recording battles!</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="battleType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300 font-semibold">Battle Format</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedFormat(value);
                        }}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1v1">1v1 Battle</SelectItem>
                          <SelectItem value="2v2">2v2 Team Battle</SelectItem>
                          <SelectItem value="2v1">2v1 Battle</SelectItem>
                          <SelectItem value="3v3">3v3 Team Battle</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <h4 className="text-gray-300 font-semibold">Team A</h4>
                    <FormField
                      control={form.control}
                      name="teamAPlayer1"
                      render={({ field }) => (
                        <FormItem>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                                <SelectValue placeholder="Select Player 1" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {players.map((player) => (
                                <SelectItem key={player.id} value={player.id.toString()}>
                                  {player.name} ({player.elo})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    {needsSecondPlayer && (
                      <FormField
                        control={form.control}
                        name="teamAPlayer2"
                        render={({ field }) => (
                          <FormItem>
                            <Select value={field.value || ""} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                                  <SelectValue placeholder="Select Player 2 (Optional)" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="">None</SelectItem>
                                {players.map((player) => (
                                  <SelectItem key={player.id} value={player.id.toString()}>
                                    {player.name} ({player.elo})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-gray-300 font-semibold">Team B</h4>
                    <FormField
                      control={form.control}
                      name="teamBPlayer1"
                      render={({ field }) => (
                        <FormItem>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                                <SelectValue placeholder="Select Player 1" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {players.map((player) => (
                                <SelectItem key={player.id} value={player.id.toString()}>
                                  {player.name} ({player.elo})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    {needsSecondPlayer && (
                      <FormField
                        control={form.control}
                        name="teamBPlayer2"
                        render={({ field }) => (
                          <FormItem>
                            <Select value={field.value || ""} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                                  <SelectValue placeholder="Select Player 2 (Optional)" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="">None</SelectItem>
                                {players.map((player) => (
                                  <SelectItem key={player.id} value={player.id.toString()}>
                                    {player.name} ({player.elo})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="winningTeam"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300 font-semibold">Winning Team</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="A">Team A</SelectItem>
                          <SelectItem value="B">Team B</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300 font-semibold">Battle Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Add details about the battle..."
                          className="bg-gray-700 border-gray-600 text-gray-100 h-24 resize-none"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={recordBattleMutation.isPending}
                  className="w-full gradient-minecraft text-white py-3 font-semibold flex items-center justify-center space-x-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{recordBattleMutation.isPending ? "Recording..." : "Record Battle"}</span>
                </Button>
              </form>
            </Form>

            <div className="space-y-4">
              <Card className="bg-gray-700/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-gray-200 text-lg flex items-center space-x-2">
                    <Calculator className="text-[var(--accent-blue)]" />
                    <span>Battle Preview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Team A Combined Elo:</span>
                      <span className="font-mono text-[var(--minecraft-green)]">{previewData.teamAElo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Team B Combined Elo:</span>
                      <span className="font-mono text-[var(--minecraft-green)]">{previewData.teamBElo}</span>
                    </div>
                    <div className="border-t border-gray-600 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Team A Win Chance:</span>
                        <span className="font-semibold text-yellow-400">{(previewData.teamAWinProb * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Estimated Elo Change:</span>
                        <span className="font-mono text-[var(--accent-blue)]">±{previewData.estimatedEloChange}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-700/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-gray-200 text-lg flex items-center space-x-2">
                    <Info className="text-yellow-500" />
                    <span>How It Works</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li className="flex items-start space-x-2">
                      <span className="text-[var(--minecraft-green)] text-xs mt-1">•</span>
                      <span>Team Elo is calculated by adding individual player ratings</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-[var(--minecraft-green)] text-xs mt-1">•</span>
                      <span>Elo changes are divided equally among team members</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-[var(--minecraft-green)] text-xs mt-1">•</span>
                      <span>Larger upsets result in bigger rating changes</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </CardContent>
    </section>
  );
}
