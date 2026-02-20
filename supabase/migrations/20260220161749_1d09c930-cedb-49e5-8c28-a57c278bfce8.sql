
-- 1. Fix ticket_comments: restrict to users who can access the parent ticket
DROP POLICY IF EXISTS "Users can view ticket comments" ON public.ticket_comments;

CREATE POLICY "Users can view comments on accessible tickets"
ON public.ticket_comments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tickets t
    WHERE t.id = ticket_comments.ticket_id
    AND (
      t.created_by = auth.uid()
      OR t.assigned_to = auth.uid()
      OR public.is_admin()
      OR public.is_manager()
    )
  )
);

-- 2. Fix attachments table: restrict to users who can access the parent entity
DROP POLICY IF EXISTS "Authenticated can view attachments" ON public.attachments;

CREATE POLICY "Users can view attachments on accessible entities"
ON public.attachments FOR SELECT
TO authenticated
USING (
  -- Ticket attachments: inherit ticket visibility
  (entity_type = 'ticket' AND EXISTS (
    SELECT 1 FROM public.tickets t
    WHERE t.id = attachments.entity_id
    AND (t.created_by = auth.uid() OR t.assigned_to = auth.uid() OR public.is_admin() OR public.is_manager())
  ))
  OR
  -- Document attachments: inherit document visibility (scoped below)
  (entity_type = 'document' AND EXISTS (
    SELECT 1 FROM public.documents d
    WHERE d.id = attachments.entity_id
    AND (d.created_by = auth.uid() OR public.is_admin() OR public.is_manager())
  ))
  OR
  -- Fallback: uploader can always see own attachments
  uploaded_by = auth.uid()
);

-- 3. Fix storage: restrict download to entity-based access
DROP POLICY IF EXISTS "Authenticated can view attachments" ON storage.objects;

CREATE OR REPLACE FUNCTION public.can_access_attachment(file_path text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  att_record RECORD;
BEGIN
  IF public.is_admin() THEN RETURN true; END IF;

  SELECT * INTO att_record
  FROM public.attachments
  WHERE attachments.file_path = can_access_attachment.file_path
  LIMIT 1;

  IF NOT FOUND THEN RETURN false; END IF;

  -- Uploader always has access
  IF att_record.uploaded_by = auth.uid() THEN RETURN true; END IF;

  IF att_record.entity_type = 'ticket' THEN
    RETURN EXISTS (
      SELECT 1 FROM public.tickets
      WHERE id = att_record.entity_id
      AND (created_by = auth.uid() OR assigned_to = auth.uid() OR public.is_manager())
    );
  ELSIF att_record.entity_type = 'document' THEN
    RETURN EXISTS (
      SELECT 1 FROM public.documents
      WHERE id = att_record.entity_id
      AND (created_by = auth.uid() OR public.is_manager())
    );
  END IF;

  RETURN false;
END;
$$;

CREATE POLICY "Users can view permitted attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'attachments'
  AND public.can_access_attachment(name)
);

-- 4. Fix profiles: restrict to own profile, same department, or admin/manager
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view relevant profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR public.is_admin()
  OR public.is_manager()
  OR department_id IN (
    SELECT p.department_id FROM public.profiles p WHERE p.user_id = auth.uid()
  )
);

-- 5. Fix documents: restrict to creator, same department, or admin/manager
DROP POLICY IF EXISTS "Authenticated can view documents" ON public.documents;

CREATE POLICY "Users can view relevant documents"
ON public.documents FOR SELECT
TO authenticated
USING (
  created_by = auth.uid()
  OR public.is_admin()
  OR public.is_manager()
  OR department_id IN (
    SELECT p.department_id FROM public.profiles p WHERE p.user_id = auth.uid()
  )
);

-- Add index for attachment lookups by file_path
CREATE INDEX IF NOT EXISTS idx_attachments_file_path ON public.attachments(file_path);
