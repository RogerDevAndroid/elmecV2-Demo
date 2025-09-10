/*
  # Corregir recursión infinita en políticas RLS

  1. Eliminar todas las políticas problemáticas
  2. Crear función SECURITY DEFINER para obtener rol de usuario
  3. Implementar políticas simples sin recursión
  4. Asegurar acceso correcto a datos
*/

-- Eliminar todas las políticas existentes que causan recursión
DROP POLICY IF EXISTS "Allow authenticated users to read all user data" ON users;
DROP POLICY IF EXISTS "Enable insert for own profile" ON users;
DROP POLICY IF EXISTS "Enable read access for own profile" ON users;
DROP POLICY IF EXISTS "Enable update for own profile" ON users;
DROP POLICY IF EXISTS "Users can view own requests" ON requests;
DROP POLICY IF EXISTS "Agents can view assigned requests" ON requests;
DROP POLICY IF EXISTS "Admins can manage all requests" ON requests;
DROP POLICY IF EXISTS "Users can manage own requests" ON requests;
DROP POLICY IF EXISTS "Agents can manage assigned requests" ON requests;
DROP POLICY IF EXISTS "Users can access their chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Admins can manage all chats" ON chat_rooms;
DROP POLICY IF EXISTS "Users can access messages in their chats" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update own messages" ON messages;
DROP POLICY IF EXISTS "Admins can manage all messages" ON messages;
DROP POLICY IF EXISTS "Users can manage own notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can manage all notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;

-- Eliminar funciones problemáticas
DROP FUNCTION IF EXISTS is_admin_or_agent();
DROP FUNCTION IF EXISTS is_chat_participant(uuid, uuid);

-- Crear función SECURITY DEFINER para obtener rol de usuario sin recursión
CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  -- Usar auth.users en lugar de public.users para evitar recursión
  SELECT COALESCE(
    (raw_user_meta_data->>'rol')::text,
    'customer'
  ) INTO user_role
  FROM auth.users
  WHERE id = user_id;
  
  RETURN COALESCE(user_role, 'customer');
END;
$$;

-- Crear función para verificar si es admin o agente
CREATE OR REPLACE FUNCTION is_admin_or_agent_safe()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  user_role := get_user_role(auth.uid());
  RETURN user_role IN ('admin', 'agent');
END;
$$;

-- Crear función para verificar participación en chat
CREATE OR REPLACE FUNCTION is_chat_participant_safe(room_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_participant boolean := false;
BEGIN
  SELECT user_id = ANY(participants) INTO is_participant
  FROM chat_rooms
  WHERE id = room_id;
  
  RETURN COALESCE(is_participant, false);
END;
$$;

-- Otorgar permisos de ejecución
GRANT EXECUTE ON FUNCTION get_user_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin_or_agent_safe() TO authenticated;
GRANT EXECUTE ON FUNCTION is_chat_participant_safe(uuid, uuid) TO authenticated;

-- POLÍTICAS PARA USERS - Sin recursión
CREATE POLICY "users_select_own_profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "users_insert_own_profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own_profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Política adicional para que admins/agentes puedan ver otros usuarios
CREATE POLICY "users_select_for_admins_agents"
  ON users
  FOR SELECT
  TO authenticated
  USING (is_admin_or_agent_safe());

-- POLÍTICAS PARA REQUESTS
CREATE POLICY "requests_select_own"
  ON requests
  FOR SELECT
  TO authenticated
  USING (usuario_id = auth.uid());

CREATE POLICY "requests_select_assigned"
  ON requests
  FOR SELECT
  TO authenticated
  USING (agente_id = auth.uid());

CREATE POLICY "requests_select_admin_agent"
  ON requests
  FOR SELECT
  TO authenticated
  USING (is_admin_or_agent_safe());

CREATE POLICY "requests_insert_own"
  ON requests
  FOR INSERT
  TO authenticated
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "requests_update_own"
  ON requests
  FOR UPDATE
  TO authenticated
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "requests_update_assigned"
  ON requests
  FOR UPDATE
  TO authenticated
  USING (agente_id = auth.uid())
  WITH CHECK (agente_id = auth.uid());

CREATE POLICY "requests_update_admin_agent"
  ON requests
  FOR UPDATE
  TO authenticated
  USING (is_admin_or_agent_safe())
  WITH CHECK (is_admin_or_agent_safe());

-- POLÍTICAS PARA CHAT_ROOMS
CREATE POLICY "chat_rooms_select_participant"
  ON chat_rooms
  FOR SELECT
  TO authenticated
  USING (auth.uid() = ANY(participants));

CREATE POLICY "chat_rooms_select_admin_agent"
  ON chat_rooms
  FOR SELECT
  TO authenticated
  USING (is_admin_or_agent_safe());

CREATE POLICY "chat_rooms_insert_participant"
  ON chat_rooms
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = ANY(participants));

