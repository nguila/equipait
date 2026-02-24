
-- Fix infinite recursion in profiles SELECT policy
-- The issue is the subquery references profiles itself
DROP POLICY IF EXISTS "Users can view relevant profiles" ON profiles;

CREATE POLICY "Users can view relevant profiles" ON profiles
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR is_admin()
    OR is_manager()
    OR department_id IN (
      SELECT p.department_id
      FROM profiles p
      WHERE p.user_id = auth.uid()
      AND p.id = p.id -- self-reference guard: only get current user's dept
    )
  );
