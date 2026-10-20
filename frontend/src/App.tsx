import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, NavView } from './components/Sidebar';
import { OverviewView } from './views/OverviewView';
import { ChampionshipTrackerView } from './views/ChampionshipTrackerView';
import { StandingsView } from './views/StandingsView';
import { WeekendCentreView } from './views/WeekendCentreView';
import { DriversView } from './views/DriversView';
import { ConstructorsView } from './views/ConstructorsView';
import { CircuitsView } from './views/CircuitsView';
import { CalendarView } from './views/CalendarView';
import { TelemetryView } from './views/TelemetryView';
import { StrategyView } from './views/StrategyView';
import { SimulatorView } from './views/SimulatorView';
import { NewsView } from './views/NewsView';
import { ObservabilityView } from './views/ObservabilityView';
import { TracksideDrillsView } from './views/TracksideDrillsView';
import { BackupsView } from './views/BackupsView';
import { ExportsView } from './views/ExportsView';
import { AboutView } from './views/AboutView';
import { fetchOverview } from './services/api';
import { OverviewData } from './types';

export function App() {
  const [currentView, setCurrentView] = useState<NavView>('overview');
  const [season, setSeason] = useState<number>(2026);
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadOverview = () => {
    setLoading(true);
    fetchOverview(season)
      .then((data) => {
        setOverviewData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load overview data:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadOverview();
  }, [season]);

  return (
    <div className="min-h-screen bg-[#0b0d10] text-[#f0f3f8] flex flex-col font-sans antialiased selection:bg-[#e10600] selection:text-white">
      {/* Top Navbar */}
      <Navbar
        season={season}
        onSeasonChange={(s) => setSeason(s)}
        onRefresh={loadOverview}
        loading={loading}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar
          currentView={currentView}
          onSelectView={(v) => setCurrentView(v)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#0b0d10]">
          <div className="max-w-7xl mx-auto">
            {currentView === 'overview' && (
              <OverviewView
                data={overviewData}
                loading={loading}
                onNavigate={(v) => setCurrentView(v)}
              />
            )}
            {currentView === 'championship' && <ChampionshipTrackerView />}
            {currentView === 'standings' && <StandingsView season={season} />}
            {currentView === 'weekend' && <WeekendCentreView season={season} />}
            {currentView === 'drivers' && <DriversView />}
            {currentView === 'constructors' && <ConstructorsView />}
            {currentView === 'circuits' && <CircuitsView />}
            {currentView === 'calendar' && <CalendarView season={season} />}
            {currentView === 'telemetry' && <TelemetryView season={season} />}
            {currentView === 'strategy' && <StrategyView />}
            {currentView === 'simulator' && <SimulatorView season={season} />}
            {currentView === 'news' && <NewsView />}
            {currentView === 'observability' && <ObservabilityView />}
            {currentView === 'drills' && <TracksideDrillsView />}
            {currentView === 'backups' && <BackupsView />}
            {currentView === 'explorer' && <ExportsView season={season} />}
            {currentView === 'about' && <AboutView />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
