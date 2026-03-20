const fs = require('fs');

const rawText = `Posts
Quem Pode Organizar um Campeonato no YourLeague? (20/03/2026)
Qual Profissional Faz a Gestão de Ligas de Futebol? (20/03/2026)
Como se Chama o Aplicativo para Gerenciar Campeonatos? (20/03/2026)
Quais São os Formatos de Competição Mais Lucrativos? (20/03/2026)
O que É Preciso para Transmitir Jogos ao Vivo no YouTube? (20/03/2026)
Como Posso Criar uma Liga Amadora Profissional? (20/03/2026)
A Importância de um Capitão Titular na Gestão do Seu Time (20/03/2026)
Súmula Digital: Como Acompanhar Gols e Cartões em Tempo Real (20/03/2026)
Qual a Diferença Entre Torneio Rápido e Campeonato de Pontos Corridos? (20/03/2026)
Por Que a Copa Nony 4 Está Revolucionando a Várzea (19/03/2026)
Overlays Profissionais: O Que Muda na Sua Live Esportiva? (19/03/2026)
Como Integrar a API do YouTube na Sua Transmissão de Futebol (19/03/2026)
Gestão de Atletas: Como Evitar Erros na Escalação e Punições (19/03/2026)
Por Que Campeonatos com Transmissão Atraem Mais Patrocinadores (19/03/2026)
Como Atrair Times Competitivos Para Seu Torneio (18/03/2026)
Tabela Atualizada em Tempo Real: O Novo Padrão de Organização (18/03/2026)
Como o Público Avalia Competições Bem Organizadas (18/03/2026)
Erros Comuns que Fazem Sua Liga Perder Credibilidade (e Como Evitá-los) (18/03/2026)
O Papel da Tecnologia no Avanço do Futebol Amador (18/03/2026)
Transmissão 100% Online: Como Escalar a Audiência do Seu Campeonato (17/03/2026)
A Primeira Impressão Visual da Live É Decisiva Para o Torcedor (17/03/2026)
A Conexão Entre a Experiência do Jogador e a Organização do Torneio (17/03/2026)
Como Saber se o Regulamento da Minha Liga Está Ultrapassado? (17/03/2026)
A Importância da Estrutura Estratégica na Gestão de Partidas (16/03/2026)
Como Medir o Engajamento da Sua Transmissão Esportiva no YouTube (16/03/2026)
Como Diferenciar o Seu Campeonato da Concorrência Local (16/03/2026)
Meu Torneio Só Recebe Times por Indicação: É um Sinal de Alerta? (16/03/2026)
Por que as Pessoas Preferem Jogar a Copa Nony em Vez de Outros Torneios? (16/03/2026)
O Que Causa Queda Repentina na Audiência da Sua Live (e Como Corrigir) (16/03/2026)

Páginas
Política de Atualização de Resultados (20/03/2026)
Direitos de Transmissão e Imagem (20/03/2026)
Mapa do Site (20/03/2026)
Regulamento Geral de Competições (20/03/2026)
Diretrizes do Capitão Titular (20/03/2026)
Termos de Uso (20/03/2026)
Política de Privacidade (20/03/2026)
Contato (20/03/2026)
Sobre Nós (20/03/2026)

Serviços
Gestão Completa de Campeonatos e Ligas (20/03/2026)
Transmissão ao Vivo e Integração com API do YouTube (20/03/2026)
Overlays e Identidade Visual para Lives (20/03/2026)
Súmula Digital em Tempo Real (Gols e Cartões) (20/03/2026)
Gestão Avançada de Atletas e Equipes (20/03/2026)
Painel Exclusivo do Capitão Titular (20/03/2026)
Acompanhamento de Tabelas e Chaveamentos (20/03/2026)

Dúvidas de A a Z
Dúvidas de A a Z (20/03/2026)
Blog (20/03/2026)
Início (20/03/2026)

Glossário
Atrasos de Atualização na Tabela Causam Frustração aos Torcedores (20/03/2026)
Ausência de um Capitão Titular Desorganiza o Time e a Liga (20/03/2026)
Baixa Qualidade no Overlay Deixa a Live Amadora (20/03/2026)
Como a Falta de Súmula Digital Gera Erros Graves de Escalação (20/03/2026)
Controle Manual de Cartões Prejudica o Regulamento do Campeonato (20/03/2026)
Desconexão na API do YouTube Derruba o Engajamento da Partida (19/03/2026)
Dificuldade em Atualizar Gols em Tempo Real Afasta Audiência (19/03/2026)
Erros no Cadastro de Atletas Causam Punições Injustas e WO (19/03/2026)
Falta de Clareza no Regulamento da Copa Nony 4 Gera Dúvidas (19/03/2026)
Gestão Amadora de Times Afasta Bons Jogadores da Sua Equipe (18/03/2026)
Ignorar a Identidade Visual da Transmissão Custa Patrocínios Reais (18/03/2026)
Imprecisão Nos Dados de Artilharia Desmotiva Competidores (18/03/2026)
Jogadores Irregulares em Campo: O Perigo da Falta de Controle Digital (18/03/2026)
Lentidão Para Informar Suspensos Prejudica o Próximo Jogo (17/03/2026)
Métricas da Transmissão Que a Organização Não Pode Ignorar (17/03/2026)
Nomes e Escudos Errados no Overlay Quebram o Profissionalismo (17/03/2026)
Overlays Pesados Travam a Live e Prejudicam a Experiência (17/03/2026)
Penalizações Aplicadas de Forma Incorreta por Erro de Papel (16/03/2026)
Quando o Time Esquece de Definir e Escalar o Capitão Titular (16/03/2026)
Resultados Demorados Matam o Clima de Competição (16/03/2026)
Súmula de Papel Rasurada: O Pesadelo de Qualquer Organização (16/03/2026)
Transmissões Sem Placar Ao Vivo Parecem Apenas Amistosos (16/03/2026)
Uso Incorreto de Software de Live Desconfigura a Partida (16/03/2026)
Visibilidade Ruim dos Gols na Live Espanta a Retenção no YouTube (16/03/2026)
WhatsApp Usado como Único Meio de Gestão de Tabela Gera Caos (16/03/2026)
Zerar os Erros de Arbitragem Exige Tecnologia na Beira do Campo (16/03/2026)

Categorias
Organização de Ligas
Súmula Eletrônica e Arbitragem
Transmissões e Overlays
Gestão de Equipes e Atletas
Integração e API de Vídeo
Futebol Amador e Copa Nony`;

