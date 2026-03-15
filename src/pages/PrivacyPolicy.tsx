import { Shield, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
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
                        <Shield size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">Política de Privacidade</h1>
                        <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">YourLigue • Atualizado em 15/03/2026</p>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-10 text-slate-400 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <div className="w-1 h-6 bg-primary rounded-full"></div>
                            1. Introdução
                        </h2>
                        <p>
                            A YourLigue leva a sua privacidade a sério. Esta política descreve como coletamos, usamos e protegemos suas informações ao utilizar nossos serviços, especialmente a integração com o YouTube para transmissões ao vivo.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <div className="w-1 h-6 bg-primary rounded-full"></div>
                            2. Informações que Coletamos
                        </h2>
                        <p className="mb-4">
                            Quando você conecta sua conta do YouTube ao YourLigue, acessamos as seguintes informações através dos Serviços de API do Google:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 marker:text-primary">
                            <li><strong className="text-slate-200">Dados do Perfil:</strong> Nome e e-mail para identificar sua conta gestora.</li>
                            <li><strong className="text-slate-200">Acesso à Conta do YouTube:</strong> Solicitamos permissão específica para gerenciar suas transmissões ao vivo (criar eventos e gerenciar configurações de stream).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <div className="w-1 h-6 bg-primary rounded-full"></div>
                            3. Como Usamos Seus Dados
                        </h2>
                        <p className="mb-4">Usamos o acesso à API do YouTube exclusivamente para:</p>
                        <ul className="list-disc pl-6 space-y-2 marker:text-primary">
                            <li>Criar transmissões ao vivo automaticamente quando você inicia uma partida no nosso sistema.</li>
                            <li>Vincular o título da liga e os nomes dos times à sua transmissão.</li>
                            <li>Fornecer o link da live para os torcedores que acompanham o placar no YourLigue em tempo real.</li>
                        </ul>
                        <p className="mt-4 italic text-sm">
                            Importante: Não lemos seus vídeos privados, não postamos comentários e não acessamos dados que não sejam estritamente necessários para a funcionalidade de Live Stream.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <div className="w-1 h-6 bg-primary rounded-full"></div>
                            4. Compartilhamento de Dados
                        </h2>
                        <p>
                            Nós não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros. As informações coletadas são usadas exclusivamente dentro da plataforma YourLigue para a execução das funcionalidades iniciadas por você.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <div className="w-1 h-6 bg-primary rounded-full"></div>
                            5. Serviços de Terceiros e Google
                        </h2>
                        <p className="mb-4">
                            Ao utilizar o recurso de live stream do YourLigue, você também está sujeito aos Termos de Serviço do YouTube e à Política de Privacidade do Google:
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold text-sm">Termos de Serviço do YouTube</a>
                            <a href="http://www.google.com/policies/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold text-sm">Política de Privacidade do Google</a>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <div className="w-1 h-6 bg-primary rounded-full"></div>
                            6. Revogação de Acesso
                        </h2>
                        <p className="mb-4">
                            Você pode desconectar sua conta do YouTube a qualquer momento através das configurações de perfil no YourLigue. Além disso, você pode revogar o acesso do YourLigue através da página de segurança do Google:
                        </p>
                        <a 
                            href="https://security.google.com/settings/security/permissions" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-block bg-white/5 border border-white/10 px-6 py-3 rounded-xl text-white font-bold text-sm hover:bg-primary/10 hover:border-primary/30 transition-all"
                        >
                            Gerenciar Permissões do Google
                        </a>
                    </section>

                    <section className="pt-10 border-t border-white/10 text-center">
                        <p className="text-sm">
                            Se tiver dúvidas sobre nossa política de privacidade, entre em contato através do nosso suporte.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
