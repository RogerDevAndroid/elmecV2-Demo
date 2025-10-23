-- Script para agregar columnas faltantes a la tabla messages
-- Fecha: 2025-10-23
-- Propósito: Habilitar funcionalidades completas de chat (reply, archivos, audio, edición)

-- ============================================
-- 1. Agregar columna reply_to (para responder mensajes)
-- ============================================
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS reply_to UUID REFERENCES messages(id) ON DELETE SET NULL;

COMMENT ON COLUMN messages.reply_to IS 'ID del mensaje al que se está respondiendo (reply)';

-- ============================================
-- 2. Agregar columnas para archivos adjuntos
-- ============================================
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS file_name TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS file_size INTEGER DEFAULT NULL;

COMMENT ON COLUMN messages.file_name IS 'Nombre original del archivo adjunto';
COMMENT ON COLUMN messages.file_size IS 'Tamaño del archivo en bytes';

-- ============================================
-- 3. Agregar columna para duración de audio
-- ============================================
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS audio_duration INTEGER DEFAULT NULL;

COMMENT ON COLUMN messages.audio_duration IS 'Duración del audio en segundos';

-- ============================================
-- 4. Agregar columna para rastrear ediciones
-- ============================================
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP DEFAULT NULL;

COMMENT ON COLUMN messages.edited_at IS 'Timestamp de la última edición del mensaje';

-- ============================================
-- 5. Agregar columna read_by (tracking de lectura)
-- ============================================
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS read_by JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN messages.read_by IS 'Objeto JSON con user_ids que leyeron el mensaje {userId: true}';

-- ============================================
-- 6. Crear índices para mejorar performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_messages_reply_to ON messages(reply_to);
CREATE INDEX IF NOT EXISTS idx_messages_edited_at ON messages(edited_at DESC) WHERE edited_at IS NOT NULL;

-- ============================================
-- 7. Agregar columnas a tabla users (para presencia y foto)
-- ============================================
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS foto TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP DEFAULT NULL;

COMMENT ON COLUMN users.foto IS 'URL de la foto de perfil del usuario';
COMMENT ON COLUMN users.is_online IS 'Indica si el usuario está actualmente en línea';
COMMENT ON COLUMN users.last_seen IS 'Última vez que el usuario estuvo activo';

-- Crear índice para búsquedas de usuarios online
CREATE INDEX IF NOT EXISTS idx_users_online ON users(is_online) WHERE is_online = true;

-- ============================================
-- 8. Verificar que las columnas se agregaron
-- ============================================
-- Verificar columnas de messages
SELECT
  'messages' as tabla,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'messages'
  AND column_name IN ('reply_to', 'file_name', 'file_size', 'audio_duration', 'edited_at', 'read_by')
UNION ALL
-- Verificar columnas de users
SELECT
  'users' as tabla,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name IN ('foto', 'is_online', 'last_seen')
ORDER BY tabla, column_name;