CREATE POLICY "chat_rooms_update_participant"
  ON chat_rooms
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = ANY(participants))
  WITH CHECK (auth.uid() = ANY(participants));

CREATE POLICY "chat_rooms_update_admin_agent"
  ON chat_rooms
  FOR UPDATE
  TO authenticated
  USING (is_admin_or_agent_safe())
  WITH CHECK (is_admin_or_agent_safe());

-- POLÍTICAS PARA MESSAGES
CREATE POLICY "messages_select_participant"
  ON messages
  FOR SELECT
  TO authenticated
  USING (is_chat_participant_safe(chat_room_id, auth.uid()));

CREATE POLICY "messages_select_admin_agent"
  ON messages
  FOR SELECT
  TO authenticated
  USING (is_admin_or_agent_safe());

CREATE POLICY "messages_insert_participant"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND 
    is_chat_participant_safe(chat_room_id, auth.uid())
  );

CREATE POLICY "messages_update_own"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "messages_update_admin_agent"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (is_admin_or_agent_safe())
  WITH CHECK (is_admin_or_agent_safe());

-- POLÍTICAS PARA NOTIFICATIONS
CREATE POLICY "notifications_select_own"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "notifications_select_admin_agent"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (is_admin_or_agent_safe());

CREATE POLICY "notifications_insert_system"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "notifications_update_own"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "notifications_update_admin_agent"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (is_admin_or_agent_safe())
  WITH CHECK (is_admin_or_agent_safe());

-- POLÍTICAS PARA CALCULATOR_SESSIONS
CREATE POLICY "calculator_sessions_select_own"
  ON calculator_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "calculator_sessions_select_admin_agent"
  ON calculator_sessions
  FOR SELECT
  TO authenticated
  USING (is_admin_or_agent_safe());

CREATE POLICY "calculator_sessions_insert_own"
  ON calculator_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "calculator_sessions_update_own"
  ON calculator_sessions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "calculator_sessions_update_admin_agent"
  ON calculator_sessions
  FOR UPDATE
  TO authenticated
  USING (is_admin_or_agent_safe())
  WITH CHECK (is_admin_or_agent_safe());

-- POLÍTICAS PARA CALCULATOR_TEMPLATES
CREATE POLICY "calculator_templates_select_public"
  ON calculator_templates
  FOR SELECT
  TO authenticated
  USING (is_public = true);

CREATE POLICY "calculator_templates_select_own"
  ON calculator_templates
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "calculator_templates_select_admin_agent"
  ON calculator_templates
  FOR SELECT
  TO authenticated
  USING (is_admin_or_agent_safe());

CREATE POLICY "calculator_templates_insert_own"
  ON calculator_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "calculator_templates_update_own"
  ON calculator_templates
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "calculator_templates_update_admin_agent"
  ON calculator_templates
  FOR UPDATE
  TO authenticated
  USING (is_admin_or_agent_safe())
  WITH CHECK (is_admin_or_agent_safe());

-- POLÍTICAS PARA ACTIVITY_LOGS
CREATE POLICY "activity_logs_select_own"
  ON activity_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "activity_logs_select_admin_agent"
  ON activity_logs
  FOR SELECT
  TO authenticated
  USING (is_admin_or_agent_safe());

CREATE POLICY "activity_logs_insert_system"
  ON activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- POLÍTICAS PARA USER_SESSIONS
CREATE POLICY "user_sessions_select_own"
  ON user_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "user_sessions_select_admin_agent"
  ON user_sessions
  FOR SELECT
  TO authenticated
  USING (is_admin_or_agent_safe());

CREATE POLICY "user_sessions_insert_own"
  ON user_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_sessions_update_own"
  ON user_sessions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- POLÍTICAS PARA PUSH_TOKENS
CREATE POLICY "push_tokens_select_own"
  ON push_tokens
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "push_tokens_insert_own"
  ON push_tokens
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "push_tokens_update_own"
  ON push_tokens
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "push_tokens_delete_own"
  ON push_tokens
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- POLÍTICAS PARA SYSTEM_METRICS (solo admins)
CREATE POLICY "system_metrics_select_admin_agent"
  ON system_metrics
  FOR SELECT
  TO authenticated
  USING (is_admin_or_agent_safe());

CREATE POLICY "system_metrics_insert_admin_agent"
  ON system_metrics
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_or_agent_safe());

CREATE POLICY "system_metrics_update_admin_agent"
  ON system_metrics
  FOR UPDATE
  TO authenticated
  USING (is_admin_or_agent_safe())
  WITH CHECK (is_admin_or_agent_safe());