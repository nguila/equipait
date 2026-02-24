
-- Create a security definer function to get current user's department_id without hitting profiles RLS
CREATE OR REPLACE FUNCTION public.get_my_department_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT department_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1
$$;

-- Fix the profiles SELECT policy to use the function instead of subquery
DROP POLICY IF EXISTS "Users can view relevant profiles" ON profiles;

CREATE POLICY "Users can view relevant profiles" ON profiles
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR is_admin()
    OR is_manager()
    OR (department_id IS NOT NULL AND department_id = public.get_my_department_id())
  );
