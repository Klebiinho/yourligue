-- 1. Limpar a publicação existente (opcional, mas garante configuração limpa)
DROP PUBLICATION IF EXISTS supabase_realtime;

-- 2. Criar a publicação apenas para as tabelas necessárias
-- Isso economiza MUITA banda (Egress) porque o Supabase não vai monitorar tabelas inúteis
CREATE PUBLICATION supabase_realtime FOR TABLE 
    matches, 
    match_events, 
    teams, 
    players, 
    brackets, 
    user_team_interactions;

-- 3. Configurar Identidade de Réplica
-- Para o Realtime conseguir enviar os dados "antigos" (payload.old), 
-- a tabela precisa de uma identidade de réplica. O padrão é a Chave Primária.
-- Se você precisar deletar itens e o frontend saber QUAL item foi deletado:
ALTER TABLE matches REPLICA IDENTITY FULL;
ALTER TABLE match_events REPLICA IDENTITY FULL;
ALTER TABLE teams REPLICA IDENTITY FULL;
ALTER TABLE players REPLICA IDENTITY FULL;
ALTER TABLE brackets REPLICA IDENTITY FULL;
ALTER TABLE user_team_interactions REPLICA IDENTITY FULL;

-- 4. Nota sobre Segurança (RLS)
-- O Realtime do Supabase RESPEITA o RLS. 
-- Se o RLS estiver ativo e não houver política para o usuário, as mensagens Realtime NÃO chegarão.
-- Por isso, o arquivo fix_rls.sql que você tem aberto é OBRIGATÓRIO para o Realtime funcionar.
