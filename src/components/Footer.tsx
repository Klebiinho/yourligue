import { Link } from 'react-router-dom';
import { useLeague } from '../context/LeagueContext';

const Footer = () => {
    const { leagueBasePath } = useLeague();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-auto py-8 px-4 border-t border-white/5">
            <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-slate-500 text-xs font-bold uppercase tracking-widest">
                <div className="flex flex-col items-center md:items-start gap-2">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="YourLigue" className="w-5 h-5 opacity-40 grayscale" />
                        <span>© {currentYear} YourLigue</span>
                    </div>
                    <p className="text-[10px] text-slate-600 normal-case font-medium">A plataforma definitiva para gestão de ligas esportivas.</p>
                </div>

                <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
                    <Link 
                        to={`${leagueBasePath}/politica-de-privacidade`} 
                        className="hover:text-primary transition-colors"
                    >
                        Política de Privacidade
                    </Link>
                    <Link 
                        to={`${leagueBasePath}/termos-de-uso`} 
                        className="hover:text-primary transition-colors"
                    >
                        Termos de Uso
                    </Link>
                    <Link 
                        to={`${leagueBasePath}/sitemap`} 
                        className="hover:text-primary transition-colors"
                    >
                        Mapa do Site
                    </Link>
                </nav>
            </div>
        </footer>
    );
};

export default Footer;