function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
let currentSection = '';
const data = {
    Posts: [],
    Paginas: [],
    Servicos: [],
    Glossario: [],
    Categorias: []
};

for (let line of lines) {
    if (["Posts", "Páginas", "Serviços", "Glossário", "Categorias", "Dúvidas de A a Z"].includes(line)) {
        if (line === "Páginas") currentSection = "Paginas";
        else if (line === "Serviços") currentSection = "Servicos";
        else if (line === "Glossário") currentSection = "Glossario";
        else if (line === "Dúvidas de A a Z") currentSection = "Paginas";
        else currentSection = line;
        continue;
    }
    
    if (currentSection) {
        let title = line;
        let date = "2026-03-20";
        
        // Remove trailing date string (DD/MM/YYYY)
        const dateMatch = title.match(/\((\d{2})\/(\d{2})\/(\d{4})\)$/);
        if (dateMatch) {
            date = dateMatch[3] + "-" + dateMatch[2] + "-" + dateMatch[1];
            title = title.replace(/\s*\(\d{2}\/\d{2}\/\d{4}\)$/, '');
        }
        
        let prefix = '/';
        if (currentSection === 'Posts') prefix = '/blog/';
        if (currentSection === 'Servicos') prefix = '/servicos/';
        if (currentSection === 'Glossario') prefix = '/glossario/';
        if (currentSection === 'Categorias') prefix = '/categoria/';
        
        let originalTitle = title;
        if (currentSection === 'Paginas') {
             let rawTitle = title.toLowerCase();
             if (rawTitle === 'mapa do site') title = "sitemap";
             if (title === "Termos de Uso") title = "termos";
             if (title === "Política de Privacidade") title = "privacidade";
             if (title === "Sobre Nós") title = "sobre-nos";
        }
        
        if (['d-vidas-de-a-a-z', 'blog', 'in-cio'].includes(slugify(title))) {
            continue;
        }

        data[currentSection].push({ title: originalTitle, path: prefix + slugify(title), date: date });
    }
}

data.Paginas.push(
    { title: "Início", path: "/", date: "2026-03-20" },
    { title: "Blog", path: "/blog", date: "2026-03-20" },
    { title: "Dúvidas de A a Z", path: "/duvidas", date: "2026-03-20" },
    { title: "Informações", path: "/informacoes", date: "2026-03-20" }
);

const base_url = 'https://yourleague.com';

let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

function addXmlUrl(item) {
    xml += '  <url>\n';
    xml += '    <loc>' + base_url + item.path + '</loc>\n';
    xml += '    <lastmod>' + item.date + '</lastmod>\n';
    xml += '    <changefreq>' + (item.path === '/' ? 'daily' : 'weekly') + '</changefreq>\n';
    xml += '    <priority>' + (item.path === '/' ? '1.0' : '0.8') + '</priority>\n';
    xml += '  </url>\n';
}

data.Paginas.forEach(addXmlUrl);
data.Servicos.forEach(addXmlUrl);
data.Posts.forEach(addXmlUrl);
data.Glossario.forEach(addXmlUrl);
data.Categorias.forEach(addXmlUrl);

xml += '</urlset>';

fs.writeFileSync('c:/Users/Kleber/.gemini/antigravity/playground/warped-tyson/public/sitemap.xml', xml);
fs.writeFileSync('c:/Users/Kleber/.gemini/antigravity/playground/warped-tyson/src/sitemap_data.json', JSON.stringify(data, null, 2));
