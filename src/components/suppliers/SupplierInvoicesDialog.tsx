import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Upload, Plus, Trash2, FileText, Loader2, Pencil, Save, X } from "lucide-react";
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

const SupplierInvoicesDialog = ({ open, onOpenChange, supplierId, supplierName }: Props) => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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
    }
  }, [open, supplierId]);

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
      setForm({
        invoice_number: parsed.invoice_number ?? "",
        atcud: parsed.atcud ?? "",
        issue_date: parsed.issue_date ?? "",
        due_date: parsed.due_date ?? "",
        payment_terms: parsed.payment_terms ?? "",
        client_name: parsed.client_name ?? "",
        client_nif: parsed.client_nif ?? "",
        net_total: parsed.net_total ?? null,
        vat_total: parsed.vat_total ?? null,
        total_amount: parsed.total_amount ?? null,
        currency: parsed.currency ?? "EUR",
        description: parsed.description ?? "",
        notes: "",
      });
      setEditingId(null);
      setShowForm(true);
      toast.success("Dados extraídos da fatura. Reveja e grave.");
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
    if (!form.invoice_number.trim()) {
      toast.error("Número da fatura é obrigatório");
      return;
    }
    const payload = {
      supplier_id: supplierId,
      invoice_number: form.invoice_number.trim(),
      atcud: form.atcud || null,
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

        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Nº Fatura</TableHead>
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
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    A carregar...
                  </TableCell>
                </TableRow>
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    Sem faturas registadas.
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.invoice_number}</TableCell>
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
