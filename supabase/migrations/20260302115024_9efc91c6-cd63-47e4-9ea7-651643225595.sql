-- Fix WARN 1: Restrict profiles visibility - collaborators can only see own profile
DROP POLICY IF EXISTS "Users can view relevant profiles" ON profiles;
CREATE POLICY "Users can view relevant profiles"
  ON profiles FOR SELECT
  USING (
    user_id = auth.uid()
    OR is_admin()
    OR is_manager()
  );

-- Fix WARN 2: Allow users to update/delete their own ticket comments
CREATE POLICY "Users can update own comments"
  ON ticket_comments FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own comments"
  ON ticket_comments FOR DELETE
  USING (user_id = auth.uid());