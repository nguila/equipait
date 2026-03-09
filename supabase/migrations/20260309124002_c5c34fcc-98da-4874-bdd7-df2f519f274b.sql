
-- Create vehicles table
CREATE TABLE public.vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plate text NOT NULL,
  brand text NOT NULL,
  model text NOT NULL,
  type text NOT NULL DEFAULT 'ligeiro',
  year integer NOT NULL DEFAULT 2024,
  mileage integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'operacional',
  location text,
  department_id uuid REFERENCES public.departments(id),
  next_maintenance date,
  insurance_expiry date,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Require auth for vehicles" ON public.vehicles FOR ALL TO public USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can view vehicles" ON public.vehicles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can create vehicles" ON public.vehicles FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Admins managers can update vehicles" ON public.vehicles FOR UPDATE TO authenticated USING (is_admin() OR is_manager() OR created_by = auth.uid()) WITH CHECK (is_admin() OR is_manager() OR created_by = auth.uid());
CREATE POLICY "Admins can delete vehicles" ON public.vehicles FOR DELETE TO authenticated USING (is_admin());

-- Create resources table
CREATE TABLE public.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT '',
  department_id uuid REFERENCES public.departments(id),
  skills text[] DEFAULT '{}',
  weekly_capacity integer NOT NULL DEFAULT 40,
  current_allocation integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'ativo',
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Require auth for resources" ON public.resources FOR ALL TO public USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can view resources" ON public.resources FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins managers can create resources" ON public.resources FOR INSERT TO authenticated WITH CHECK (is_admin() OR is_manager());
CREATE POLICY "Admins managers can update resources" ON public.resources FOR UPDATE TO authenticated USING (is_admin() OR is_manager()) WITH CHECK (is_admin() OR is_manager());
CREATE POLICY "Admins can delete resources" ON public.resources FOR DELETE TO authenticated USING (is_admin());

-- Create project_tasks table
CREATE TABLE public.project_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  parent_task_id uuid REFERENCES public.project_tasks(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  assignee_id uuid,
  team_ids uuid[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'por_iniciar',
  start_date date,
  end_date date,
  hours_estimated numeric NOT NULL DEFAULT 0,
  hours_logged numeric NOT NULL DEFAULT 0,
  priority text NOT NULL DEFAULT 'media',
  is_milestone boolean NOT NULL DEFAULT false,
  milestone_label text,
  risk_level text DEFAULT 'none',
  delay_days integer DEFAULT 0,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Require auth for project_tasks" ON public.project_tasks FOR ALL TO public USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can view project_tasks" ON public.project_tasks FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_tasks.project_id AND (p.created_by = auth.uid() OR p.responsible_id = auth.uid() OR p.technician_id = auth.uid() OR is_admin() OR is_manager()))
);
CREATE POLICY "Auth can create project_tasks" ON public.project_tasks FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Auth can update project_tasks" ON public.project_tasks FOR UPDATE TO authenticated USING (
  created_by = auth.uid() OR assignee_id = auth.uid() OR is_admin() OR is_manager()
) WITH CHECK (
  created_by = auth.uid() OR assignee_id = auth.uid() OR is_admin() OR is_manager()
);
CREATE POLICY "Admins can delete project_tasks" ON public.project_tasks FOR DELETE TO authenticated USING (is_admin() OR is_manager());
