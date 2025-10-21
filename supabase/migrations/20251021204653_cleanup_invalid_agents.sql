-- Migración: Limpiar agentes inválidos y nombres con 'nulo'
-- Fecha: 2025-10-21
-- Descripción:
--   1. Elimina agentes inválidos: Ana García, Carlos Mendoza, Luis Ramírez
--   2. Limpia la palabra 'nulo' de los nombres de agentes

-- =============================================
-- PARTE 1: Eliminar agentes inválidos
-- =============================================

-- Primero, verificar si estos agentes tienen solicitudes asignadas
-- y reasignarlas a NULL para mantener la integridad referencial

-- Desasignar solicitudes de Ana García
UPDATE requests
SET agente_id = NULL
WHERE agente_id IN (
  SELECT id FROM users
  WHERE nombre ILIKE '%Ana%'
  AND apellido_paterno ILIKE '%García%'
  AND rol = 'agent'
);

-- Desasignar solicitudes de Carlos Mendoza
UPDATE requests
SET agente_id = NULL
WHERE agente_id IN (
  SELECT id FROM users
  WHERE nombre ILIKE '%Carlos%'
  AND apellido_paterno ILIKE '%Mendoza%'
  AND rol = 'agent'
);

-- Desasignar solicitudes de Luis Ramírez
UPDATE requests
SET agente_id = NULL
WHERE agente_id IN (
  SELECT id FROM users
  WHERE nombre ILIKE '%Luis%'
  AND apellido_paterno ILIKE '%Ramírez%'
  AND rol = 'agent'
);

-- Ahora eliminar o desactivar los agentes
-- Opción 1: Marcar como inactivos (recomendado para mantener historial)
UPDATE users
SET activo = false
WHERE (
  (nombre ILIKE '%Ana%' AND apellido_paterno ILIKE '%García%') OR
  (nombre ILIKE '%Carlos%' AND apellido_paterno ILIKE '%Mendoza%') OR
  (nombre ILIKE '%Luis%' AND apellido_paterno ILIKE '%Ramírez%')
) AND rol = 'agent';

-- Opción 2: Eliminar permanentemente (descomentar si se prefiere)
-- DELETE FROM users
-- WHERE (
--   (nombre ILIKE '%Ana%' AND apellido_paterno ILIKE '%García%') OR
--   (nombre ILIKE '%Carlos%' AND apellido_paterno ILIKE '%Mendoza%') OR
--   (nombre ILIKE '%Luis%' AND apellido_paterno ILIKE '%Ramírez%')
-- ) AND rol = 'agent';

-- =============================================
-- PARTE 2: Limpiar palabra 'nulo' de nombres
-- =============================================

-- Limpiar 'nulo' del nombre
UPDATE users
SET nombre = TRIM(REGEXP_REPLACE(nombre, 'nulo|Nulo|NULO|null|Null|NULL', '', 'gi'))
WHERE nombre ~* 'nulo|null';

-- Limpiar 'nulo' del apellido paterno
UPDATE users
SET apellido_paterno = TRIM(REGEXP_REPLACE(apellido_paterno, 'nulo|Nulo|NULO|null|Null|NULL', '', 'gi'))
WHERE apellido_paterno ~* 'nulo|null';

-- Limpiar 'nulo' del apellido materno
UPDATE users
SET apellido_materno = TRIM(REGEXP_REPLACE(apellido_materno, 'nulo|Nulo|NULO|null|Null|NULL', '', 'gi'))
WHERE apellido_materno ~* 'nulo|null';

-- Si los campos quedan vacíos después de limpiar, establecer NULL
UPDATE users
SET apellido_materno = NULL
WHERE apellido_materno = '' OR apellido_materno IS NULL OR TRIM(apellido_materno) = '';

-- =============================================
-- VERIFICACIÓN
-- =============================================

-- Verificar agentes desactivados
-- SELECT id, nombre, apellido_paterno, apellido_materno, correo_electronico, activo
-- FROM users
-- WHERE activo = false AND rol = 'agent';

-- Verificar que no queden nombres con 'nulo'
-- SELECT id, nombre, apellido_paterno, apellido_materno, correo_electronico
-- FROM users
-- WHERE nombre ~* 'nulo|null'
--    OR apellido_paterno ~* 'nulo|null'
--    OR apellido_materno ~* 'nulo|null';
