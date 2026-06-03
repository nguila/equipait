
-- 1) Lock down trigger-only SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user_profile() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_role() FROM PUBLIC, anon, authenticated;

-- 2) Realtime channel-level authorization for tickets
-- Convention: client must subscribe to channel "tickets:<ticket_uuid>"
DROP POLICY IF EXISTS "Authenticated can read ticket channels" ON realtime.messages;

CREATE POLICY "Authenticated can read ticket channels"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.tickets t
    WHERE realtime.topic() = 'tickets:' || t.id::text
      AND (
        t.created_by = auth.uid()
        OR t.assigned_to = auth.uid()
        OR public.is_admin()
        OR public.is_manager()
      )
  )
);
