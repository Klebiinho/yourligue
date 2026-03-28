import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LeagueProvider, useLeague } from './context/LeagueContext';
import { useEffect, useState } from 'react';

// Pages - Restored to synchronous imports for maximum stability
import AuthPage from './pages/AuthPage';
import LeagueSelector from './pages/LeagueSelector';
import Dashboard from './pages/Dashboard';
import Teams from './pages/Teams';
import Matches from './pages/Matches';
import Standings from './pages/Standings';
import Bracket from './pages/Bracket';
import Settings from './pages/Settings';
import MatchControl from './pages/MatchControl';
import LiveMatches from './pages/LiveMatches';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import MatchOverlay from './pages/MatchOverlay';
import Sitemap from './pages/Sitemap';
import PlayerDetail from './pages/PlayerDetail';

// Components
import Sidebar from './components/Sidebar';
import AuthModal from './components/AuthModal';
import NotificationTray from './components/NotificationTray';
import Footer from './components/Footer';

// ── Shared UI ──────────────────────────────────────────────────────────────────

const LoadingScreen = () => (
    <div className="fixed inset-0 bg-[#07070a] flex flex-col items-center justify-center gap-6 z-[999]">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-white font-outfit font-black text-xl uppercase tracking-widest animate-pulse">Carregando...</p>
    </div>
);

const NotFoundScreen = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
    <div className="fixed inset-0 bg-[#07070a] flex flex-col items-center justify-center p-6 text-center z-[999]">
        <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mb-6 border border-red-500/20">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        </div>
        <h1 className="text-white font-outfit font-black text-2xl uppercase mb-2">Página não encontrada</h1>
        <p className="text-slate-400 mb-8 max-w-sm">{message}</p>
        {onRetry && <button onClick={onRetry} className="bg-primary text-white px-8 py-3 rounded-xl font-bold uppercase text-xs">Tentar Novamente</button>}
    </div>
);

const MainContent = () => {
    const { user, loading: authLoading } = useAuth();
    const { league, loading: leagueLoading, loadPublicLeague } = useLeague();
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const fixedPaths = ['leagues', 'auth', 'politica-de-privacidade', 'termos-de-uso', 'sitemap'];
        if (slug && !fixedPaths.includes(slug)) {
            setNotFound(false);
            loadPublicLeague(slug).then(success => {
                if (!success) setNotFound(true);
            });
        }
    }, [slug, loadPublicLeague]);


    useEffect(() => {
        if (user && window.location.hash.includes('access_token=')) {
            window.history.replaceState(null, '', location.pathname + location.search);
        }
    }, [user, location]);

    if (authLoading || (leagueLoading && !!slug && !notFound && !league)) {
        return <LoadingScreen />;
    }

    if (slug && notFound) {
        return <NotFoundScreen message="Esta liga não existe ou o link está incorreto." onRetry={() => navigate('/', { replace: true })} />;
    }

    if (slug && !league) {
        return <LoadingScreen />;
    }

    const isPublicPage = ['/politica-de-privacidade', '/termos-de-uso', '/sitemap', '/auth', '/leagues'].includes(location.pathname);
    const hasLeague = !!league || !!slug;

    // Only force login if not a public page AND not viewing a league AND not logged in
    if (!user && !hasLeague && !isPublicPage) {
        return <AuthPage />;
    }

    if (user && !league && !leagueLoading && location.pathname === '/' && !slug) {
        return <LeagueSelector />;
    }

    const isOverlayPage = location.pathname.includes('/overlay');
    const isLeaguesPage = location.pathname === '/leagues' || location.pathname === '/';
    const showSidebar = !!league && !isLeaguesPage && !isOverlayPage;

    return (
        <div className="min-h-screen bg-[#07070a] text-white font-inter">
            {!isOverlayPage && <Sidebar />}
            <main className={isOverlayPage ? 'w-full min-h-screen' : `${showSidebar ? 'md:pl-64' : ''} min-h-screen`}>
                <div className={`${showSidebar ? 'p-4 md:p-8 lg:p-10' : 'p-4 md:p-8 lg:p-10'} pb-24 md:pb-10 max-w-[1600px] mx-auto w-full`}>
                    <Routes>
                        {/* Global/Fixed routes */}
                        <Route path="/politica-de-privacidade" element={<PrivacyPolicy />} />
                        <Route path="/termos-de-uso" element={<TermsOfService />} />
                        <Route path="/sitemap" element={<Sitemap />} />
                        <Route path="/auth" element={<AuthPage />} />
                        <Route path="/leagues" element={<LeagueSelector />} />
                        
                        {/* Overlay route (legacy or global) */}
                        <Route path="match/:matchId/overlay" element={<MatchOverlay />} />

                        {/* Shared routes using relative paths works for both / and /:slug */}
                        <Route index element={(slug) ? <Dashboard /> : <LeagueSelector />} />
                        <Route path="home" element={<Dashboard />} />
                        <Route path="teams" element={<Teams />} />
                        <Route path="teams/:teamId" element={<Teams />} />
                        <Route path=":teamSlug/team" element={<Teams />} />
                        <Route path="matches" element={<Matches />} />
                        <Route path="matches/:matchId" element={<MatchControl />} />
                        <Route path=":matchSlug/match" element={<MatchControl />} />
                        <Route path=":playerSlug/player" element={<PlayerDetail />} />
                        <Route path="standings" element={<Standings />} />
                        <Route path="bracket" element={<Bracket />} />
                        <Route path="live" element={<LiveMatches />} />
                        <Route path="match/:matchId" element={<MatchControl />} />
                        <Route path="settings" element={<Settings />} />

                        {/* Special case for //:slug/match/:matchId/overlay */}
                        <Route path="match/:matchId/overlay" element={<MatchOverlay />} />

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to={slug ? `/${slug}/home` : "/"} replace />} />
                    </Routes>
                </div>
                {!isOverlayPage && !isLeaguesPage && location.pathname !== '/' && <Footer />}
                <AuthModal />
                <NotificationTray />
            </main>
        </div>
    );
};

const App = () => {
    const hasConfig = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!hasConfig) {
        return (
            <div className="fixed inset-0 bg-[#07070a] flex flex-col items-center justify-center p-6 text-center z-[9999]">
                <h1 className="text-white font-outfit font-black text-3xl uppercase tracking-tighter mb-4">Configuração Necessária</h1>
                <p className="text-slate-400 max-w-md mb-8 leading-relaxed">Verifique as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.</p>
                <button onClick={() => window.location.reload()} className="bg-red-500 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest">Tentar Novamente</button>
            </div>
        );
    }

    return (
        <BrowserRouter>
            <AuthProvider>
                <LeagueProvider>
                    <Routes>
                        <Route path="/leagues" element={<MainContent />} />
                        <Route path="/auth" element={<MainContent />} />
                        <Route path="/politica-de-privacidade" element={<MainContent />} />
                        <Route path="/termos-de-uso" element={<MainContent />} />
                        <Route path="/sitemap" element={<MainContent />} />
                        <Route path="/:slug/*" element={<MainContent />} />
                        <Route path="/*" element={<MainContent />} />
                    </Routes>
                </LeagueProvider>
            </AuthProvider>
        </BrowserRouter>
    );
};

export default App;
