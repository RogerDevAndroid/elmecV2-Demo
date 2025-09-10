/*
  # Fix RLS Infinite Recursion Error

  This migration fixes the "infinite recursion detected in policy for relation users" error
  by implementing the expert-recommended solution:

  1. Create a SECURITY DEFINER helper function to safely check user roles
  2. Simplify RLS policies on the users table
  3. Update other table policies to use the helper function
*/

-- 1. Create SECURITY DEFINER helper function to check user roles safely
CREATE OR REPLACE FUNCTION public.is_admin_or_agent()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
  DECLARE
    user_role text;
  BEGIN
    SELECT rol INTO user_role FROM public.users WHERE id = auth.uid();
    RETURN user_role IN ('admin', 'agent');
  END;
$$;

GRANT EXECUTE ON FUNCTION public.is_admin_or_agent() TO authenticated;

-- 2. Drop all existing problematic SELECT policies on the 'users' table
DROP POLICY IF EXISTS "Allow all authenticated users to read users" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Agents can view users for assignments" ON public.users;

-- 3. Create a new, simple SELECT policy for the 'users' table
CREATE POLICY "Allow authenticated users to read all user data"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (true);

-- 4. Update other problematic policies to use the helper function

-- Drop and recreate requests policies
DROP POLICY IF EXISTS "Agents can view assigned requests" ON public.requests;
DROP POLICY IF EXISTS "Admins can manage all requests" ON public.requests;

CREATE POLICY "Agents can view assigned requests"
  ON public.requests
  FOR SELECT
  TO authenticated
  USING (
    agente_id = auth.uid() OR
    usuario_id = auth.uid() OR
    public.is_admin_or_agent()
  );

CREATE POLICY "Admins can manage all requests"
  ON public.requests
  FOR ALL
  TO authenticated
  USING (public.is_admin_or_agent())
  WITH CHECK (public.is_admin_or_agent());

-- Drop and recreate chat_rooms policies
DROP POLICY IF EXISTS "Admins can manage all chats" ON public.chat_rooms;

CREATE POLICY "Admins can manage all chats"
  ON public.chat_rooms
  FOR ALL
  TO authenticated
  USING (public.is_admin_or_agent())
  WITH CHECK (public.is_admin_or_agent());

-- Drop and recreate messages policies
DROP POLICY IF EXISTS "Admins can manage all messages" ON public.messages;

CREATE POLICY "Admins can manage all messages"
  ON public.messages
  FOR ALL
  TO authenticated
  USING (public.is_admin_or_agent())
  WITH CHECK (public.is_admin_or_agent());

-- Drop and recreate notifications policies
DROP POLICY IF EXISTS "Admins can manage all notifications" ON public.notifications;

CREATE POLICY "Admins can manage all notifications"
  ON public.notifications
  FOR ALL
  TO authenticated
  USING (public.is_admin_or_agent())
  WITH CHECK (public.is_admin_or_agent());

-- Drop and recreate calculator_sessions policies
DROP POLICY IF EXISTS "Admins can manage all calculator data" ON public.calculator_sessions;

CREATE POLICY "Admins can manage all calculator data"
  ON public.calculator_sessions
  FOR ALL
  TO authenticated
  USING (public.is_admin_or_agent())
  WITH CHECK (public.is_admin_or_agent());

-- Drop and recreate calculator_templates policies
DROP POLICY IF EXISTS "Admins can manage all templates" ON public.calculator_templates;

CREATE POLICY "Admins can manage all templates"
  ON public.calculator_templates
  FOR ALL
  TO authenticated
  USING (public.is_admin_or_agent())
  WITH CHECK (public.is_admin_or_agent());

-- Drop and recreate user_sessions policies
DROP POLICY IF EXISTS "Admins can view all sessions" ON public.user_sessions;

CREATE POLICY "Admins can view all sessions"
  ON public.user_sessions
  FOR SELECT
  TO authenticated
  USING (public.is_admin_or_agent());

-- Drop and recreate activity_logs policies
DROP POLICY IF EXISTS "Admins can view all activity logs" ON public.activity_logs;

CREATE POLICY "Admins can view all activity logs"
  ON public.activity_logs
  FOR SELECT
  TO authenticated
  USING (public.is_admin_or_agent());