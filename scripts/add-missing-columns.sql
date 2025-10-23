-- Script para agregar columnas faltantes a la tabla requests
-- Fecha: 2025-10-23
-- Propósito: Habilitar funcionalidades de archivos adjuntos y feedback

-- ============================================
-- 1. Agregar columna para archivos adjuntos
-- ============================================
ALTER TABLE requests
  ADD COLUMN IF NOT EXISTS archivos TEXT[] DEFAULT NULL;

COMMENT ON COLUMN requests.archivos IS 'Array de URLs públicas de archivos adjuntos desde Supabase Storage';

-- ============================================
-- 2. Agregar columnas para feedback del usuario
-- ============================================
ALTER TABLE requests
  ADD COLUMN IF NOT EXISTS feedback TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT NULL;

COMMENT ON COLUMN requests.feedback IS 'Comentarios del usuario sobre la resolución de la solicitud';
COMMENT ON COLUMN requests.rating IS 'Calificación de 1 a 5 estrellas sobre la resolución';

-- ============================================
-- 3. Agregar constraint para validar rating
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'check_rating_range'
  ) THEN
    ALTER TABLE requests
      ADD CONSTRAINT check_rating_range
      CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5));
  END IF;
END $$;

-- ============================================
-- 4. Crear índices para mejorar performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_requests_rating ON requests(rating);
CREATE INDEX IF NOT EXISTS idx_requests_usuario_id ON requests(usuario_id);
CREATE INDEX IF NOT EXISTS idx_requests_agente_id ON requests(agente_id);
CREATE INDEX IF NOT EXISTS idx_requests_estatus ON requests(estatus);
CREATE INDEX IF NOT EXISTS idx_requests_prioridad ON requests(prioridad);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at DESC);

-- ============================================
-- 5. Verificar que las columnas se agregaron
-- ============================================
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'requests'
  AND column_name IN ('archivos', 'feedback', 'rating')
ORDER BY column_name;
