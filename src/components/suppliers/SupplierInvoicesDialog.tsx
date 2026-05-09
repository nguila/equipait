import { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Upload, Plus, Trash2, FileText, Loader2, Pencil, Save, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ExtractedInvoicePreview, { PreviewField } from "./ExtractedInvoicePreview";

interface Invoice {
  id: string;
  supplier_id: string;
  invoice_number: string;
  atcud: string | null;
  issue_date: string | null;
  due_date: string | null;
  payment_terms: string | null;
  client_name: string | null;
  client_nif: string | null;
  net_total: number | null;
  vat_total: number | null;
  total_amount: number | null;
  currency: string | null;
  description: string | null;
  notes: string | null;
}

const EMPTY: Omit<Invoice, "id" | "supplier_id"> = {
  invoice_number: "",
  atcud: "",
  issue_date: "",
  due_date: "",
  payment_terms: "",
  client_name: "",
  client_nif: "",
  net_total: null,
  vat_total: null,
  total_amount: null,
  currency: "EUR",
  description: "",
  notes: "",
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplierId: string | null;
  supplierName: string;
}

// ---------- Normalização / Validação ----------

// Aceita: "2023-12-11", "11.12.2023", "11/12/2023", "26-12-2023"
const normalizeDate = (v: unknown): string => {
  if (!v) return "";
  const s = String(v).trim();
  if (!s) return "";
  // ISO YYYY-MM-DD
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  // DD[./-]MM[./-]YYYY
  m = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
  if (m) {
    const d = m[1].padStart(2, "0");
    const mo = m[2].padStart(2, "0");
    return `${m[3]}-${mo}-${d}`;
  }
  return "";
};

const isValidDate = (v: string): boolean => {
  if (!v) return true;
  const d = new Date(v);
  return !isNaN(d.getTime());
};

// Aceita "1 211,20", "1.211,20", "1211.20", 1211.2
const normalizeNumber = (v: unknown): number | null => {
  if (v == null || v === "") return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  let s = String(v).trim().replace(/\s/g, "").replace(/€|EUR/gi, "");
  if (!s) return null;
  const hasComma = s.includes(",");
  const hasDot = s.includes(".");
  if (hasComma && hasDot) {
    // assume "." milhares, "," decimal
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (hasComma) {
    s = s.replace(",", ".");
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

const SupplierInvoicesDialog = ({ open, onOpenChange, supplierId, supplierName }: Props) => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Preview de extração
  const [previewFields, setPreviewFields] = useState<PreviewField[] | null>(null);
  const [previewSuggestions, setPreviewSuggestions] = useState<string[]>([]);
  const [previewDuplicate, setPreviewDuplicate] = useState(false);
  const [pendingForm, setPendingForm] = useState<typeof EMPTY | null>(null);

  // Pesquisa & filtros
  const [search, setSearch] = useState("");
  const [filterAtcud, setFilterAtcud] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [filterMin, setFilterMin] = useState("");
  const [filterMax, setFilterMax] = useState("");

  const load = async () => {
    if (!supplierId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("supplier_invoices")
      .select("*")
      .eq("supplier_id", supplierId)
      .order("issue_date", { ascending: false });
    if (error) toast.error("Erro a carregar faturas");
    else setInvoices((data as Invoice[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (open && supplierId) {
      load();
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY);
      setSearch("");
      setFilterAtcud("");
      setFilterFrom("");
      setFilterTo("");
      setFilterMin("");
      setFilterMax("");
      setPreviewFields(null);
      setPendingForm(null);
      setPreviewSuggestions([]);
      setPreviewDuplicate(false);
    }
  }, [open, supplierId]);

  const filtered = useMemo(() => {
    const min = normalizeNumber(filterMin);
    const max = normalizeNumber(filterMax);
    return invoices.filter((inv) => {
      if (search) {
        const q = search.toLowerCase();
        if (!inv.invoice_number.toLowerCase().includes(q)) return false;
      }
      if (filterAtcud) {
        const a = (inv.atcud || "").toLowerCase();
        if (!a.includes(filterAtcud.toLowerCase())) return false;
      }
      if (filterFrom && (!inv.issue_date || inv.issue_date < filterFrom)) return false;
      if (filterTo && (!inv.issue_date || inv.issue_date > filterTo)) return false;
      if (min != null && (inv.total_amount == null || inv.total_amount < min)) return false;
      if (max != null && (inv.total_amount == null || inv.total_amount > max)) return false;
      return true;
    });
  }, [invoices, search, filterAtcud, filterFrom, filterTo, filterMin, filterMax]);

  const handleImportPdf = async (file: File) => {
    if (!supplierId) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Ficheiro demasiado grande (máx. 10MB)");
      return;
    }
    setImporting(true);
    try {
      const buf = await file.arrayBuffer();
      const bytes = new Uint8Array(buf);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
      const b64 = btoa(binary);

      const { data, error } = await supabase.functions.invoke("parse-supplier-invoice", {
        body: { pdf_base64: b64, mime_type: file.type || "application/pdf" },
      });

      if (error) throw error;
      const parsed = (data as any)?.data || {};

      // Normalização
      const issue_date = normalizeDate(parsed.issue_date);
      const due_date = normalizeDate(parsed.due_date);
      const net_total = normalizeNumber(parsed.net_total);
      const vat_total = normalizeNumber(parsed.vat_total);
      const total_amount = normalizeNumber(parsed.total_amount);
      const invoice_number = (parsed.invoice_number ?? "").toString().trim();

      // Validações
      const warnings: string[] = [];
      if (parsed.issue_date && !issue_date) warnings.push("data de emissão inválida");
      if (parsed.due_date && !due_date) warnings.push("data de vencimento inválida");
      if (parsed.net_total != null && net_total == null) warnings.push("total líquido inválido");
      if (parsed.total_amount != null && total_amount == null) warnings.push("total inválido");

      // Verificação de duplicados
      let isDuplicate = false;
      if (invoice_number) {
        const { data: dup } = await supabase
          .from("supplier_invoices")
          .select("id, invoice_number")
          .eq("supplier_id", supplierId)
          .eq("invoice_number", invoice_number)
          .maybeSingle();
        if (dup) isDuplicate = true;
      }

      const nextForm: typeof EMPTY = {
        invoice_number,
        atcud: (parsed.atcud ?? "").toString().trim(),
        issue_date,
        due_date,
        payment_terms: parsed.payment_terms ?? "",
        client_name: parsed.client_name ?? "",
        client_nif: parsed.client_nif ?? "",
        net_total,
        vat_total,
        total_amount,
        currency: parsed.currency ?? "EUR",
        description: parsed.description ?? "",
        notes: "",
      };

      // Construir campos do preview
      const fields: PreviewField[] = [
        {
          key: "invoice_number",
          label: "Nº Fatura",
          raw: parsed.invoice_number,
          value: invoice_number,
          status: invoice_number ? (isDuplicate ? "warning" : "ok") : "missing",
          message: isDuplicate ? "Número já existe para este fornecedor" : undefined,
        },
        {
          key: "atcud",
          label: "ATCUD",
          raw: parsed.atcud,
          value: nextForm.atcud,
          status: nextForm.atcud ? "ok" : "warning",
          message: !nextForm.atcud ? "Não detetado no PDF" : undefined,
        },
        {
          key: "issue_date",
          label: "Data Emissão",
          raw: parsed.issue_date,
          value: issue_date,
          status: parsed.issue_date && !issue_date ? "warning" : issue_date ? "ok" : "missing",
          message: parsed.issue_date && !issue_date ? "Formato não reconhecido" : undefined,
        },
        {
          key: "due_date",
          label: "Data Vencimento",
          raw: parsed.due_date,
          value: due_date,
          status: parsed.due_date && !due_date ? "warning" : due_date ? "ok" : "missing",
          message:
            parsed.due_date && !due_date
              ? "Formato não reconhecido"
              : due_date && issue_date && due_date < issue_date
              ? "Vencimento anterior à emissão"
              : undefined,
        },
        {
          key: "client_name",
          label: "Cliente",
          raw: parsed.client_name,
          value: nextForm.client_name,
          status: nextForm.client_name ? "ok" : "warning",
        },
        {
          key: "client_nif",
          label: "NIF Cliente",
          raw: parsed.client_nif,
          value: nextForm.client_nif,
          status: nextForm.client_nif
            ? /^(PT)?\s?\d{9}$/.test(String(nextForm.client_nif).replace(/\s/g, ""))
              ? "ok"
              : "warning"
            : "warning",
          message:
            nextForm.client_nif &&
            !/^(PT)?\s?\d{9}$/.test(String(nextForm.client_nif).replace(/\s/g, ""))
              ? "Formato de NIF pode estar incorreto"
              : undefined,
        },
        {
          key: "net_total",
          label: "Total Líquido",
          raw: parsed.net_total,
          value: net_total,
          status: parsed.net_total != null && net_total == null ? "warning" : net_total != null ? "ok" : "missing",
        },
        {
          key: "vat_total",
          label: "Total IVA",
          raw: parsed.vat_total,
          value: vat_total,
          status: parsed.vat_total != null && vat_total == null ? "warning" : vat_total != null ? "ok" : "missing",
        },
        {
          key: "total_amount",
          label: "Total",
          raw: parsed.total_amount,
          value: total_amount,
          status: parsed.total_amount != null && total_amount == null ? "warning" : total_amount != null ? "ok" : "missing",
        },
        {
          key: "currency",
          label: "Moeda",
          raw: parsed.currency,
          value: nextForm.currency,
          status: "ok",
        },
      ];

      // Sugestões globais
      const suggestions: string[] = [];
      if (net_total != null && vat_total != null && total_amount != null) {
        const sum = Number((net_total + vat_total).toFixed(2));
        if (Math.abs(sum - total_amount) > 0.02) {
          suggestions.push(
            `Líquido (${net_total.toFixed(2)}) + IVA (${vat_total.toFixed(2)}) = ${sum.toFixed(2)} não confere com Total (${total_amount.toFixed(2)})`,
          );
        }
      }
      if (!invoice_number) suggestions.push("Preencha manualmente o número da fatura antes de gravar.");
      if (issue_date && due_date && due_date < issue_date) {
        suggestions.push("Verifique as datas: vencimento é anterior à emissão.");
      }

      setPendingForm(nextForm);
      setPreviewFields(fields);
      setPreviewSuggestions(suggestions);
      setPreviewDuplicate(isDuplicate);
      setShowForm(false);
      setEditingId(null);

      toast.success("Pré-visualização pronta. Reveja os campos destacados.");
    } catch (e) {
      console.error(e);
      toast.error("Falha ao processar PDF");
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!supplierId || !user) return;
    const invoice_number = form.invoice_number.trim();
    if (!invoice_number) {
      toast.error("Número da fatura é obrigatório");
      return;
    }
    // Validar datas
    if (form.issue_date && !isValidDate(form.issue_date)) {
      toast.error("Data de emissão inválida");
      return;
    }
    if (form.due_date && !isValidDate(form.due_date)) {
      toast.error("Data de vencimento inválida");
      return;
    }
    if (form.issue_date && form.due_date && form.due_date < form.issue_date) {
      toast.error("Vencimento não pode ser anterior à emissão");
      return;
    }
    // Validar valores
    for (const [k, label] of [
      ["net_total", "Total líquido"],
      ["vat_total", "Total IVA"],
      ["total_amount", "Total"],
    ] as const) {
      const v = form[k];
      if (v != null && (!Number.isFinite(v) || v < 0)) {
        toast.error(`${label} inválido`);
        return;
      }
    }

    // Verificação de duplicados (criação ou alteração de número)
    const { data: dup } = await supabase
      .from("supplier_invoices")
      .select("id")
      .eq("supplier_id", supplierId)
      .eq("invoice_number", invoice_number)
      .maybeSingle();
    if (dup && dup.id !== editingId) {
      toast.error(`Já existe uma fatura com o nº ${invoice_number} para este fornecedor.`);
      return;
    }

    const payload = {
      supplier_id: supplierId,
      invoice_number,
      atcud: form.atcud?.trim() || null,
      issue_date: form.issue_date || null,
      due_date: form.due_date || null,
      payment_terms: form.payment_terms || null,
      client_name: form.client_name || null,
      client_nif: form.client_nif || null,
      net_total: form.net_total,
      vat_total: form.vat_total,
      total_amount: form.total_amount,
      currency: form.currency || "EUR",
      description: form.description || null,
      notes: form.notes || null,
    };
    if (editingId) {
      const { error } = await supabase
        .from("supplier_invoices")
        .update(payload)
        .eq("id", editingId);
      if (error) return toast.error("Erro a atualizar");
      toast.success("Fatura atualizada");
    } else {
      const { error } = await supabase
        .from("supplier_invoices")
        .insert({ ...payload, created_by: user.id });
      if (error) return toast.error("Erro a gravar");
      toast.success("Fatura registada");
    }
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminar esta fatura?")) return;
    const { error } = await supabase.from("supplier_invoices").delete().eq("id", id);
    if (error) return toast.error("Erro a eliminar");
    toast.success("Fatura eliminada");
    load();
  };

  const startEdit = (inv: Invoice) => {
    setEditingId(inv.id);
    setForm({
      invoice_number: inv.invoice_number,
      atcud: inv.atcud ?? "",
      issue_date: inv.issue_date ?? "",
      due_date: inv.due_date ?? "",
      payment_terms: inv.payment_terms ?? "",
      client_name: inv.client_name ?? "",
      client_nif: inv.client_nif ?? "",
      net_total: inv.net_total,
      vat_total: inv.vat_total,
      total_amount: inv.total_amount,
      currency: inv.currency ?? "EUR",
      description: inv.description ?? "",
      notes: inv.notes ?? "",
    });
    setShowForm(true);
  };

  const numInput = (v: number | null) => (v == null ? "" : String(v));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Faturas — {supplierName}</DialogTitle>
          <DialogDescription>
            Importe um PDF para preencher automaticamente os campos ou adicione manualmente.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImportPdf(f);
            }}
          />
          <Button
            variant="outline"
            onClick={() => fileRef.current?.click()}
            disabled={importing}
            className="gap-2"
          >
            {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Importar PDF
          </Button>
          <Button
            onClick={() => {
              setEditingId(null);
              setForm(EMPTY);
              setShowForm(true);
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Nova Fatura
          </Button>
        </div>

        {previewFields && (
          <ExtractedInvoicePreview
            fields={previewFields}
            globalSuggestions={previewSuggestions}
            duplicate={previewDuplicate}
            onCancel={() => {
              setPreviewFields(null);
              setPendingForm(null);
              setPreviewSuggestions([]);
              setPreviewDuplicate(false);
            }}
            onConfirm={() => {
              if (pendingForm) setForm(pendingForm);
              setShowForm(true);
              setPreviewFields(null);
              setPendingForm(null);
              setPreviewSuggestions([]);
              setPreviewDuplicate(false);
            }}
          />
        )}

        {showForm && (
          <div className="rounded-lg border border-border p-4 space-y-3 bg-muted/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>Nº Fatura *</Label>
                <Input
                  value={form.invoice_number}
                  onChange={(e) => setForm({ ...form, invoice_number: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>ATCUD</Label>
                <Input
                  value={form.atcud ?? ""}
                  onChange={(e) => setForm({ ...form, atcud: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Moeda</Label>
                <Input
                  value={form.currency ?? ""}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Data Emissão</Label>
                <Input
                  type="date"
                  value={form.issue_date ?? ""}
                  onChange={(e) => setForm({ ...form, issue_date: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Data Vencimento</Label>
                <Input
                  type="date"
                  value={form.due_date ?? ""}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Prazo Pagamento</Label>
                <Input
                  value={form.payment_terms ?? ""}
                  onChange={(e) => setForm({ ...form, payment_terms: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Cliente</Label>
                <Input
                  value={form.client_name ?? ""}
                  onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>NIF Cliente</Label>
                <Input
                  value={form.client_nif ?? ""}
                  onChange={(e) => setForm({ ...form, client_nif: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Total Líquido</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={numInput(form.net_total)}
                  onChange={(e) =>
                    setForm({ ...form, net_total: e.target.value === "" ? null : Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Total IVA</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={numInput(form.vat_total)}
                  onChange={(e) =>
                    setForm({ ...form, vat_total: e.target.value === "" ? null : Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Total</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={numInput(form.total_amount)}
                  onChange={(e) =>
                    setForm({ ...form, total_amount: e.target.value === "" ? null : Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Descrição</Label>
              <Textarea
                rows={2}
                value={form.description ?? ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Notas</Label>
              <Textarea
                rows={2}
                value={form.notes ?? ""}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setForm(EMPTY);
                }}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>
              <Button onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" />
                Gravar
              </Button>
            </div>
          </div>
        )}

        {/* Pesquisa e filtros */}
        <div className="rounded-lg border border-border p-3 bg-muted/10 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Search className="h-4 w-4" /> Pesquisa e filtros
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            <div className="col-span-2">
              <Input
                placeholder="Nº fatura"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Input
              placeholder="ATCUD"
              value={filterAtcud}
              onChange={(e) => setFilterAtcud(e.target.value)}
            />
            <Input
              type="date"
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
              title="Emissão de"
            />
            <Input
              type="date"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
              title="Emissão até"
            />
            <div className="grid grid-cols-2 gap-1">
              <Input
                type="number"
                step="0.01"
                placeholder="Total min"
                value={filterMin}
                onChange={(e) => setFilterMin(e.target.value)}
              />
              <Input
                type="number"
                step="0.01"
                placeholder="Total máx"
                value={filterMax}
                onChange={(e) => setFilterMax(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Nº Fatura</TableHead>
                <TableHead>ATCUD</TableHead>
                <TableHead>Emissão</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    A carregar...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    {invoices.length === 0
                      ? "Sem faturas registadas."
                      : "Sem resultados para os filtros aplicados."}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.invoice_number}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{inv.atcud || "—"}</TableCell>
                    <TableCell>{inv.issue_date || "—"}</TableCell>
                    <TableCell>{inv.due_date || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {inv.client_name || "—"}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {inv.total_amount != null
                        ? `${inv.total_amount.toFixed(2)} ${inv.currency || ""}`
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(inv)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDelete(inv.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SupplierInvoicesDialog;
