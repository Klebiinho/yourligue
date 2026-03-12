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
  if (leagues.length === 0 || !league) {
    return (
      <Routes>
        <Route path="*" element={<LeagueSelector />} />
      </Routes>
    );
  }

  // Full app with sidebar
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
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
  <div style={{
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: '20px'
  }}>
    <div style={{
      width: '48px', height: '48px',
      border: '3px solid var(--glass-border)',
      borderTopColor: 'var(--primary)',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
    <p style={{ color: 'var(--text-muted)' }}>Carregando...</p>
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
