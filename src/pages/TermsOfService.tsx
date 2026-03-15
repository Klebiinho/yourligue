import { FileText, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#050505] text-slate-300 font-outfit py-12 px-6 sm:px-12 lg:px-24">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-primary hover:text-white transition-colors mb-8 group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest">Voltar</span>
                </button>

                <div className="flex items-center gap-4 mb-12">
                    <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">Termos de Serviço</h1>
                        <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">YourLigue • Atualizado em 15/03/2026</p>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-10 text-slate-400 leading-relaxed text-sm sm:text-base">
                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <div className="w-1 h-6 bg-primary rounded-full"></div>
                            1. Aceitação dos Termos
                        </h2>
                        <p>
                            Ao acessar e utilizar a plataforma YourLigue, você concorda em cumprir e estar vinculado a estes Termos de Serviço. Se você não concordar com qualquer parte destes termos, não deverá utilizar o aplicativo.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <div className="w-1 h-6 bg-primary rounded-full"></div>
                            2. Descrição do Serviço
                        </h2>
                        <p>
                            O YourLigue é uma plataforma de gestão de ligas esportivas que oferece ferramentas para organização de tabelas, times, estatísticas e integração com serviços de terceiros, como o YouTube Live, para transmissão de partidas.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <div className="w-1 h-6 bg-primary rounded-full"></div>
                            3. Integração com YouTube
                        </h2>
                        <p className="mb-4">
                            Nossa funcionalidade de transmissão ao vivo utiliza os Serviços de API do YouTube. Ao utilizar este recurso, os usuários concordam em estar vinculados aos:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 marker:text-primary">
                            <li><a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Termos de Serviço do YouTube</a></li>
                            <li><a href="http://www.google.com/policies/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Política de Privacidade do Google</a></li>
                        </ul>
                        <p className="mt-4">
                            O usuário é o único responsável pelo conteúdo transmitido e deve garantir que possui todos os direitos necessários para a transmissão, respeitando as diretrizes da comunidade do YouTube.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <div className="w-1 h-6 bg-primary rounded-full"></div>
                            4. Responsabilidades do Usuário
                        </h2>
                        <p>
                            O usuário é responsável por manter a confidencialidade de sua conta e senha. Qualquer atividade realizada sob sua conta será de sua total responsabilidade. É proibido o uso da plataforma para fins ilegais ou que violem os direitos de propriedade intelectual de terceiros.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <div className="w-1 h-6 bg-primary rounded-full"></div>
                            5. Limitação de Responsabilidade
                        </h2>
                        <p>
                            A YourLigue fornece o serviço "como está", sem garantias de que o serviço será ininterrupto ou livre de erros. Não nos responsabilizamos por falhas técnicas em serviços de terceiros (como YouTube ou Supabase) ou pela perda de dados decorrente do uso inadequado da plataforma.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <div className="w-1 h-6 bg-primary rounded-full"></div>
                            6. Alterações nos Termos
                        </h2>
                        <p>
                            Reservamo-nos o direito de modificar estes Termos de Serviço a qualquer momento. Alterações significativas serão notificadas aos usuários através da plataforma. O uso continuado do serviço após tais alterações constitui aceitação dos novos termos.
                        </p>
                    </section>

                    <section className="pt-10 border-t border-white/10 text-center">
                        <p className="text-xs sm:text-sm text-slate-500">
                            Estes termos são regidos pelas leis brasileiras. Fica eleito o foro da comarca do administrador para dirimir quaisquer controvérsias.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
