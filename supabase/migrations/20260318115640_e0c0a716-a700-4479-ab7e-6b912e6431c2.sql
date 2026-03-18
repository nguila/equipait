
-- Create suppliers table
CREATE TABLE public.suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  nif text,
  address text,
  category text NOT NULL DEFAULT 'geral',
  status text NOT NULL DEFAULT 'ativo',
  notes text,
  website text,
  contact_person text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Require auth for suppliers" ON public.suppliers
  FOR ALL TO public
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can view suppliers" ON public.suppliers
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated can create suppliers" ON public.suppliers
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Creators admins managers can update suppliers" ON public.suppliers
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR is_admin() OR is_manager())
  WITH CHECK (created_by = auth.uid() OR is_admin() OR is_manager());

CREATE POLICY "Admins can delete suppliers" ON public.suppliers
  FOR DELETE TO authenticated
  USING (is_admin() OR is_manager());

-- Updated_at trigger
CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON public.suppliers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
