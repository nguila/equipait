
-- Add document_number with auto-increment to documents
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS document_number serial;

-- Create inventory_categories table for managing product categories
CREATE TABLE public.inventory_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.inventory_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view inventory categories"
  ON public.inventory_categories FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins and managers can manage inventory categories"
  ON public.inventory_categories FOR ALL TO authenticated
  USING (public.is_admin() OR public.is_manager())
  WITH CHECK (public.is_admin() OR public.is_manager());

-- Seed default categories
INSERT INTO public.inventory_categories (name) VALUES
  ('Equipamento Informático'),
  ('Software'),
  ('Infraestrutura'),
  ('Equipamento Industrial'),
  ('Audiovisual'),
  ('Material de Escritório'),
  ('Outro');
