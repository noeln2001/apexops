import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, NavView } from './components/Sidebar';
import { LoginModal } from './components/LoginModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { fetchOverview } from './services/api';
import { OverviewData } from './types';

// Lazy-load view components for code-splitting and fast initial page load
const OverviewView = lazy(() => import('./views/OverviewView').then(m => ({ default: m.OverviewView })));
const ChampionshipTrackerView = lazy(() => import('./views/ChampionshipTrackerView').then(m => ({ default: m.ChampionshipTrackerView })));
const StandingsView = lazy(() => import('./views/StandingsView').then(m => ({ default: m.StandingsView })));
const WeekendCentreView = lazy(() => import('./views/WeekendCentreView').then(m => ({ default: m.WeekendCentreView })));
const DriversView = lazy(() => import('./views/DriversView').then(m => ({ default: m.DriversView })));
const ConstructorsView = lazy(() => import('./views/ConstructorsView').then(m => ({ default: m.ConstructorsView })));
const CircuitsView = lazy(() => import('./views/CircuitsView').then(m => ({ default: m.CircuitsView })));
const CalendarView = lazy(() => import('./views/CalendarView').then(m => ({ default: m.CalendarView })));
const TelemetryView = lazy(() => import('./views/TelemetryView').then(m => ({ default: m.TelemetryView })));
const StrategyView = lazy(() => import('./views/StrategyView').then(m => ({ default: m.StrategyView })));
const SimulatorView = lazy(() => import('./views/SimulatorView').then(m => ({ default: m.SimulatorView })));
const NewsView = lazy(() => import('./views/NewsView').then(m => ({ default: m.NewsView })));
const ObservabilityView = lazy(() => import('./views/ObservabilityView').then(m => ({ default: m.ObservabilityView })));
const TracksideDrillsView = lazy(() => import('./views/TracksideDrillsView').then(m => ({ default: m.TracksideDrillsView })));
const BackupsView = lazy(() => import('./views/BackupsView').then(m => ({ default: m.BackupsView })));
const ExportsView = lazy(() => import('./views/ExportsView').then(m => ({ default: m.ExportsView })));
const AboutView = lazy(() => import('./views/AboutView').then(m => ({ default: m.AboutView })));
const GalleryView = lazy(() => import('./views/GalleryView').then(m => ({ default: m.GalleryView })));

const VALID_VIEWS: readonly NavView[] = [
  'overview', 'championship', 'gallery', 'standings', 'weekend', 'drivers',
  'constructors', 'circuits', 'calendar', 'telemetry', 'strategy', 'simulator',
  'news', 'observability', 'drills', 'backups', 'explorer', 'about'
] as const;

function getViewFromLocation(): NavView {
  if (typeof window === 'undefined') return 'overview';
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase() as NavView;
  if (VALID_VIEWS.includes(hash)) {
    return hash;
  }
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const lastPart = (pathParts[pathParts.length - 1] || '').toLowerCase() as NavView;
  if (VALID_VIEWS.includes(lastPart)) {
    return lastPart;
  }
  return 'overview';
}

export function App() {
  const [currentView, setCurrentViewState] = useState<NavView>(getViewFromLocation);
  const [season, setSeason] = useState<number>(2026);
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  const setCurrentView = (v: NavView) => {
    setCurrentViewState(v);
    if (window.location.hash !== `#${v}`) {
      window.location.hash = v;
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const v = getViewFromLocation();
      setCurrentViewState(v);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const loadOverview = React.useCallback(() => {
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
  }, [season]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  return (
    <div className="min-h-screen bg-[#0b0d10] text-[#f0f3f8] flex flex-col font-sans antialiased selection:bg-[#e10600] selection:text-white">
      {/* Top Navbar */}
      <Navbar
        season={season}
        onSeasonChange={(s) => setSeason(s)}
        onRefresh={loadOverview}
        loading={loading}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
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
            <ErrorBoundary>
              <Suspense fallback={<LoadingSkeleton lines={8} />}>
                {currentView === 'overview' && (
                  <OverviewView
                    data={overviewData}
                    loading={loading}
                    onNavigate={(v) => setCurrentView(v)}
                  />
                )}
                {currentView === 'championship' && <ChampionshipTrackerView />}
                {currentView === 'gallery' && <GalleryView />}
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
              </Suspense>
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}
export default App;
