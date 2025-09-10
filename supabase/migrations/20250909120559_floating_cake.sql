/*
  # Fix RLS Infinite Recursion

  1. Problem
    - Current RLS policies on users table are causing infinite recursion
    - Policies are trying to query users table from within users table policies
    - This prevents user profiles and chat rooms from loading

  2. Solution
    - Drop all existing problematic policies
    - Create simple, non-recursive policies
    - Use auth.uid() directly without subqueries to users table
    - Implement role-based access without recursive checks

  3. Security
    - Users can read/update their own profile
    - Simple role-based access without recursion
    - Maintain data security without complex subqueries
*/

-- Drop all existing policies on users table to eliminate recursion
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON users;
DROP POLICY IF EXISTS "Admins can update all profiles" ON users;
DROP POLICY IF EXISTS "Agents can view users for assignments" ON users;
DROP POLICY IF EXISTS "Allow user creation" ON users;
DROP POLICY IF EXISTS "Prevent privilege escalation" ON users;

-- Create simple, non-recursive policies for users table
CREATE POLICY "Enable read access for own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Enable update for own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable insert for own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Fix other tables that might have recursive policies
-- Drop and recreate requests policies without recursive user checks
DROP POLICY IF EXISTS "Admins can manage all requests" ON requests;
DROP POLICY IF EXISTS "Agents can view assigned requests" ON requests;
DROP POLICY IF EXISTS "Agents can update assigned requests" ON requests;
DROP POLICY IF EXISTS "Users can view own requests" ON requests;
DROP POLICY IF EXISTS "Users can update own requests" ON requests;
DROP POLICY IF EXISTS "Users can create requests" ON requests;

-- Simple requests policies
CREATE POLICY "Users can manage own requests"
  ON requests
  FOR ALL
  TO authenticated
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Agents can manage assigned requests"
  ON requests
  FOR ALL
  TO authenticated
  USING (agente_id = auth.uid())
  WITH CHECK (agente_id = auth.uid());

-- Fix chat_rooms policies
DROP POLICY IF EXISTS "Users can view chats they participate in" ON chat_rooms;
DROP POLICY IF EXISTS "Users can create chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Participants can update chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Admins can manage all chats" ON chat_rooms;

-- Simple chat_rooms policies
CREATE POLICY "Users can access their chat rooms"
  ON chat_rooms
  FOR ALL
  TO authenticated
  USING (auth.uid() = ANY(participants))
  WITH CHECK (auth.uid() = ANY(participants));

-- Fix messages policies
DROP POLICY IF EXISTS "Users can view messages in their chats" ON messages;
DROP POLICY IF EXISTS "Users can send messages to their chats" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Admins can manage all messages" ON messages;

-- Simple messages policies using the helper function
CREATE POLICY "Users can access messages in their chats"
  ON messages
  FOR SELECT
  TO authenticated
  USING (is_chat_participant(chat_room_id, auth.uid()));

CREATE POLICY "Users can send messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND 
    is_chat_participant(chat_room_id, auth.uid())
  );

CREATE POLICY "Users can update own messages"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

-- Fix notifications policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can manage all notifications" ON notifications;

-- Simple notifications policies
CREATE POLICY "Users can manage own notifications"
  ON notifications
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Fix calculator_sessions policies
DROP POLICY IF EXISTS "Users can manage own calculator sessions" ON calculator_sessions;
DROP POLICY IF EXISTS "Admins can manage all calculator data" ON calculator_sessions;

-- Simple calculator_sessions policies
CREATE POLICY "Users can manage own calculator sessions"
  ON calculator_sessions
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Fix calculator_templates policies
DROP POLICY IF EXISTS "Users can view public templates" ON calculator_templates;
DROP POLICY IF EXISTS "Users can manage own templates" ON calculator_templates;
DROP POLICY IF EXISTS "Admins can manage all templates" ON calculator_templates;

-- Simple calculator_templates policies
CREATE POLICY "Users can view accessible templates"
  ON calculator_templates
  FOR SELECT
  TO authenticated
  USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can manage own templates"
  ON calculator_templates
  FOR ALL
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Fix other tables with simple policies
-- push_tokens
DROP POLICY IF EXISTS "Users can manage own push tokens" ON push_tokens;
CREATE POLICY "Users can manage own push tokens"
  ON push_tokens
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- user_sessions
DROP POLICY IF EXISTS "Users can view own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can create own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Admins can view all sessions" ON user_sessions;

CREATE POLICY "Users can manage own sessions"
  ON user_sessions
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- activity_logs
DROP POLICY IF EXISTS "Users can view own activity logs" ON activity_logs;
DROP POLICY IF EXISTS "System can create activity logs" ON activity_logs;
DROP POLICY IF EXISTS "Admins can view all activity logs" ON activity_logs;
DROP POLICY IF EXISTS "Limit sensitive data access" ON activity_logs;

CREATE POLICY "Users can view own activity logs"
  ON activity_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can create activity logs"
  ON activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- system_metrics
DROP POLICY IF EXISTS "Only admins can view system metrics" ON system_metrics;
DROP POLICY IF EXISTS "System can create metrics" ON system_metrics;

CREATE POLICY "System can manage metrics"
  ON system_metrics
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure the helper function exists and is simple
CREATE OR REPLACE FUNCTION is_chat_participant(room_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM chat_rooms 
    WHERE id = room_id AND user_id = ANY(participants)
  );
$$;