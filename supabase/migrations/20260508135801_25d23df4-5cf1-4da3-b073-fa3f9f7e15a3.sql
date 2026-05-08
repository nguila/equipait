
CREATE TABLE public.supplier_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  invoice_number text NOT NULL,
  atcud text,
  issue_date date,
  due_date date,
  payment_terms text,
  client_name text,
  client_nif text,
  net_total numeric(12,2),
  vat_total numeric(12,2),
  total_amount numeric(12,2),
  currency text DEFAULT 'EUR',
  description text,
  file_path text,
  notes text,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_supplier_invoices_supplier ON public.supplier_invoices(supplier_id);

ALTER TABLE public.supplier_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view supplier_invoices"
ON public.supplier_invoices FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can create supplier_invoices"
ON public.supplier_invoices FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Creators admins managers can update supplier_invoices"
ON public.supplier_invoices FOR UPDATE TO authenticated
USING (created_by = auth.uid() OR is_admin() OR is_manager())
WITH CHECK (created_by = auth.uid() OR is_admin() OR is_manager());

CREATE POLICY "Creators admins managers can delete supplier_invoices"
ON public.supplier_invoices FOR DELETE TO authenticated
USING (created_by = auth.uid() OR is_admin() OR is_manager());

CREATE TRIGGER update_supplier_invoices_updated_at
BEFORE UPDATE ON public.supplier_invoices
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
