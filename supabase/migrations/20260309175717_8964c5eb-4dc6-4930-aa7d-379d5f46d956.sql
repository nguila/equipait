
CREATE TABLE public.task_dependencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  predecessor_id uuid NOT NULL REFERENCES public.project_tasks(id) ON DELETE CASCADE,
  successor_id uuid NOT NULL REFERENCES public.project_tasks(id) ON DELETE CASCADE,
  dependency_type text NOT NULL DEFAULT 'finish_to_start',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (predecessor_id, successor_id),
  CHECK (predecessor_id != successor_id)
);

ALTER TABLE public.task_dependencies ENABLE ROW LEVEL SECURITY;

-- View: anyone who can see the project tasks can see dependencies
CREATE POLICY "Authenticated can view task_dependencies"
ON public.task_dependencies FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.project_tasks pt
    JOIN public.projects p ON p.id = pt.project_id
    WHERE pt.id = task_dependencies.predecessor_id
    AND (p.created_by = auth.uid() OR p.responsible_id = auth.uid() OR p.technician_id = auth.uid() OR public.is_admin() OR public.is_manager())
  )
);

-- Insert: authenticated users who can edit tasks
CREATE POLICY "Auth can create task_dependencies"
ON public.task_dependencies FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.project_tasks pt
    WHERE pt.id = task_dependencies.successor_id
    AND (pt.created_by = auth.uid() OR pt.assignee_id = auth.uid() OR public.is_admin() OR public.is_manager())
  )
);

-- Delete
CREATE POLICY "Auth can delete task_dependencies"
ON public.task_dependencies FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.project_tasks pt
    WHERE pt.id = task_dependencies.successor_id
    AND (pt.created_by = auth.uid() OR pt.assignee_id = auth.uid() OR public.is_admin() OR public.is_manager())
  )
);
