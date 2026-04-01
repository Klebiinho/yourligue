-- 1. Atualizar tabela LEAGUES para o Modo Rachão
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leagues' AND column_name='is_pickup_mode') THEN
        ALTER TABLE leagues ADD COLUMN is_pickup_mode BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leagues' AND column_name='pickup_config') THEN
        ALTER TABLE leagues ADD COLUMN pickup_config JSONB DEFAULT '{
            "maxPoints": 21,
            "timeLimit": 10,
            "gameFormat": "3x3",
            "entryType": "auto",
            "rotationType": "winner_stays",
            "substitutionType": "free",
            "pointsValue": {"regular": 2, "longRange": 3}
        }'::jsonb;
    END IF;
END $$;

-- 2. Atualizar tabela PLAYERS para gerenciar a fila e status do Rachão
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='players' AND column_name='pickup_status') THEN
        ALTER TABLE players ADD COLUMN pickup_status TEXT DEFAULT 'available';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='players' AND column_name='queue_position') THEN
        ALTER TABLE players ADD COLUMN queue_position INTEGER;
    END IF;
END $$;
