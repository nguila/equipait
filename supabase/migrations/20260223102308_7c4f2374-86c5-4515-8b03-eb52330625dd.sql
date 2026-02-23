
-- Document types table
CREATE TABLE public.document_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.document_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view document types" ON public.document_types FOR SELECT USING (true);
CREATE POLICY "Admins can manage document types" ON public.document_types FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Insert default types
INSERT INTO public.document_types (name) VALUES ('Plano'), ('Relatório'), ('Procedimento'), ('Contrato'), ('Decisão'), ('Template'), ('Outro');

-- Knowledge areas table
CREATE TABLE public.knowledge_areas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.knowledge_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view knowledge areas" ON public.knowledge_areas FOR SELECT USING (true);
CREATE POLICY "Admins can manage knowledge areas" ON public.knowledge_areas FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Add knowledge_area_id to documents
ALTER TABLE public.documents ADD COLUMN knowledge_area_id UUID REFERENCES public.knowledge_areas(id);

-- Custom fields table for documents
CREATE TABLE public.document_custom_fields (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.document_custom_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view custom fields of accessible documents" ON public.document_custom_fields FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.documents d WHERE d.id = document_custom_fields.document_id
    AND (d.created_by = auth.uid() OR is_admin() OR is_manager())
  ));

CREATE POLICY "Creators and admins can manage custom fields" ON public.document_custom_fields FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.documents d WHERE d.id = document_custom_fields.document_id
    AND (d.created_by = auth.uid() OR is_admin())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.documents d WHERE d.id = document_custom_fields.document_id
    AND (d.created_by = auth.uid() OR is_admin())
  ));
