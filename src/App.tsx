import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LeagueProvider, useLeague } from './context/LeagueContext';
import AuthPage from './pages/AuthPage.tsx';
import LeagueSelector from './pages/LeagueSelector.tsx';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard.tsx';
import Teams from './pages/Teams.tsx';
import TeamsDashboard from './pages/TeamsDashboard.tsx';
import Matches from './pages/Matches.tsx';
import Standings from './pages/Standings.tsx';
import Bracket from './pages/Bracket.tsx';
import Settings from './pages/Settings.tsx';
import MatchControl from './pages/MatchControl.tsx';
import LiveMatches from './pages/LiveMatches.tsx';
import AuthModal from './components/AuthModal.tsx';
import NotificationTray from './components/NotificationTray.tsx';


const LoadingScreen = () => (
  <div className="fixed inset-0 bg-[#07070a] flex flex-col items-center justify-center gap-8 z-[999]">
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

const NotFoundScreen = ({ message, onRetry }: { message: string, onRetry?: () => void }) => (
  <div className="fixed inset-0 bg-[#07070a] flex flex-col items-center justify-center gap-8 z-[999] p-6 text-center">
    <div className="w-20 h-20 bg-danger/10 text-danger rounded-2xl flex items-center justify-center mb-4">
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
    </div>
    <h1 className="text-white font-outfit font-black text-2xl sm:text-4xl uppercase tracking-tighter">Ops! Liga não encontrada</h1>
    <p className="text-slate-400 max-w-md">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="bg-primary px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:brightness-110 transition-all">
        Tentar Novamente
      </button>
    )}
  </div>
);

const PublicLayout = () => (
  <div className="min-h-screen bg-[#07070a] text-white font-inter">
    <Sidebar />
    <main className="md:pl-64 min-h-screen">
      <div className="p-4 md:p-8 lg:p-10 pb-24 md:pb-10 max-w-[1600px] mx-auto w-full">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="matches" element={<Matches />} />
          <Route path="live" element={<LiveMatches />} />
          <Route path="standings" element={<Standings />} />
          <Route path="bracket" element={<Bracket />} />
          <Route path="match/:matchId" element={<MatchControl />} />

          <Route path="*" element={<Navigate to="." replace />} />
        </Routes>
      </div>
    </main>
  </div>
);

const AppRouter = () => {
  const { user, loading } = useAuth();
  const { leagues, loading: leagueLoading, league, loadPublicLeague } = useLeague();
  const { slug } = useParams<{ slug: string }>();
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchLeague = async () => {
      if (slug) {
        try {
          const success = await loadPublicLeague(slug);
          if (!success) setNotFound(true);
        } catch {
          setNotFound(true);
        }
      }
    };
    fetchLeague();
  }, [slug, loadPublicLeague]);

  useEffect(() => {
    if (!leagueLoading && slug && !league) {
      setNotFound(true);
    } else if (league) {
      setNotFound(false);
    }
  }, [leagueLoading, slug, league]);

  // Clean empty hash fragments (like /#)
  useEffect(() => {
    const cleanHash = () => {
      if (window.location.hash === '#' || window.location.hash === '') {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    };
    cleanHash();
    window.addEventListener('hashchange', cleanHash);
    return () => window.removeEventListener('hashchange', cleanHash);
  }, []);

  if (loading || (leagueLoading && !notFound)) return <LoadingScreen />;

  if (slug) {
    if (notFound) return <NotFoundScreen message="Não conseguimos localizar esta liga. Verifique se o link está correto." onRetry={() => window.location.reload()} />;
    if (!league) return <LoadingScreen />;
    return <PublicLayout />;
  }

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
      <main className="md:pl-64 min-h-screen">
        <div className="p-4 md:p-8 lg:p-10 pb-24 md:pb-10 max-w-[1600px] mx-auto w-full">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/teams-dashboard" element={<TeamsDashboard />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/standings" element={<Standings />} />
            <Route path="/bracket" element={<Bracket />} />
            <Route path="/live" element={<LiveMatches />} />
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

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <LeagueProvider>
        <Routes>
          <Route path="/view/:slug/*" element={<AppRouter />} />
          <Route path="/*" element={<AppRouter />} />
        </Routes>
        <AuthModal />
        <NotificationTray />
      </LeagueProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
