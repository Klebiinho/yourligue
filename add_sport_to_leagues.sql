-- Migration: Adicionar suporte a Basquetebol
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS sport_type TEXT DEFAULT 'soccer' CHECK (sport_type IN ('soccer', 'basketball'));
