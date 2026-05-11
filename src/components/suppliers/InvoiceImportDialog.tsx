import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Upload,
  Loader2,
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ---------------- Normalization ----------------

const normalizeDate = (v: unknown): string => {
  if (!v) return "";
  const s = String(v).trim();
  if (!s) return "";
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
  if (m) {
    const d = m[1].padStart(2, "0");
    const mo = m[2].padStart(2, "0");
    return `${m[3]}-${mo}-${d}`;
  }
  return "";
};

const normalizeNumber = (v: unknown): number | null => {
  if (v == null || v === "") return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  let s = String(v).trim().replace(/\s/g, "").replace(/€|EUR/gi, "");
  if (!s) return null;
  const hasComma = s.includes(",");
  const hasDot = s.includes(".");
  if (hasComma && hasDot) s = s.replace(/\./g, "").replace(",", ".");
  else if (hasComma) s = s.replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

const addYears = (iso: string, years: number): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().slice(0, 10);
};

// ---------------- Types ----------------

interface ItemRow {
  name: string;
  brand: string;
  model: string;
  sku: string;
  serial_number: string;
  quantity: number;
  unit_price: number | null;
  vat_rate: number | null;
  warranty_years: number | null;
  warranty_start: string;
  warranty_end: string;
  category: string;
  create_inventory: boolean;
  inventory_item_id: string | null;
}

interface InvoiceForm {
  invoice_number: string;
  atcud: string;
  issue_date: string;
  due_date: string;
  payment_terms: string;
  payment_method: string;
  client_name: string;
  client_nif: string;
  net_total: number | null;
  vat_total: number | null;
  total_amount: number | null;
  currency: string;
  description: string;
  notes: string;
}

interface SupplierForm {
  id: string | null;
  name: string;
  nif: string;
  address: string;
  email: string;
  phone: string;
}

const EMPTY_INVOICE: InvoiceForm = {
  invoice_number: "",
  atcud: "",
  issue_date: "",
  due_date: "",
  payment_terms: "",
  payment_method: "",
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
  // If supplied, dialog is locked to this supplier
  fixedSupplierId?: string | null;
  fixedSupplierName?: string;
  onCreated?: () => void;
}

interface SupplierOption {
  id: string;
  name: string;
  nif: string | null;
}

interface InventoryCat {
  id: string;
  name: string;
}

