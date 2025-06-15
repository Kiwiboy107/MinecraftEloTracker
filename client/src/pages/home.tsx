import { useState } from "react";
import { Swords, Plus, UserPlus, Trash2, Users, BarChart3, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import RankingsSection from "@/components/rankings-section";
import BattleInputSection from "@/components/battle-input-section";
import StatisticsSection from "@/components/statistics-section";
import PlayerManagementSection from "@/components/player-management-section";
import BattleHistorySection from "@/components/battle-history-section";
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
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>by Kiwiboy107</span>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.486 22 2 17.514 2 12S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/>
                <path d="M12 5.5c-3.584 0-6.5 2.916-6.5 6.5s2.916 6.5 6.5 6.5 6.5-2.916 6.5-6.5-2.916-6.5-6.5-6.5zm0 11c-2.481 0-4.5-2.019-4.5-4.5s2.019-4.5 4.5-4.5 4.5 2.019 4.5 4.5-2.019 4.5-4.5 4.5z"/>
                <circle cx="12" cy="12" r="2"/>
              </svg>
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
                onClick={() => scrollToSection('battle-history')}
                className="text-gray-300 hover:text-[var(--minecraft-green)] transition-colors"
              >
                Battle History
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
        <BattleInputSection />
        <BattleHistorySection />
        <StatisticsSection />
        <PlayerManagementSection />
      </main>

      <ResetModal 
        open={showResetModal} 
        onOpenChange={setShowResetModal}
      />
    </div>
  );
}
