-- ============================================================================
-- MIGRACIÓN: Corregir Políticas RLS para Requests
-- Fecha: 2025-10-21
-- Propósito: Corregir referencias de 'agente' a 'agent' en políticas RLS
-- ============================================================================

-- 1. ELIMINAR POLÍTICAS INCORRECTAS
-- ============================================================================

DROP POLICY IF EXISTS "agents_can_view_unassigned_requests" ON requests;
DROP POLICY IF EXISTS "agents_can_update_assigned_requests" ON requests;

-- 2. RECREAR POLÍTICAS CON VALORES CORRECTOS
-- ============================================================================

-- Policy: Agentes pueden ver solicitudes sin asignar
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
      AND users.rol IN ('agent', 'admin')
  )
);

-- Policy: Agentes pueden actualizar solicitudes asignadas
CREATE POLICY "agents_can_update_assigned_requests"
ON requests
FOR UPDATE
TO authenticated
USING (
  agente_id = auth.uid()
  OR (
    estatus = 'nuevo'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.rol IN ('agent', 'admin')
    )
  )
)
WITH CHECK (
  agente_id = auth.uid()
  OR (
    estatus IN ('nuevo', 'asignado')
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.rol IN ('agent', 'admin')
    )
  )
);

-- 3. COMENTARIOS
-- ============================================================================

COMMENT ON POLICY "agents_can_view_unassigned_requests" ON requests IS
'Permite a agentes y admins ver solicitudes nuevas sin asignar (CORREGIDO: agent en lugar de agente)';

COMMENT ON POLICY "agents_can_update_assigned_requests" ON requests IS
'Permite a agentes actualizar solicitudes asignadas y auto-asignarse (CORREGIDO: agent en lugar de agente)';

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Ver policies actualizadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'requests'
  AND policyname LIKE '%agent%'
ORDER BY policyname;

-- ============================================================================
-- FIN DE MIGRACIÓN
-- ============================================================================
