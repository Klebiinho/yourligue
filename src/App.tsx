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

const AppRouter = () => {
  const { user, loading } = useAuth();
  const { leagues, loading: leagueLoading, league } = useLeague();

  if (loading || leagueLoading) return <LoadingScreen />;
  if (!user) return <AuthPage />;

  if ((leagues.length === 0 || !league) && window.location.pathname !== '/leagues') {
    return (
      <Routes>
        <Route path="*" element={<LeagueSelector />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-[#07070a] text-white font-inter">
      <Sidebar />
      {/* Main: offset for desktop sidebar, bottom padding for mobile nav */}
      <main className="md:pl-64 min-h-screen">
        <div className="p-4 md:p-8 lg:p-10 pb-24 md:pb-10 max-w-[1600px] mx-auto w-full">
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
        </div>
      </main>
    </div>
  );
};

const LoadingScreen = () => (
  <div className="fixed inset-0 bg-[#07070a] flex flex-col items-center justify-center gap-8 z-[999]">
    {/* Ambient glow */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
    </div>
    <div className="relative z-10 flex flex-col items-center gap-6">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
        <div className="absolute inset-2 bg-primary/10 blur-xl rounded-full" />
      </div>
      <div className="flex flex-col items-center gap-3">
        <p className="text-white font-outfit font-black text-2xl uppercase tracking-[0.3em]">
          A carregar
        </p>
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
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
