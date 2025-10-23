-- Script para verificar que las columnas del chat se crearon correctamente
-- Ejecutar en Supabase SQL Editor

-- ============================================
-- 1. Verificar columnas de la tabla messages
-- ============================================
SELECT
  'messages' as tabla,
  column_name as columna,
  data_type as tipo,
  is_nullable as permite_null,
  column_default as valor_default
FROM information_schema.columns
WHERE table_name = 'messages'
  AND column_name IN ('reply_to', 'file_name', 'file_size', 'audio_duration', 'edited_at', 'read_by')
ORDER BY column_name;

-- ============================================
-- 2. Verificar columnas de la tabla users
-- ============================================
SELECT
  'users' as tabla,
  column_name as columna,
  data_type as tipo,
  is_nullable as permite_null,
  column_default as valor_default
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name IN ('foto', 'is_online', 'last_seen')
ORDER BY column_name;

-- ============================================
-- 3. Verificar índices creados
-- ============================================
SELECT
  indexname as nombre_indice,
  tablename as tabla,
  indexdef as definicion
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname IN ('idx_messages_reply_to', 'idx_messages_edited_at', 'idx_users_online')
ORDER BY indexname;

-- ============================================
-- 4. Resumen de verificación
-- ============================================
SELECT
  '✅ VERIFICACIÓN COMPLETA' as resultado,
  CASE
    WHEN (
      SELECT COUNT(*)
      FROM information_schema.columns
      WHERE table_name = 'messages'
        AND column_name IN ('reply_to', 'file_name', 'file_size', 'audio_duration', 'edited_at', 'read_by')
    ) = 6
    THEN '✅ 6/6 columnas en messages'
    ELSE '❌ Faltan columnas en messages'
  END as columnas_messages,
  CASE
    WHEN (
      SELECT COUNT(*)
      FROM information_schema.columns
      WHERE table_name = 'users'
        AND column_name IN ('foto', 'is_online', 'last_seen')
    ) = 3
    THEN '✅ 3/3 columnas en users'
    ELSE '❌ Faltan columnas en users'
  END as columnas_users,
  CASE
    WHEN (
      SELECT COUNT(*)
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND indexname IN ('idx_messages_reply_to', 'idx_messages_edited_at', 'idx_users_online')
    ) >= 2
    THEN '✅ Índices creados'
    ELSE '⚠️ Algunos índices pueden faltar'
  END as indices;
