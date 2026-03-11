import fs from 'fs';
import path from 'path';

function replaceInFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    for (const [search, replace] of Object.entries(replacements)) {
        content = content.replace(new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replace);
    }
    fs.writeFileSync(filePath, content, 'utf8');
}

const dir = 'c:/Users/Kleber/.gemini/antigravity/playground/warped-tyson/src';

const sidebarReplacements = {
    'Visão Geral': 'Visão Geral', // already translated mostly via previous but let's be sure
    'Dashboard': 'Visão Geral',
    'Matches': 'Partidas',
    'Teams': 'Times',
    'Team Dashboard': 'Painel de Times',
    'Settings': 'Configurações'
};

const dashboardReplacements = {
    'Real-time statistics for your football championship.': 'Estatísticas em tempo real para o seu campeonato.',
    'Total Teams': 'Total de Times',
    'Registered Players': 'Jogadores Registrados',
    'Live Matches': 'Partidas ao Vivo',
    'Completed Matches': 'Partidas Concluídas',
    'Live & Upcoming Matches': 'Partidas ao Vivo e Próximas',
    'No matches scheduled yet.': 'Nenhuma partida agendada ainda.',
    'Team Standings': 'Classificação dos Times',
    'No teams registered.': 'Nenhum time registrado.',
    'pts': 'pts'
};

const matchesReplacements = {
    'Matches Management': 'Gerenciamento de Partidas',
    'New Match': 'Nova Partida',
    'Scheduled': 'Agendado',
    'Live': 'Ao Vivo',
    'Finished': 'Encerrado',
    'Select Home Team': 'Selecione o Mandante',
    'Select Away Team': 'Selecione o Visitante',
    'Home Team': 'Time Mandante',
    'Away Team': 'Time Visitante',
    'Create Match': 'Criar Partida',
    'vs': 'x',
    'No matches yet.': 'Nenhuma partida ainda.',
    'Start Match': 'Iniciar Partida',
    'Go to Control': 'Painel de Controle',
    'Final Score': 'Placar Final'
};

const matchControlReplacements = {
    'Live Match Control': 'Controle da Partida ao Vivo',
    'Match Details': 'Detalhes da Partida',
    'End Match': 'Encerrar Partida',
    'Start/Resume': 'Iniciar/Retomar',
    'Pause': 'Pausar',
    'YouTube Live Control': 'Controle do YouTube Live',
    'Sign in to Generate': 'Entrar para Gerar',
    'Creating Live...': 'Criando Live...',
    'Generate Instant Live': 'Gerar Live Instantânea',
    'Stream URL': 'URL do Stream',
    'Stream Key (OBS / Camera)': 'Chave do Stream (OBS / Câmera)',
    'Open Studio': 'Abrir Studio',
    'Generate a live broadcast for this match with one click.': 'Gere uma transmissão ao vivo para esta partida com um clique.',
    'Controls:': 'Controles:',
    'No players registered.': 'Nenhum jogador registrado.',
    'Match Timeline': 'Linha do Tempo da Partida',
    'No events yet.': 'Nenhum evento ainda.',
    'Goal': 'Gol',
    'Yellow Card': 'Cartão Amarelo',
    'Red Card': 'Cartão Vermelho',
    'Please configure your Google Client ID in Settings first.': 'Por favor, configure o Client ID do Google em Configurações primeiro.',
    'You must be signed in to YouTube to create a live.': 'Você deve estar logado no YouTube para criar uma live.'
};

const teamsDashboardReplacements = {
    'Team Management': 'Gestão de Times',
    'Select a team...': 'Selecione um time...',
    'Select Team': 'Selecionar Time',
    'Edit Team': 'Editar Time',
    'Team Name': 'Nome do Time',
    'Team Logo URL': 'URL do Escudo do Time', // optional if old
    'Team Logo (Image)': 'Escudo do Time',
    'Click to upload logo': 'Clique para alterar o escudo',
    'Update Team': 'Atualizar Time',
    'Delete Team': 'Excluir Time',
    'Are you sure you want to delete this team?': 'Tem certeza que deseja excluir este time?',
    'Team Statistics': 'Estatísticas do Time',
    'Matches': 'Partidas',
    'Wins': 'Vitórias',
    'Draws': 'Empates',
    'Losses': 'Derrotas',
    'Goals For': 'Gols Pró',
    'Goals Against': 'Gols Contra',
    'Player Roster': 'Elenco de Jogadores',
    'Add Player': 'Adicionar Jogador',
    'Player Name': 'Nome do Jogador',
    'Kit Number': 'Número da Camisa',
    'Position': 'Posição',
    'Goalkeeper': 'Goleiro',
    'Defender': 'Zagueiro',
    'Midfielder': 'Meio-campo',
    'Forward': 'Atacante',
    'Player Photo': 'Foto do Jogador'
};

const settingsReplacements = {
    'League Settings': 'Configurações da Liga',
    'League Name': 'Nome da Liga',
    'League Logo': 'Logo da Liga',
    'Max Amount of Teams': 'Quantidade Máxima de Times',
    'Save Settings': 'Salvar Configurações',
    'Saved!': 'Salvo!',
    'YouTube Channel Connection': 'Conexão com Youtube',
    'Connected': 'Conectado',
    'Connect your YouTube account to create and manage live broadcasts directly from the match panel.': 'Conecte sua conta do YouTube para criar lives diretamente do painel de partidas.',
    'First, configure your API credentials below.': 'Primeiro, configure suas credenciais de API abaixo.',
    'Go to Configuration': 'Ir para Configuração',
    'Sign in with Google': 'Entrar com Google',
    'Disconnect Account': 'Desconectar Conta',
    'Developer Configuration': 'Configuração de Desenvolvedor',
    'Google Oauth Client ID': 'ID do Cliente Google OAuth',
    'Required for the "Sign in with Google" button to work. Use your App\'s Client ID.': 'Necessário para o botão "Entrar com Google" funcionar.'
};

const teamsReplacements = {
    'Teams Management': 'Gerenciamento de Times',
    'Add New Team': 'Adicionar Novo Time',
    'Register Team': 'Registrar Time',
    'Team Logo': 'Escudo do Time',
    'Click here to upload': 'Clique para enviar',
    'Selected file:': 'Arquivo selecionado:'
};

replaceInFile(path.join(dir, 'components', 'Sidebar.tsx'), sidebarReplacements);
replaceInFile(path.join(dir, 'pages', 'Dashboard.tsx'), dashboardReplacements);
replaceInFile(path.join(dir, 'pages', 'Matches.tsx'), matchesReplacements);
replaceInFile(path.join(dir, 'pages', 'MatchControl.tsx'), matchControlReplacements);
replaceInFile(path.join(dir, 'pages', 'TeamsDashboard.tsx'), teamsDashboardReplacements);
replaceInFile(path.join(dir, 'pages', 'Settings.tsx'), settingsReplacements);
replaceInFile(path.join(dir, 'pages', 'Teams.tsx'), teamsReplacements);

console.log('Translations applied.');
