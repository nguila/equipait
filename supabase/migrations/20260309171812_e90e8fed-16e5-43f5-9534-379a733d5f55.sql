
-- Warehouses table
CREATE TABLE public.warehouses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL,
  address text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view warehouses" ON public.warehouses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins managers can manage warehouses" ON public.warehouses FOR ALL TO authenticated USING (is_admin() OR is_manager()) WITH CHECK (is_admin() OR is_manager());

-- Inventory locations table
CREATE TABLE public.inventory_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.inventory_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view inventory_locations" ON public.inventory_locations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins managers can manage inventory_locations" ON public.inventory_locations FOR ALL TO authenticated USING (is_admin() OR is_manager()) WITH CHECK (is_admin() OR is_manager());
