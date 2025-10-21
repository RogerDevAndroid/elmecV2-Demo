-- ============================================================================
-- MIGRACIÓN: Implementar RLS Policies en Tabla Requests
-- Fecha: 2025-01-14
-- Propósito: Agregar Row Level Security a la tabla requests para prevenir
--            acceso no autorizado a solicitudes de otros usuarios
-- Prioridad: CRÍTICA - Vulnerabilidad de seguridad identificada
-- ============================================================================

-- 1. HABILITAR RLS EN LA TABLA REQUESTS
-- ============================================================================
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- 2. POLICY: LECTURA (SELECT)
-- ============================================================================

-- Policy 2.1: Usuarios pueden ver sus propias solicitudes (como creadores)
CREATE POLICY "users_can_view_own_requests"
ON requests
FOR SELECT
TO authenticated
USING (usuario_id = auth.uid());

-- Policy 2.2: Agentes pueden ver solicitudes asignadas a ellos
CREATE POLICY "agents_can_view_assigned_requests"
ON requests
FOR SELECT
TO authenticated
USING (agente_id = auth.uid());

-- Policy 2.3: Administradores pueden ver todas las solicitudes
CREATE POLICY "admins_can_view_all_requests"
ON requests
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
      AND users.rol = 'admin'
  )
);

-- Policy 2.4: Agentes pueden ver solicitudes sin asignar (estatus = 'nuevo')
CREATE POLICY "agents_can_view_unassigned_requests"
ON requests
FOR SELECT
TO authenticated
USING (
  estatus = 'nuevo'
  AND agente_id IS NULL
  AND EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
      AND users.rol IN ('agente', 'admin')
  )
);

-- 3. POLICY: INSERCIÓN (INSERT)
-- ============================================================================

-- Policy 3.1: Usuarios autenticados pueden crear solicitudes
CREATE POLICY "authenticated_users_can_create_requests"
ON requests
FOR INSERT
TO authenticated
WITH CHECK (
  -- El usuario_id debe ser el usuario autenticado
  usuario_id = auth.uid()
);

-- 4. POLICY: ACTUALIZACIÓN (UPDATE)
-- ============================================================================

-- Policy 4.1: Usuarios pueden actualizar sus propias solicitudes
-- (solo si no han sido asignadas aún)
CREATE POLICY "users_can_update_own_unassigned_requests"
ON requests
FOR UPDATE
TO authenticated
USING (
  usuario_id = auth.uid()
  AND (agente_id IS NULL OR estatus = 'nuevo')
)
WITH CHECK (
  usuario_id = auth.uid()
  AND (agente_id IS NULL OR estatus = 'nuevo')
);

-- Policy 4.2: Agentes pueden actualizar solicitudes asignadas a ellos
CREATE POLICY "agents_can_update_assigned_requests"
ON requests
FOR UPDATE
TO authenticated
USING (
  agente_id = auth.uid()
  OR (
    -- Agentes pueden asignarse solicitudes nuevas
    estatus = 'nuevo'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.rol IN ('agente', 'admin')
    )
  )
)
WITH CHECK (
  agente_id = auth.uid()
  OR (
    -- Permitir auto-asignación
    estatus IN ('nuevo', 'asignado')
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.rol IN ('agente', 'admin')
    )
  )
);

-- Policy 4.3: Administradores pueden actualizar cualquier solicitud
CREATE POLICY "admins_can_update_all_requests"
ON requests
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
      AND users.rol = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
      AND users.rol = 'admin'
  )
);

-- 5. POLICY: ELIMINACIÓN (DELETE)
-- ============================================================================

-- Policy 5.1: Solo administradores pueden eliminar solicitudes
CREATE POLICY "only_admins_can_delete_requests"
ON requests
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
      AND users.rol = 'admin'
  )
);

-- 6. CREAR ÍNDICES PARA OPTIMIZAR RENDIMIENTO DE RLS
-- ============================================================================

-- Índice para búsquedas por usuario_id (ya existe, verificar)
CREATE INDEX IF NOT EXISTS idx_requests_usuario_id
ON requests(usuario_id);

-- Índice para búsquedas por agente_id (ya existe, verificar)
CREATE INDEX IF NOT EXISTS idx_requests_agente_id
ON requests(agente_id);

-- Índice compuesto para solicitudes nuevas sin asignar
CREATE INDEX IF NOT EXISTS idx_requests_unassigned
ON requests(estatus, agente_id)
WHERE estatus = 'nuevo' AND agente_id IS NULL;

-- Índice para join con users (verificar rol)
CREATE INDEX IF NOT EXISTS idx_users_rol
ON users(rol);

-- 7. COMENTARIOS EN POLICIES PARA DOCUMENTACIÓN
-- ============================================================================

COMMENT ON POLICY "users_can_view_own_requests" ON requests IS
'Permite a los usuarios ver solicitudes que ellos crearon';

COMMENT ON POLICY "agents_can_view_assigned_requests" ON requests IS
'Permite a los agentes ver solicitudes asignadas específicamente a ellos';

COMMENT ON POLICY "admins_can_view_all_requests" ON requests IS
'Permite a los administradores ver todas las solicitudes sin restricción';

