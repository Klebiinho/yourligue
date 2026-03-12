import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LeagueProvider, useLeague } from './context/LeagueContext';
import AuthPage from './pages/AuthPage';
import LeagueSelector from './pages/LeagueSelector';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Teams from './pages/Teams';
import TeamsDashboard from './pages/TeamsDashboard';
import Matches from './pages/Matches';
import Standings from './pages/Standings';
import Bracket from './pages/Bracket';
import Settings from './pages/Settings';
import MatchControl from './pages/MatchControl';

// ── Inner app, runs inside both providers ────────────────────
const AppRouter = () => {
  const { user, loading } = useAuth();
  const { leagues, loading: leagueLoading, league } = useLeague();

  // Show spinner while auth or leagues are loading
  if (loading || leagueLoading) return <LoadingScreen />;

  // Not logged in — show auth page
  if (!user) return <AuthPage />;

  // Logged in but no league yet
  if ((leagues.length === 0 || !league) && window.location.pathname !== '/leagues') {
    return (
      <Routes>
        <Route path="*" element={<LeagueSelector />} />
      </Routes>
    );
  }

  // Full app with sidebar
  return (
    <div className="min-h-screen bg-bg-dark text-white font-inter">
      <Sidebar />
      <main className="md:pl-64 min-h-screen p-4 md:p-10 pb-[90px] md:pb-10 overflow-x-hidden">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/teams-dashboard" element={<TeamsDashboard />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/standings" element={<Standings />} />
          <Route path="/bracket" element={<Bracket />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/match/:matchId" element={<MatchControl />} />
          <Route path="/leagues" element={<LeagueSelector />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const LoadingScreen = () => (
  <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center gap-6">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
    </div>
    <div className="flex flex-col items-center">
      <p className="text-white font-outfit font-black text-xl uppercase tracking-[0.2em] animate-pulse">Carregando</p>
      <div className="flex gap-1 mt-2">
        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
      </div>
    </div>
  </div>
);

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <LeagueProvider>
        <AppRouter />
      </LeagueProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
