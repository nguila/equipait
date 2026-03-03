-- Fix: Add WITH CHECK to profiles UPDATE policy
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Fix: Add WITH CHECK to ticket_comments UPDATE policy
DROP POLICY IF EXISTS "Users can update own comments" ON ticket_comments;
CREATE POLICY "Users can update own comments"
  ON ticket_comments FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Fix: Add WITH CHECK to services UPDATE policy
DROP POLICY IF EXISTS "Creators and admins can update services" ON services;
CREATE POLICY "Creators and admins can update services"
  ON services FOR UPDATE
  USING ((created_by = auth.uid()) OR (responsible_id = auth.uid()) OR is_admin() OR is_manager())
  WITH CHECK ((created_by = auth.uid()) OR (responsible_id = auth.uid()) OR is_admin() OR is_manager());

-- Fix: Add WITH CHECK to projects UPDATE policy
DROP POLICY IF EXISTS "Creators and admins can update projects" ON projects;
CREATE POLICY "Creators and admins can update projects"
  ON projects FOR UPDATE
  USING ((created_by = auth.uid()) OR (responsible_id = auth.uid()) OR is_admin() OR is_manager())
  WITH CHECK ((created_by = auth.uid()) OR (responsible_id = auth.uid()) OR is_admin() OR is_manager());

-- Fix: Add WITH CHECK to tickets UPDATE policy
DROP POLICY IF EXISTS "Admins and managers can update tickets" ON tickets;
CREATE POLICY "Admins and managers can update tickets"
  ON tickets FOR UPDATE
  USING ((created_by = auth.uid()) OR (assigned_to = auth.uid()) OR is_admin() OR is_manager())
  WITH CHECK ((created_by = auth.uid()) OR (assigned_to = auth.uid()) OR is_admin() OR is_manager());

-- Fix: Add WITH CHECK to documents UPDATE policy
DROP POLICY IF EXISTS "Creators and admins can update documents" ON documents;
CREATE POLICY "Creators and admins can update documents"
  ON documents FOR UPDATE
  USING ((created_by = auth.uid()) OR is_admin())
  WITH CHECK ((created_by = auth.uid()) OR is_admin());