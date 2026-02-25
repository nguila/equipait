
-- Services table
CREATE TABLE public.services (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  type text NOT NULL DEFAULT 'manutencao',
  priority text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'open',
  start_date date,
  end_date date,
  responsible_id uuid,
  technician_id uuid,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Projects table
CREATE TABLE public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'planning',
  priority text NOT NULL DEFAULT 'medium',
  start_date date,
  end_date date,
  responsible_id uuid,
  technician_id uuid,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- RLS policies for services
CREATE POLICY "Users can view services" ON public.services FOR SELECT TO authenticated
  USING (created_by = auth.uid() OR responsible_id = auth.uid() OR technician_id = auth.uid() OR is_admin() OR is_manager());

CREATE POLICY "Authenticated can create services" ON public.services FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Creators and admins can update services" ON public.services FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR responsible_id = auth.uid() OR is_admin() OR is_manager());

CREATE POLICY "Admins can delete services" ON public.services FOR DELETE TO authenticated
  USING (is_admin());

-- RLS policies for projects
CREATE POLICY "Users can view projects" ON public.projects FOR SELECT TO authenticated
  USING (created_by = auth.uid() OR responsible_id = auth.uid() OR technician_id = auth.uid() OR is_admin() OR is_manager());

CREATE POLICY "Authenticated can create projects" ON public.projects FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Creators and admins can update projects" ON public.projects FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR responsible_id = auth.uid() OR is_admin() OR is_manager());

CREATE POLICY "Admins can delete projects" ON public.projects FOR DELETE TO authenticated
  USING (is_admin());

-- Updated_at triggers
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