COMMENT ON POLICY "agents_can_view_unassigned_requests" ON requests IS
'Permite a agentes y admins ver solicitudes nuevas sin asignar para poder tomarlas';

COMMENT ON POLICY "authenticated_users_can_create_requests" ON requests IS
'Permite a cualquier usuario autenticado crear nuevas solicitudes';

COMMENT ON POLICY "users_can_update_own_unassigned_requests" ON requests IS
'Permite a usuarios editar sus propias solicitudes solo si no han sido asignadas';

COMMENT ON POLICY "agents_can_update_assigned_requests" ON requests IS
'Permite a agentes actualizar solicitudes asignadas a ellos y auto-asignarse solicitudes nuevas';

COMMENT ON POLICY "admins_can_update_all_requests" ON requests IS
'Permite a administradores actualizar cualquier solicitud';

COMMENT ON POLICY "only_admins_can_delete_requests" ON requests IS
'Solo los administradores pueden eliminar solicitudes (soft delete preferido)';

-- ============================================================================
-- TESTING DE POLICIES
-- ============================================================================

-- Para probar las policies después de aplicar la migración:
/*

-- Test 1: Usuario normal puede ver sus propias solicitudes
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "[user_id]"}';
SELECT * FROM requests WHERE usuario_id = '[user_id]';
-- Debe retornar solo las solicitudes del usuario

-- Test 2: Usuario normal NO puede ver solicitudes de otros
SELECT * FROM requests WHERE usuario_id != '[user_id]';
-- Debe retornar 0 filas (o error de policy)

-- Test 3: Agente puede ver solicitudes asignadas
SET LOCAL "request.jwt.claims" = '{"sub": "[agent_id]"}';
SELECT * FROM requests WHERE agente_id = '[agent_id]';
-- Debe retornar solicitudes del agente

-- Test 4: Admin puede ver todas
-- (Configurar con user_id de admin)
SELECT * FROM requests;
-- Debe retornar todas las solicitudes

-- Test 5: Agentes pueden ver solicitudes nuevas
SELECT * FROM requests WHERE estatus = 'nuevo' AND agente_id IS NULL;
-- Debe retornar solicitudes disponibles para tomar

-- Test 6: Usuario puede crear solicitud
INSERT INTO requests (titulo, mensaje, tipo, prioridad, usuario_id)
VALUES ('Test', 'Mensaje de prueba', 1, 'media', auth.uid());
-- Debe insertar exitosamente

-- Test 7: Usuario NO puede crear solicitud para otro usuario
INSERT INTO requests (titulo, mensaje, tipo, prioridad, usuario_id)
VALUES ('Test', 'Mensaje de prueba', 1, 'media', '[otro_user_id]');
-- Debe fallar con error de policy

*/

-- ============================================================================
-- ROLLBACK (En caso de necesitar revertir)
-- ============================================================================

-- Para revertir esta migración (ejecutar en orden inverso):
/*

DROP POLICY IF EXISTS "only_admins_can_delete_requests" ON requests;
DROP POLICY IF EXISTS "admins_can_update_all_requests" ON requests;
DROP POLICY IF EXISTS "agents_can_update_assigned_requests" ON requests;
DROP POLICY IF EXISTS "users_can_update_own_unassigned_requests" ON requests;
DROP POLICY IF EXISTS "authenticated_users_can_create_requests" ON requests;
DROP POLICY IF EXISTS "agents_can_view_unassigned_requests" ON requests;
DROP POLICY IF EXISTS "admins_can_view_all_requests" ON requests;
DROP POLICY IF EXISTS "agents_can_view_assigned_requests" ON requests;
DROP POLICY IF EXISTS "users_can_view_own_requests" ON requests;

ALTER TABLE requests DISABLE ROW LEVEL SECURITY;

DROP INDEX IF EXISTS idx_requests_unassigned;
DROP INDEX IF EXISTS idx_users_rol;

*/

-- ============================================================================
-- VERIFICACIÓN POST-MIGRACIÓN
-- ============================================================================

-- Verificar que RLS está habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'requests';
-- rowsecurity debe ser TRUE

-- Ver todas las policies creadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'requests'
ORDER BY policyname;

-- Debe mostrar las 9 policies creadas

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================

/*
1. TESTING OBLIGATORIO:
   Después de aplicar esta migración, DEBE ejecutarse testing completo
   para verificar que:
   - Usuarios solo ven sus solicitudes
   - Agentes ven sus asignadas + nuevas sin asignar
   - Admins ven todas
   - No hay data leaks

2. FRONTEND NO NECESITA CAMBIOS:
   Las queries en el frontend NO necesitan cambios. Supabase aplicará
   las policies automáticamente.

3. PERFORMANCE:
   Los índices creados optimizan el rendimiento de las policies.
   Monitorear queries lentas con:
   SELECT * FROM pg_stat_statements WHERE query LIKE '%requests%';

4. SOFT DELETE RECOMENDADO:
   En lugar de DELETE, considerar agregar campo 'deleted_at' para
   soft delete y preservar histórico.

5. AUDITORÍA:
   Considerar agregar trigger para log de cambios en tabla de auditoría.

*/

-- ============================================================================
-- FIN DE MIGRACIÓN
-- ============================================================================
