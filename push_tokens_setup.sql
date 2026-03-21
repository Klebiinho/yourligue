-- Cria tabela para armazenar os tokens de push notification
create table if not exists public.push_tokens (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    token text unique not null,
    platform text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ativa RLS
alter table public.push_tokens enable row level security;

-- Permite que usuário leia e modifique (insira) apenas os próprios tokens
create policy "Usuários gerenciam seus próprios tokens de push"
    on public.push_tokens for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- Opcional: Trigger para notificar a Edge Function de alterações de status na Partida
-- Esse trigger permite a Edge Function mandar Push quando a Partida ficar LIVE
-- Mas note que você precisaria de uma Edge Function chamada "push-notifier" ou similar.
