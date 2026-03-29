import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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
import DynamicContent from './pages/DynamicContent';
import LeagueLocation from './pages/LeagueLocation';

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
    const location = useLocation();
    const navigate = useNavigate();
    const [notFound, setNotFound] = useState(false);

    // Extract potential slug from URL safely without relying on nested wildcard matches
    const pathParts = location.pathname.split('/').filter(Boolean);
    const firstSegment = pathParts[0] || '';

    const fixedGlobalPaths = [
        'leagues', 'auth', 'politica-de-privacidade', 'termos-de-uso', 'sitemap',
        'blog', 'servicos', 'glossario', 'categoria', 'autor', 'duvidas', 'duvidas-de-a-a-z', 'informacoes', 'busca',
        'sobre-nos', 'contato', 'inicio', 'politica-de-atualizacao-de-resultados',
        'direitos-de-transmissao-e-imagem', 'regulamento-geral-de-competicoes',
        'diretrizes-do-capitao-titular', 'player', 'match'
    ];

    const isFixedGlobal = fixedGlobalPaths.includes(firstSegment);
    const slug = (!isFixedGlobal && firstSegment) ? firstSegment : undefined;

    useEffect(() => {
        if (slug) {
            setNotFound(false);
            loadPublicLeague(slug).then((success: boolean) => {
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

    if (slug && !league && !leagueLoading) {
        return <LoadingScreen />;
    }

    const hasLeague = !!league || !!slug;

    // Only force login if not a public page AND not viewing a league AND not logged in
    if (!user && !hasLeague && !isFixedGlobal && location.pathname !== '/') {
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

                        {/* Content Pages (Global) */}
                        <Route path="/blog" element={<DynamicContent />} />
                        <Route path="/blog/:contentSlug" element={<DynamicContent />} />
                        
                        <Route path="/servicos" element={<DynamicContent />} />
                        <Route path="/servicos/:contentSlug" element={<DynamicContent />} />
                        
                        <Route path="/glossario" element={<DynamicContent />} />
                        <Route path="/glossario/:contentSlug" element={<DynamicContent />} />
                        
                        <Route path="/categoria" element={<DynamicContent />} />
                        <Route path="/categoria/:contentSlug" element={<DynamicContent />} />
                        
                        <Route path="/autor" element={<DynamicContent />} />
                        <Route path="/autor/:contentSlug" element={<DynamicContent />} />
                        
                        <Route path="/busca" element={<DynamicContent />} />
                        <Route path="/busca/:contentSlug" element={<DynamicContent />} />
                        
                        <Route path="/duvidas" element={<DynamicContent />} />
                        <Route path="/duvidas-de-a-a-z" element={<DynamicContent />} />
                        <Route path="/duvidas/:letter" element={<DynamicContent />} />
                        
                        <Route path="/sobre-nos" element={<DynamicContent />} />
                        <Route path="/contato" element={<DynamicContent />} />
                        <Route path="/informacoes" element={<DynamicContent />} />
                        <Route path="/inicio" element={<Navigate to="/" replace />} />
                        <Route path="/politica-de-atualizacao-de-resultados" element={<DynamicContent />} />
                        <Route path="/direitos-de-transmissao-e-imagem" element={<DynamicContent />} />
                        <Route path="/regulamento-geral-de-competicoes" element={<DynamicContent />} />
                        <Route path="/diretrizes-do-capitao-titular" element={<DynamicContent />} />
                        
                        <Route path="/match/:matchId/overlay" element={<MatchOverlay />} />
                        <Route path="/match/:matchId" element={<MatchControl />} />

                        {/* LEAGUE SPECIFIC ROUTES */}
                        <Route path="/:slug/sitemap" element={<Sitemap />} />
                        <Route path="/:slug/blog" element={<DynamicContent />} />
                        <Route path="/:slug/blog/:contentSlug" element={<DynamicContent />} />
                        
                        <Route path="/:slug/servicos" element={<DynamicContent />} />
                        <Route path="/:slug/servicos/:contentSlug" element={<DynamicContent />} />
                        
                        <Route path="/:slug/glossario" element={<DynamicContent />} />
                        <Route path="/:slug/glossario/:contentSlug" element={<DynamicContent />} />
                        
                        <Route path="/:slug/categoria" element={<DynamicContent />} />
                        <Route path="/:slug/categoria/:contentSlug" element={<DynamicContent />} />
                        
                        <Route path="/:slug/autor" element={<DynamicContent />} />
                        <Route path="/:slug/autor/:contentSlug" element={<DynamicContent />} />
                        
                        <Route path="/:slug/busca" element={<DynamicContent />} />
                        <Route path="/:slug/busca/:contentSlug" element={<DynamicContent />} />
                        
                        <Route path="/:slug/duvidas" element={<DynamicContent />} />
                        <Route path="/:slug/duvidas-de-a-a-z" element={<DynamicContent />} />
                        <Route path="/:slug/duvidas/:letter" element={<DynamicContent />} />
                        
                        <Route path="/:slug/sobre-nos" element={<DynamicContent />} />
                        <Route path="/:slug/contato" element={<DynamicContent />} />
                        <Route path="/:slug/informacoes" element={<DynamicContent />} />
                        <Route path="/:slug/inicio" element={<Navigate to="/" replace />} />
                        <Route path="/:slug/politica-de-atualizacao-de-resultados" element={<DynamicContent />} />
                        <Route path="/:slug/direitos-de-transmissao-e-imagem" element={<DynamicContent />} />
                        <Route path="/:slug/regulamento-geral-de-competicoes" element={<DynamicContent />} />
                        <Route path="/:slug/diretrizes-do-capitao-titular" element={<DynamicContent />} />

                        <Route path="/:slug/localizacao" element={<LeagueLocation />} />
                        <Route path="/:slug/match/:matchId/overlay" element={<MatchOverlay />} />

                        <Route path="/:slug" element={<Dashboard />} />
                        <Route path="/:slug/home" element={<Dashboard />} />
                        <Route path="/:slug/teams" element={<Teams />} />
                        <Route path="/:slug/teams/:teamId" element={<Teams />} />
                        <Route path="/:teamSlug/team" element={<Teams />} />
                        <Route path="/:slug/matches" element={<Matches />} />
                        <Route path="/:slug/matches/:matchId" element={<MatchControl />} />
                        <Route path="/:slug/match/:matchId" element={<MatchControl />} />
                        <Route path="/:slug/:matchSlug/match" element={<MatchControl />} />
                        <Route path="/:matchSlug/match" element={<MatchControl />} />
                        
                        <Route path="/:slug/player/:playerSlug" element={<PlayerDetail />} />
                        <Route path="/:slug/:playerSlug/player" element={<PlayerDetail />} />
                        <Route path="/:playerSlug/player" element={<PlayerDetail />} />
                        
                        <Route path="/:slug/team/:teamId" element={<Teams />} />
                        <Route path="/:slug/:teamSlug/team" element={<Teams />} />
                        <Route path="/:teamSlug/team" element={<Teams />} />
                        
                        <Route path="/:slug/standings" element={<Standings />} />
                        <Route path="/:slug/bracket" element={<Bracket />} />
                        <Route path="/:slug/live" element={<LiveMatches />} />
                        <Route path="/:slug/settings" element={<Settings />} />

                        <Route path="/" element={<LeagueSelector />} />
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
    return (
        <BrowserRouter>
            <AuthProvider>
                <LeagueProvider>
                    <Routes>
                        {/* We use a single root catch-all to ensure precise path checking in MainContent */}
                        <Route path="/*" element={<MainContent />} />
                    </Routes>
                </LeagueProvider>
            </AuthProvider>
        </BrowserRouter>
    );
};

export default App;
