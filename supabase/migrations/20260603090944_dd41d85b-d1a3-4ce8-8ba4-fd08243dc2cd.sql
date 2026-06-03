
-- Drop overly-broad catch-all ALL policies that override scoped SELECT
DROP POLICY IF EXISTS "Require auth for documents" ON public.documents;
DROP POLICY IF EXISTS "Require auth for project_tasks" ON public.project_tasks;
DROP POLICY IF EXISTS "Require auth for projects" ON public.projects;
DROP POLICY IF EXISTS "Require auth for resources" ON public.resources;
DROP POLICY IF EXISTS "Require auth for services" ON public.services;
DROP POLICY IF EXISTS "Require auth for suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Require auth for tickets" ON public.tickets;
DROP POLICY IF EXISTS "Require auth for vehicles" ON public.vehicles;

-- Rescope privilege-table write policies from public to authenticated
DROP POLICY IF EXISTS "Only admins can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can update roles" ON public.user_roles;
CREATE POLICY "Only admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (public.is_admin());
CREATE POLICY "Only admins can insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Only admins can update roles" ON public.user_roles FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Only admins can delete permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Only admins can insert permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Only admins can update permissions" ON public.user_permissions;
CREATE POLICY "Only admins can delete permissions" ON public.user_permissions FOR DELETE TO authenticated USING (public.is_admin());
CREATE POLICY "Only admins can insert permissions" ON public.user_permissions FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Only admins can update permissions" ON public.user_permissions FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Rescope UPDATE policies still bound to public
DROP POLICY IF EXISTS "Creators and admins can update documents" ON public.documents;
CREATE POLICY "Creators and admins can update documents" ON public.documents FOR UPDATE TO authenticated USING ((created_by = auth.uid()) OR public.is_admin()) WITH CHECK ((created_by = auth.uid()) OR public.is_admin());

DROP POLICY IF EXISTS "Creators and admins can update projects" ON public.projects;
CREATE POLICY "Creators and admins can update projects" ON public.projects FOR UPDATE TO authenticated USING ((created_by = auth.uid()) OR public.is_admin()) WITH CHECK ((created_by = auth.uid()) OR public.is_admin());

DROP POLICY IF EXISTS "Creators and admins can update services" ON public.services;
CREATE POLICY "Creators and admins can update services" ON public.services FOR UPDATE TO authenticated USING ((created_by = auth.uid()) OR public.is_admin()) WITH CHECK ((created_by = auth.uid()) OR public.is_admin());

DROP POLICY IF EXISTS "Admins and managers can update tickets" ON public.tickets;
CREATE POLICY "Admins and managers can update tickets" ON public.tickets FOR UPDATE TO authenticated USING (public.is_admin() OR public.is_manager() OR (created_by = auth.uid()) OR (assigned_to = auth.uid())) WITH CHECK (public.is_admin() OR public.is_manager() OR (created_by = auth.uid()) OR (assigned_to = auth.uid()));
