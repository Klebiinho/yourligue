-- Adiciona colunas de localização na tabela de ligas
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS address TEXT;

-- Cria uma função para calcular distância e buscar ligas próximas
-- Esta função usa a fórmula de Haversine para precisão em KM
CREATE OR REPLACE FUNCTION get_nearby_leagues(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  dist_km DOUBLE PRECISION
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  logo TEXT,
  slug TEXT,
  user_id UUID,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  address TEXT,
  distancia_km DOUBLE PRECISION,
  follower_count JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.name,
    l.logo,
    l.slug,
    l.user_id,
    l.lat,
    l.lng,
    l.address,
    (
      6371 * acos(
        cos(radians(user_lat)) * cos(radians(l.lat)) * 
        cos(radians(l.lng) - radians(user_lng)) + 
        sin(radians(user_lat)) * sin(radians(l.lat))
      )
    ) AS distancia_km,
    COALESCE(
      (SELECT jsonb_build_array(jsonb_build_object('count', count(*)))
       FROM followed_leagues fl 
       WHERE fl.league_id = l.id),
      '[]'::jsonb
    ) as follower_count
  FROM leagues l
  WHERE 
    l.lat IS NOT NULL AND l.lng IS NOT NULL
    AND (
      6371 * acos(
        cos(radians(user_lat)) * cos(radians(l.lat)) * 
        cos(radians(l.lng) - radians(user_lng)) + 
        sin(radians(user_lat)) * sin(radians(l.lat))
      )
    ) <= dist_km
  ORDER BY distancia_km ASC;
END;
$$;