const InvoiceImportDialog = ({
  open,
  onOpenChange,
  fixedSupplierId,
  fixedSupplierName,
  onCreated,
}: Props) => {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<"upload" | "preview">("upload");
  const [importing, setImporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [categories, setCategories] = useState<InventoryCat[]>([]);

  const [supplier, setSupplier] = useState<SupplierForm>({
    id: null,
    name: "",
    nif: "",
    address: "",
    email: "",
    phone: "",
  });
  const [invoice, setInvoice] = useState<InvoiceForm>(EMPTY_INVOICE);
  const [items, setItems] = useState<ItemRow[]>([]);
  const [duplicate, setDuplicate] = useState(false);

  const reset = () => {
    setStep("upload");
    setFile(null);
    setInvoice(EMPTY_INVOICE);
    setItems([]);
    setDuplicate(false);
    setSupplier({
      id: fixedSupplierId ?? null,
      name: fixedSupplierName ?? "",
      nif: "",
      address: "",
      email: "",
      phone: "",
    });
    if (fileRef.current) fileRef.current.value = "";
  };

  useEffect(() => {
    if (!open) return;
    reset();
    (async () => {
      const [sup, cats] = await Promise.all([
        supabase.from("suppliers").select("id, name, nif").order("name"),
        supabase.from("inventory_categories").select("id, name").order("name"),
      ]);
      if (sup.data) setSuppliers(sup.data as SupplierOption[]);
      if (cats.data) setCategories(cats.data as InventoryCat[]);
    })();
  }, [open, fixedSupplierId, fixedSupplierName]);

  // Duplicate detection
  useEffect(() => {
    const num = invoice.invoice_number.trim();
    const sid = supplier.id;
    if (!num || !sid) {
      setDuplicate(false);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from("supplier_invoices")
        .select("id")
        .eq("supplier_id", sid)
        .eq("invoice_number", num)
        .maybeSingle();
      if (!cancelled) setDuplicate(!!data);
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [invoice.invoice_number, supplier.id]);

  // ---------- Upload ----------

  const acceptFile = (f: File): boolean => {
    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(f.type)) {
      toast.error("Formato não suportado. Use PDF, JPG ou PNG.");
      return false;
    }
    if (f.size > 20 * 1024 * 1024) {
      toast.error("Ficheiro demasiado grande (máx. 20MB).");
      return false;
    }
    return true;
  };

  const handleFile = async (f: File) => {
    if (!acceptFile(f)) return;
    setFile(f);
    setImporting(true);
    try {
      const buf = await f.arrayBuffer();
      const bytes = new Uint8Array(buf);
      let bin = "";
      for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
      const b64 = btoa(bin);

      const { data, error } = await supabase.functions.invoke("parse-supplier-invoice", {
        body: { pdf_base64: b64, mime_type: f.type },
      });
      if (error) throw error;
      const parsed = (data as any)?.data || {};

      // Invoice fields
      const issue = normalizeDate(parsed.issue_date);
      setInvoice({
        invoice_number: String(parsed.invoice_number ?? "").trim(),
        atcud: String(parsed.atcud ?? "").trim(),
        issue_date: issue,
        due_date: normalizeDate(parsed.due_date),
        payment_terms: parsed.payment_terms ?? "",
        payment_method: parsed.payment_method ?? "",
        client_name: parsed.client_name ?? "",
        client_nif: parsed.client_nif ?? "",
        net_total: normalizeNumber(parsed.net_total),
        vat_total: normalizeNumber(parsed.vat_total),
        total_amount: normalizeNumber(parsed.total_amount),
        currency: parsed.currency ?? "EUR",
        description: parsed.description ?? "",
        notes: "",
      });

      // Supplier — try to match by NIF if not fixed
      if (!fixedSupplierId) {
        const detectedNif = String(parsed.supplier_nif ?? "").trim();
        const detectedName = String(parsed.supplier_name ?? "").trim();
        let matched: SupplierOption | undefined;
        if (detectedNif) matched = suppliers.find((s) => (s.nif || "").trim() === detectedNif);
        if (!matched && detectedName) {
          matched = suppliers.find(
            (s) => s.name.toLowerCase() === detectedName.toLowerCase(),
          );
        }
        setSupplier({
          id: matched?.id ?? null,
          name: detectedName,
          nif: detectedNif,
          address: parsed.supplier_address ?? "",
          email: parsed.supplier_email ?? "",
          phone: parsed.supplier_phone ?? "",
        });
      }

      // Items
      const parsedItems = Array.isArray(parsed.items) ? parsed.items : [];
      setItems(
        parsedItems.map((it: any) => {
          const ws = normalizeDate(it.warranty_start) || issue;
          const wy = normalizeNumber(it.warranty_years);
          const we =
            normalizeDate(it.warranty_end) || (ws && wy ? addYears(ws, wy) : "");
          return {
            name: String(it.name ?? "").trim(),
            brand: String(it.brand ?? "").trim(),
            model: String(it.model ?? "").trim(),
            sku: String(it.sku ?? "").trim(),
            serial_number: String(it.serial_number ?? "").trim(),
            quantity: normalizeNumber(it.quantity) ?? 1,
            unit_price: normalizeNumber(it.unit_price),
            vat_rate: normalizeNumber(it.vat_rate),
            warranty_years: wy,
            warranty_start: ws,
            warranty_end: we,
            category: "",
            create_inventory: true,
            inventory_item_id: null,
          };
        }),
      );

      setStep("preview");
      toast.success("Dados extraídos. Reveja e edite antes de gravar.");
    } catch (e) {
      console.error(e);
      toast.error("Falha ao processar a fatura.");
    } finally {
      setImporting(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  // ---------- Items helpers ----------

  const updateItem = (idx: number, patch: Partial<ItemRow>) => {
    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== idx) return it;
        const merged = { ...it, ...patch };
        // Auto-recompute warranty_end when years/start changes
        if (
          (patch.warranty_years !== undefined || patch.warranty_start !== undefined) &&
          merged.warranty_start &&
          merged.warranty_years
        ) {
          merged.warranty_end = addYears(merged.warranty_start, merged.warranty_years);
        }
        return merged;
      }),
    );
  };

  const addItem = () =>
    setItems((p) => [
      ...p,
      {
        name: "",
        brand: "",
        model: "",
        sku: "",
        serial_number: "",
        quantity: 1,
        unit_price: null,
        vat_rate: null,
        warranty_years: null,
        warranty_start: invoice.issue_date,
        warranty_end: "",
        category: "",
        create_inventory: true,
        inventory_item_id: null,
      },
    ]);

  const removeItem = (idx: number) =>
    setItems((p) => p.filter((_, i) => i !== idx));

  // ---------- Suggestions ----------

  const totalsWarning = useMemo(() => {
    const { net_total, vat_total, total_amount } = invoice;
    if (net_total != null && vat_total != null && total_amount != null) {
      const sum = Number((net_total + vat_total).toFixed(2));
      if (Math.abs(sum - total_amount) > 0.02) {
        return `Líquido + IVA = ${sum.toFixed(2)} ≠ Total ${total_amount.toFixed(2)}`;
      }
    }
    return null;
  }, [invoice]);

  // ---------- Save ----------

  const handleSave = async () => {
    if (!user) {
      toast.error("Sessão necessária.");
      return;
    }
    if (!invoice.invoice_number.trim()) {
      toast.error("Número da fatura é obrigatório.");
      return;
    }
    if (!supplier.id && !supplier.name.trim()) {
      toast.error("Selecione ou crie um fornecedor.");
      return;
    }
    setSaving(true);
    try {
      // 1. Resolve supplier
      let supplierId = supplier.id;
      if (!supplierId) {
        const { data, error } = await supabase
          .from("suppliers")
          .insert({
            name: supplier.name.trim(),
            nif: supplier.nif || null,
            address: supplier.address || null,
            email: supplier.email || null,
            phone: supplier.phone || null,
            category: "geral",
            status: "ativo",
            created_by: user.id,
          })
          .select("id")
          .single();
        if (error) throw error;
        supplierId = data.id;
      } else {
        // Update missing supplier fields with detected info
        const patch: Record<string, string> = {};
        if (supplier.address) patch.address = supplier.address;
        if (supplier.email) patch.email = supplier.email;
        if (supplier.phone) patch.phone = supplier.phone;
        if (Object.keys(patch).length) {
          await supabase.from("suppliers").update(patch).eq("id", supplierId);
        }
      }

      // 2. Duplicate check
      const { data: dup } = await supabase
        .from("supplier_invoices")
        .select("id")
        .eq("supplier_id", supplierId)
        .eq("invoice_number", invoice.invoice_number.trim())
        .maybeSingle();
      if (dup) {
        toast.error("Já existe uma fatura com esse número para este fornecedor.");
        setSaving(false);
        return;
      }

      // 3. Upload file
      let filePath: string | null = null;
      if (file) {
        const ext = file.name.split(".").pop() || "bin";
        const safe = invoice.invoice_number.replace(/[^a-zA-Z0-9_-]/g, "_");
        filePath = `${user.id}/${supplierId}/${Date.now()}_${safe}.${ext}`;
        const up = await supabase.storage
          .from("supplier-invoices")
          .upload(filePath, file, { contentType: file.type });
        if (up.error) {
          console.error(up.error);
          toast.error("Falha a guardar o ficheiro, mas continuo a gravar a fatura.");
          filePath = null;
        }
      }

      // 4. Insert invoice
      const { data: inv, error: invErr } = await supabase
        .from("supplier_invoices")
        .insert({
          supplier_id: supplierId,
          invoice_number: invoice.invoice_number.trim(),
          atcud: invoice.atcud || null,
          issue_date: invoice.issue_date || null,
          due_date: invoice.due_date || null,
          payment_terms: invoice.payment_terms || null,
          payment_method: invoice.payment_method || null,
          supplier_address: supplier.address || null,
          supplier_email: supplier.email || null,
          supplier_phone: supplier.phone || null,
          client_name: invoice.client_name || null,
          client_nif: invoice.client_nif || null,
          net_total: invoice.net_total,
          vat_total: invoice.vat_total,
          total_amount: invoice.total_amount,
          currency: invoice.currency || "EUR",
          description: invoice.description || null,
          notes: invoice.notes || null,
          file_path: filePath,
          created_by: user.id,
        })
        .select("id")
        .single();
      if (invErr) throw invErr;
      const invoiceId = inv.id;

      // 5. Items + inventory + warranties
      // Get current max INV-XXX
      const { data: existing } = await supabase
        .from("inventory_items")
        .select("code");
      let codeNum = 0;
      (existing || []).forEach((r: any) => {
        const m = String(r.code).match(/INV-(\d+)/);
        if (m) codeNum = Math.max(codeNum, parseInt(m[1], 10));
      });

      for (const it of items) {
        let inventoryItemId = it.inventory_item_id;
        if (it.create_inventory && it.name) {
          // Try to find by serial number
          if (it.serial_number) {
            const { data: existingSn } = await supabase
              .from("inventory_items")
              .select("id")
              .eq("serial_number", it.serial_number)
              .maybeSingle();
            if (existingSn) inventoryItemId = existingSn.id;
          }
          if (!inventoryItemId) {
            codeNum += 1;
            const code = `INV-${String(codeNum).padStart(3, "0")}`;
            const { data: newItem, error: invItemErr } = await supabase
              .from("inventory_items")
              .insert({
                code,
                name: it.name,
                serial_number: it.serial_number || null,
                category: it.category || "geral",
                brand: it.brand || null,
                model: it.model || null,
                sku: it.sku || null,
                unit_price: it.unit_price,
                supplier_id: supplierId,
                invoice_id: invoiceId,
                purchase_date: invoice.issue_date || null,
                status: "ativo",
                created_by: user.id,
              })
              .select("id")
              .single();
            if (invItemErr) {
              console.error(invItemErr);
              toast.error(`Erro ao criar item "${it.name}"`);
              continue;
            }
            inventoryItemId = newItem.id;
          } else {
            // Link existing to invoice
            await supabase
              .from("inventory_items")
              .update({
                supplier_id: supplierId,
                invoice_id: invoiceId,
                purchase_date: invoice.issue_date || null,
                brand: it.brand || null,
                model: it.model || null,
                sku: it.sku || null,
                unit_price: it.unit_price,
              })
              .eq("id", inventoryItemId);
          }
        }

        const { data: lineRow } = await supabase
          .from("supplier_invoice_items")
          .insert({
            invoice_id: invoiceId,
            inventory_item_id: inventoryItemId,
            name: it.name || "(sem nome)",
            brand: it.brand || null,
            model: it.model || null,
            sku: it.sku || null,
            serial_number: it.serial_number || null,
            quantity: it.quantity || 1,
            unit_price: it.unit_price,
            vat_rate: it.vat_rate,
            warranty_years: it.warranty_years,
            warranty_start: it.warranty_start || null,
            warranty_end: it.warranty_end || null,
            created_by: user.id,
          })
          .select("id")
          .single();

        if (it.warranty_start || it.warranty_end || it.warranty_years) {
          await supabase.from("warranties").insert({
            inventory_item_id: inventoryItemId,
            supplier_id: supplierId,
            invoice_id: invoiceId,
            invoice_item_id: lineRow?.id ?? null,
            serial_number: it.serial_number || null,
            start_date: it.warranty_start || null,
            end_date: it.warranty_end || null,
            years: it.warranty_years,
            created_by: user.id,
          });
        }
      }

      toast.success("Fatura importada com sucesso.");
      onCreated?.();
      onOpenChange(false);
    } catch (e: any) {
      console.error(e);
      toast.error("Erro ao gravar: " + (e?.message ?? String(e)));
    } finally {
      setSaving(false);
    }
  };

  // ---------- Render ----------

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Importar Fatura
            {fixedSupplierName && (
              <Badge variant="secondary" className="ml-2">
                {fixedSupplierName}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Carrega um PDF ou imagem da fatura. A IA extrai automaticamente
            fornecedor, dados da fatura, equipamentos e garantias.
          </DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`mt-4 rounded-lg border-2 border-dashed p-10 text-center transition-colors ${
              dragOver ? "border-primary bg-primary/5" : "border-muted"
            }`}
          >
            {importing ? (
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p>A processar fatura com IA…</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <FileText className="h-7 w-7 text-primary" />
                </div>
                <p className="font-medium">
                  Arraste o ficheiro para aqui ou
                </p>
                <Button onClick={() => fileRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Selecionar ficheiro
                </Button>
                <p className="text-xs text-muted-foreground">
                  PDF, JPG ou PNG · máx. 20MB
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/pdf,image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
              </div>
            )}
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-6 mt-2">
            {/* File chip */}
            {file && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>{file.name}</span>
                <Badge variant="outline">{(file.size / 1024).toFixed(0)} KB</Badge>
              </div>
            )}

            {/* Supplier */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" /> Fornecedor
              </h3>
              {!fixedSupplierId && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Fornecedor existente</Label>
                    <Select
                      value={supplier.id ?? "new"}
                      onValueChange={(v) => {
                        if (v === "new") {
                          setSupplier({ ...supplier, id: null });
                        } else {
                          const s = suppliers.find((x) => x.id === v);
                          if (s)
                            setSupplier({
                              ...supplier,
                              id: s.id,
                              name: s.name,
                              nif: s.nif || supplier.nif,
                            });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar…" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">+ Criar novo fornecedor</SelectItem>
                        {suppliers.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name} {s.nif ? `(${s.nif})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Nome</Label>
                    <Input
                      value={supplier.name}
                      onChange={(e) =>
                        setSupplier({ ...supplier, name: e.target.value })
                      }
                      disabled={!!supplier.id}
                    />
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <Label>NIF</Label>
                  <Input
                    value={supplier.nif}
                    onChange={(e) => setSupplier({ ...supplier, nif: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    value={supplier.email}
                    onChange={(e) =>
                      setSupplier({ ...supplier, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input
                    value={supplier.phone}
                    onChange={(e) =>
                      setSupplier({ ...supplier, phone: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <Label>Morada</Label>
                  <Input
                    value={supplier.address}
                    onChange={(e) =>
                      setSupplier({ ...supplier, address: e.target.value })
                    }
                  />
                </div>
              </div>
            </section>

            {/* Invoice */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Dados da Fatura
                {duplicate && (
                  <Badge variant="destructive" className="ml-2 gap-1">
                    <AlertTriangle className="h-3 w-3" /> Já existe
                  </Badge>
                )}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <Label>Nº Fatura *</Label>
                  <Input
                    value={invoice.invoice_number}
                    onChange={(e) =>
                      setInvoice({ ...invoice, invoice_number: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>ATCUD</Label>
                  <Input
                    value={invoice.atcud}
                    onChange={(e) => setInvoice({ ...invoice, atcud: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Data Emissão</Label>
                  <Input
                    type="date"
                    value={invoice.issue_date}
                    onChange={(e) =>
                      setInvoice({ ...invoice, issue_date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Data Vencimento</Label>
                  <Input
                    type="date"
                    value={invoice.due_date}
                    onChange={(e) =>
                      setInvoice({ ...invoice, due_date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Método pagamento</Label>
                  <Input
                    value={invoice.payment_method}
                    onChange={(e) =>
                      setInvoice({ ...invoice, payment_method: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Total Líquido</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={invoice.net_total ?? ""}
                    onChange={(e) =>
                      setInvoice({
                        ...invoice,
                        net_total: e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label>IVA</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={invoice.vat_total ?? ""}
                    onChange={(e) =>
                      setInvoice({
                        ...invoice,
                        vat_total: e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Total</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={invoice.total_amount ?? ""}
                    onChange={(e) =>
                      setInvoice({
                        ...invoice,
                        total_amount:
                          e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              {totalsWarning && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {totalsWarning}
                </p>
              )}
              <div>
                <Label>Notas</Label>
                <Textarea
                  rows={2}
                  value={invoice.notes}
                  onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
                />
              </div>
            </section>

            {/* Items */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">
                  Equipamentos detetados ({items.length})
                </h3>
                <Button size="sm" variant="outline" onClick={addItem}>
                  <Plus className="mr-1 h-4 w-4" /> Adicionar linha
                </Button>
              </div>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Nome</TableHead>
                      <TableHead>Marca</TableHead>
                      <TableHead>Modelo</TableHead>
                      <TableHead>Nº Série</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Qtd</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Garantia (anos)</TableHead>
                      <TableHead>Início</TableHead>
                      <TableHead>Fim</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead title="Criar item de inventário">Inv.</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={13} className="text-center text-muted-foreground py-6">
                          Nenhum equipamento detetado. Clique em "Adicionar linha" para criar manualmente.
                        </TableCell>
                      </TableRow>
                    )}
                    {items.map((it, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <Input
                            value={it.name}
                            onChange={(e) => updateItem(idx, { name: e.target.value })}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={it.brand}
                            onChange={(e) => updateItem(idx, { brand: e.target.value })}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={it.model}
                            onChange={(e) => updateItem(idx, { model: e.target.value })}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={it.serial_number}
                            onChange={(e) =>
                              updateItem(idx, { serial_number: e.target.value })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={it.sku}
                            onChange={(e) => updateItem(idx, { sku: e.target.value })}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            className="w-16"
                            value={it.quantity}
                            onChange={(e) =>
                              updateItem(idx, { quantity: Number(e.target.value) || 1 })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            className="w-24"
                            value={it.unit_price ?? ""}
                            onChange={(e) =>
                              updateItem(idx, {
                                unit_price:
                                  e.target.value === "" ? null : Number(e.target.value),
                              })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.5"
                            className="w-20"
                            value={it.warranty_years ?? ""}
                            onChange={(e) =>
                              updateItem(idx, {
                                warranty_years:
                                  e.target.value === "" ? null : Number(e.target.value),
                              })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="date"
                            value={it.warranty_start}
                            onChange={(e) =>
                              updateItem(idx, { warranty_start: e.target.value })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="date"
                            value={it.warranty_end}
                            onChange={(e) =>
                              updateItem(idx, { warranty_end: e.target.value })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={it.category || "geral"}
                            onValueChange={(v) => updateItem(idx, { category: v })}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="geral">geral</SelectItem>
                              {categories.map((c) => (
                                <SelectItem key={c.id} value={c.name}>
                                  {c.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            checked={it.create_inventory}
                            onCheckedChange={(c) =>
                              updateItem(idx, { create_inventory: !!c })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(idx)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>
          </div>
        )}

        <DialogFooter className="mt-4">
          {step === "preview" && (
            <>
              <Button variant="outline" onClick={() => setStep("upload")} disabled={saving}>
                Voltar
              </Button>
              <Button onClick={handleSave} disabled={saving || duplicate}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                Confirmar Importação
              </Button>
            </>
          )}
          {step === "upload" && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceImportDialog;
