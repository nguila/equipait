
-- Create inventory_items table
CREATE TABLE public.inventory_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  serial_number TEXT,
  category TEXT NOT NULL DEFAULT '',
  location TEXT DEFAULT '',
  warehouse_id TEXT DEFAULT '',
  location_id TEXT DEFAULT '',
  department_id UUID REFERENCES public.departments(id),
  user_name TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'ativo',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Authenticated can view inventory items"
  ON public.inventory_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can create inventory items"
  ON public.inventory_items FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Creators admins managers can update inventory items"
  ON public.inventory_items FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid() OR is_admin() OR is_manager())
  WITH CHECK (created_by = auth.uid() OR is_admin() OR is_manager());

CREATE POLICY "Admins can delete inventory items"
  ON public.inventory_items FOR DELETE
  TO authenticated
  USING (is_admin() OR is_manager());

-- Auto-generate code sequence
CREATE SEQUENCE IF NOT EXISTS inventory_items_code_seq START WITH 1;
