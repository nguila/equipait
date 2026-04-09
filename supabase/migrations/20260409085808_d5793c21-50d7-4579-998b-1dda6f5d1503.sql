
-- Tabela de categorias de tickets
CREATE TABLE public.ticket_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ticket_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view ticket_categories"
  ON public.ticket_categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins managers can manage ticket_categories"
  ON public.ticket_categories FOR ALL
  TO authenticated
  USING (is_admin() OR is_manager())
  WITH CHECK (is_admin() OR is_manager());

-- Tabela de tipos de equipamento
CREATE TABLE public.ticket_equipment_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ticket_equipment_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view ticket_equipment_types"
  ON public.ticket_equipment_types FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins managers can manage ticket_equipment_types"
  ON public.ticket_equipment_types FOR ALL
  TO authenticated
  USING (is_admin() OR is_manager())
  WITH CHECK (is_admin() OR is_manager());

-- Inserir valores predefinidos
INSERT INTO public.ticket_categories (name) VALUES
  ('Hardware'), ('Software'), ('Rede'), ('Email'),
  ('Impressoras'), ('Acessos'), ('Telefonia'), ('Outro');

INSERT INTO public.ticket_equipment_types (name) VALUES
  ('Servidor'), ('Portátil'), ('Desktop'), ('Impressora'),
  ('Quadro Interativo'), ('Smart TV'), ('Outro');
