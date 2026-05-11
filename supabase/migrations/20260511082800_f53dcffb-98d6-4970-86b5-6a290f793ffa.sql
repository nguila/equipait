
-- 1. Extra columns on supplier_invoices
ALTER TABLE public.supplier_invoices
  ADD COLUMN IF NOT EXISTS payment_method text,
  ADD COLUMN IF NOT EXISTS supplier_address text,
  ADD COLUMN IF NOT EXISTS supplier_email text,
  ADD COLUMN IF NOT EXISTS supplier_phone text;

-- 2. Extra columns on inventory_items
ALTER TABLE public.inventory_items
  ADD COLUMN IF NOT EXISTS brand text,
  ADD COLUMN IF NOT EXISTS model text,
  ADD COLUMN IF NOT EXISTS sku text,
  ADD COLUMN IF NOT EXISTS unit_price numeric,
  ADD COLUMN IF NOT EXISTS supplier_id uuid,
  ADD COLUMN IF NOT EXISTS invoice_id uuid,
  ADD COLUMN IF NOT EXISTS purchase_date date;

-- 3. supplier_invoice_items
CREATE TABLE IF NOT EXISTS public.supplier_invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.supplier_invoices(id) ON DELETE CASCADE,
  inventory_item_id uuid REFERENCES public.inventory_items(id) ON DELETE SET NULL,
  name text NOT NULL,
  brand text,
  model text,
  sku text,
  serial_number text,
  quantity numeric NOT NULL DEFAULT 1,
  unit_price numeric,
  vat_rate numeric,
  warranty_years numeric,
  warranty_start date,
  warranty_end date,
  notes text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sii_invoice ON public.supplier_invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_sii_inv_item ON public.supplier_invoice_items(inventory_item_id);

ALTER TABLE public.supplier_invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view invoice items"
  ON public.supplier_invoice_items FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can create invoice items"
  ON public.supplier_invoice_items FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Creators admins managers can update invoice items"
  ON public.supplier_invoice_items FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR is_admin() OR is_manager())
  WITH CHECK (created_by = auth.uid() OR is_admin() OR is_manager());

CREATE POLICY "Creators admins managers can delete invoice items"
  ON public.supplier_invoice_items FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR is_admin() OR is_manager());

CREATE TRIGGER update_sii_updated_at
  BEFORE UPDATE ON public.supplier_invoice_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. warranties
CREATE TABLE IF NOT EXISTS public.warranties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_id uuid REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL,
  invoice_id uuid REFERENCES public.supplier_invoices(id) ON DELETE SET NULL,
  invoice_item_id uuid REFERENCES public.supplier_invoice_items(id) ON DELETE SET NULL,
  serial_number text,
  start_date date,
  end_date date,
  years numeric,
  notes text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_warr_item ON public.warranties(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_warr_end ON public.warranties(end_date);
CREATE INDEX IF NOT EXISTS idx_warr_supplier ON public.warranties(supplier_id);

ALTER TABLE public.warranties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view warranties"
  ON public.warranties FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can create warranties"
  ON public.warranties FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Creators admins managers can update warranties"
  ON public.warranties FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR is_admin() OR is_manager())
  WITH CHECK (created_by = auth.uid() OR is_admin() OR is_manager());

CREATE POLICY "Creators admins managers can delete warranties"
  ON public.warranties FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR is_admin() OR is_manager());

CREATE TRIGGER update_warranties_updated_at
  BEFORE UPDATE ON public.warranties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Storage bucket for invoice files
INSERT INTO storage.buckets (id, name, public)
VALUES ('supplier-invoices', 'supplier-invoices', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated can read supplier invoice files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'supplier-invoices');

CREATE POLICY "Authenticated can upload supplier invoice files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'supplier-invoices' AND owner = auth.uid());

CREATE POLICY "Owners admins managers can update supplier invoice files"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'supplier-invoices' AND (owner = auth.uid() OR is_admin() OR is_manager()));

CREATE POLICY "Owners admins managers can delete supplier invoice files"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'supplier-invoices' AND (owner = auth.uid() OR is_admin() OR is_manager()));
