-- Fix WARN: Explicit INSERT deny for profiles (only admins via ALL policy)
CREATE POLICY "Only admins can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (is_admin());

-- Fix WARN: Explicit INSERT/UPDATE/DELETE deny for user_roles (only admins)
CREATE POLICY "Only admins can insert roles"
  ON user_roles FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Only admins can update roles"
  ON user_roles FOR UPDATE
  USING (is_admin());

CREATE POLICY "Only admins can delete roles"
  ON user_roles FOR DELETE
  USING (is_admin());

-- Fix WARN: Explicit INSERT/UPDATE/DELETE deny for user_permissions (only admins)
CREATE POLICY "Only admins can insert permissions"
  ON user_permissions FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Only admins can update permissions"
  ON user_permissions FOR UPDATE
  USING (is_admin());

CREATE POLICY "Only admins can delete permissions"
  ON user_permissions FOR DELETE
  USING (is_admin());