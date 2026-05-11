# Plano: Importação de faturas com IA + gestão de garantias

A funcionalidade é grande. Proponho dividi-la em **3 fases** para entregar valor incremental e evitar uma migração gigante de uma vez.

---

## Fase 1 — Fundações (esta entrega)

### 1.1 Limpeza
- Remover o cartão **"Serviços"** do bloco Acesso Rápido em `Dashboard.tsx` (já não aparece no menu, mas continua nos quick links).

### 1.2 Base de dados (migração)
Novas tabelas:

- **`supplier_invoice_items`** — linhas de equipamento por fatura
  - `invoice_id`, `name`, `brand`, `model`, `sku`, `serial_number`, `quantity`, `unit_price`, `vat_rate`, `warranty_years`, `warranty_start`, `warranty_end`, `inventory_item_id` (nullable, ligação ao item criado)
- **`warranties`** — garantia por item de inventário
  - `inventory_item_id`, `supplier_id`, `invoice_id`, `serial_number`, `start_date`, `end_date`, `years`, `notes`
- Adicionar a `supplier_invoices`: `payment_method`, `supplier_address`, `supplier_email`, `supplier_phone`
- Adicionar a `inventory_items`: `brand`, `model`, `sku`, `unit_price`, `supplier_id`, `invoice_id`, `purchase_date`
- Bucket de storage **`supplier-invoices`** (privado, 20MB) com RLS apropriadas

RLS: mesmas regras dos `supplier_invoices` (autenticado vê, criadores/admins/managers gerem).

### 1.3 Edge function `parse-supplier-invoice`
Estender o schema JSON para incluir `payment_method` e um array `items[]` com:
`name, brand, model, sku, serial_number, quantity, unit_price, warranty_years, warranty_start, warranty_end`.
Aceitar PDF **e imagens** (JPG/PNG); o `image_url` do gateway já trata ambos.

### 1.4 UI — Importação no Inventário
- Adicionar botão **"Importar Fatura"** na página `InventoryPage` (topo, ao lado dos botões existentes).
- Reutilizar o componente `SupplierInvoicesDialog` num novo modo "import only" que:
  - Aceita drag & drop de PDF/JPG/PNG
  - Mostra preview com edição inline (igual ao já existente para fornecedores)
  - Lista os itens detetados em tabela editável
  - Permite escolher/criar fornecedor inline (caso o detetado por NIF não exista)
  - Ao confirmar: faz upload do ficheiro para o bucket, cria/atualiza fornecedor, cria a fatura, cria as linhas e cria/atualiza items de inventário + registos de garantia.

### 1.5 UI — Importação na página de Fornecedores
- O botão por linha já existe; passa a usar o mesmo fluxo enriquecido (com items + garantias).

---

## Fase 2 — Garantias (entrega seguinte)
- Nova aba/secção **"Garantias"** na `InventoryPage`:
  - Estado (ativa/expira em 30d/expirada), dias restantes, alerta visual
  - Filtros: estado, fornecedor, pesquisa por número de série
- Widget no Dashboard: **garantias a expirar (30 dias)**, **últimas faturas importadas**, **equipamentos sem garantia**.

## Fase 3 — Histórico e refinamentos
- Tabela de **histórico de importações** (drill-down por fatura → items → inventário).
- Reabertura/edição de uma fatura já importada (re-sincronizar items).
- Preparar abstração para troca futura entre Lovable AI / Azure Document Intelligence.

---

## Detalhes técnicos

- **OCR/IA**: continua via Lovable AI Gateway (`google/gemini-2.5-flash` com input multimodal). Sem custos adicionais para o utilizador, sem chaves extra.
- **Validação**: Zod no edge function + normalização de datas/valores no cliente (já implementado para fornecedores, será extendido aos items).
- **Duplicados**: já implementado por (supplier_id, invoice_number); manter.
- **Segurança**: bucket privado, validação de mime type (`application/pdf`, `image/jpeg`, `image/png`), limite 20MB no cliente e RLS no servidor.
- **Sem alterações destrutivas**: nenhuma tabela existente perde colunas; só adicionamos.

---

## Confirmação necessária

Avanço já com a **Fase 1** completa (limpeza + migração + edge function + UI no Inventário e Fornecedores)? Ou preferes ajustar o âmbito antes (ex.: mover a gestão de garantias para a Fase 1)?