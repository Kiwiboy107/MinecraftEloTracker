import { useState } from "react";
import { Swords, Plus, UserPlus, Trash2, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import RankingsSection from "@/components/rankings-section";
import BattleInputSection from "@/components/battle-input-section";
import StatisticsSection from "@/components/statistics-section";
import PlayerManagementSection from "@/components/player-management-section";
import ResetModal from "@/components/reset-modal";

export default function Home() {
  const [showResetModal, setShowResetModal] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--dark-bg)] text-gray-50">
      {/* Header */}
      <header className="gaming-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Swords className="text-[var(--minecraft-green)] text-2xl" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--minecraft-green)] to-emerald-400 bg-clip-text text-transparent">
                Minecraft PvP Rankings
              </h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <button 
                onClick={() => scrollToSection('rankings')}
                className="text-gray-300 hover:text-[var(--minecraft-green)] transition-colors"
              >
                Rankings
              </button>
              <button 
                onClick={() => scrollToSection('battles')}
                className="text-gray-300 hover:text-[var(--minecraft-green)] transition-colors"
              >
                Battle Input
              </button>
              <button 
                onClick={() => scrollToSection('statistics')}
                className="text-gray-300 hover:text-[var(--minecraft-green)] transition-colors"
              >
                Statistics
              </button>
              <button 
                onClick={() => scrollToSection('players')}
                className="text-gray-300 hover:text-[var(--minecraft-green)] transition-colors"
              >
                Players
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Quick Actions */}
        <section className="gaming-card rounded-xl p-6">
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              onClick={() => scrollToSection('battles')}
              className="gradient-minecraft text-white px-6 py-3 font-semibold flex items-center space-x-2 transition-all transform hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Record Battle</span>
            </Button>
            <Button 
              onClick={() => scrollToSection('players')}
              className="bg-[var(--accent-blue)] hover:bg-blue-600 text-white px-6 py-3 font-semibold flex items-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Player</span>
            </Button>
            <Button 
              onClick={() => setShowResetModal(true)}
              variant="destructive"
              className="px-6 py-3 font-semibold flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Reset All Data</span>
            </Button>
          </div>
        </section>

        <RankingsSection />
        <StatisticsSection />
        <BattleInputSection />
        <PlayerManagementSection />
      </main>

      <ResetModal 
        open={showResetModal} 
        onOpenChange={setShowResetModal}
      />
    </div>
  );
}
