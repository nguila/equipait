
-- 1) profiles: restrict to authenticated role
DROP POLICY IF EXISTS "Users can view relevant profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Only admins can insert profiles" ON public.profiles;

CREATE POLICY "Users can view relevant profiles"
ON public.profiles FOR SELECT TO authenticated
USING ((user_id = auth.uid()) OR is_admin() OR is_manager());

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Only admins can insert profiles"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (is_admin());

-- 2) resources: restrict SELECT to admin/manager
DROP POLICY IF EXISTS "Authenticated can view resources" ON public.resources;
CREATE POLICY "Admins managers can view resources"
ON public.resources FOR SELECT TO authenticated
USING (is_admin() OR is_manager());

-- 3) suppliers: restrict SELECT to creator/admin/manager
DROP POLICY IF EXISTS "Authenticated can view suppliers" ON public.suppliers;
CREATE POLICY "Creators admins managers can view suppliers"
ON public.suppliers FOR SELECT TO authenticated
USING ((created_by = auth.uid()) OR is_admin() OR is_manager());

-- 4) supplier_invoices: restrict SELECT
DROP POLICY IF EXISTS "Authenticated can view supplier_invoices" ON public.supplier_invoices;
CREATE POLICY "Creators admins managers can view supplier_invoices"
ON public.supplier_invoices FOR SELECT TO authenticated
USING ((created_by = auth.uid()) OR is_admin() OR is_manager());

-- 5) supplier_invoice_items: restrict SELECT
DROP POLICY IF EXISTS "Authenticated can view invoice items" ON public.supplier_invoice_items;
CREATE POLICY "Creators admins managers can view invoice items"
ON public.supplier_invoice_items FOR SELECT TO authenticated
USING (
  (created_by = auth.uid())
  OR is_admin()
  OR is_manager()
  OR EXISTS (
    SELECT 1 FROM public.supplier_invoices si
    WHERE si.id = supplier_invoice_items.invoice_id
      AND si.created_by = auth.uid()
  )
);

-- 6) storage: attachments INSERT must be inside user's own folder
DROP POLICY IF EXISTS "Authenticated can upload attachments" ON storage.objects;
CREATE POLICY "Authenticated can upload attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 7) storage: attachments UPDATE policy (owner or admin)
DROP POLICY IF EXISTS "Owners admins can update attachments" ON storage.objects;
CREATE POLICY "Owners admins can update attachments"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'attachments'
  AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin())
)
WITH CHECK (
  bucket_id = 'attachments'
  AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin())
);

-- 8) storage: supplier-invoices SELECT scoped to owner/admin/manager
DROP POLICY IF EXISTS "Authenticated can read supplier invoice files" ON storage.objects;
CREATE POLICY "Owners admins managers can read supplier invoice files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'supplier-invoices'
  AND (owner = auth.uid() OR public.is_admin() OR public.is_manager())
);

-- 9) Revoke SECURITY DEFINER helper functions from anon (keep authenticated for RLS)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_manager() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_collaborator() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_my_department_id() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.can_access_attachment(text) FROM anon, PUBLIC;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_manager() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_collaborator() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_department_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_attachment(text) TO authenticated;
