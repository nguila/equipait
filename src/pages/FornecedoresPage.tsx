import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";
import {
  Truck,
  Plus,
  Search,
  Pencil,
  Trash2,
  Phone,
  Mail,
  Globe,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import SupplierFormDialog, {
  type SupplierFormData,
} from "@/components/suppliers/SupplierFormDialog";

interface Supplier {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  nif: string | null;
  address: string | null;
  category: string;
  status: string;
  notes: string | null;
  website: string | null;
  contact_person: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  geral: "Geral",
  hardware: "Hardware",
  software: "Software",
  redes: "Redes",
  servicos: "Serviços",
  consumiveis: "Consumíveis",
  cloud: "Cloud",
};

const STATUS_VARIANTS: Record<string, string> = {
  ativo: "bg-success/15 text-success border-success/20",
  inativo: "bg-destructive/15 text-destructive border-destructive/20",
  pendente: "bg-warning/15 text-warning border-warning/20",
};

const FornecedoresPage = () => {
  const { user } = useAuth();
  const { canCreate, canEdit, canDelete } = useUserRole();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierFormData | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("suppliers")
      .select("*")
      .order("name");

    if (error) {
      toast.error("Erro ao carregar fornecedores.");
      console.error(error);
    } else {
      setSuppliers((data as unknown as Supplier[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleSubmit = async (formData: SupplierFormData) => {
    if (!user) return;
    setSaving(true);

    const payload = {
      name: formData.name.trim(),
      email: formData.email?.trim() || null,
      phone: formData.phone?.trim() || null,
      nif: formData.nif?.trim() || null,
      address: formData.address?.trim() || null,
      category: formData.category,
      status: formData.status,
      notes: formData.notes?.trim() || null,
      website: formData.website?.trim() || null,
      contact_person: formData.contact_person?.trim() || null,
    };

    if (formData.id) {
      const { error } = await supabase
        .from("suppliers")
        .update(payload as any)
        .eq("id", formData.id);

      if (error) {
        toast.error("Erro ao atualizar fornecedor.");
        console.error(error);
      } else {
        toast.success("Fornecedor atualizado com sucesso.");
        setFormOpen(false);
        setEditingSupplier(null);
        fetchSuppliers();
      }
    } else {
      const { error } = await supabase
        .from("suppliers")
        .insert({ ...payload, created_by: user.id } as any);

      if (error) {
        toast.error("Erro ao criar fornecedor.");
        console.error(error);
      } else {
        toast.success("Fornecedor criado com sucesso.");
        setFormOpen(false);
        fetchSuppliers();
      }
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase
      .from("suppliers")
      .delete()
      .eq("id", deleteId);

    if (error) {
      toast.error("Erro ao eliminar fornecedor.");
      console.error(error);
    } else {
      toast.success("Fornecedor eliminado.");
      fetchSuppliers();
    }
    setDeleteId(null);
  };

  const openEdit = (s: Supplier) => {
    setEditingSupplier({
      id: s.id,
      name: s.name,
      email: s.email || "",
      phone: s.phone || "",
      nif: s.nif || "",
      address: s.address || "",
      category: s.category,
      status: s.status,
      notes: s.notes || "",
      website: s.website || "",
      contact_person: s.contact_person || "",
    });
    setFormOpen(true);
  };

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.nif?.toLowerCase().includes(search.toLowerCase()) ||
      s.contact_person?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Truck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Fornecedores</h1>
            <p className="text-sm text-muted-foreground">
              {suppliers.length} fornecedor{suppliers.length !== 1 ? "es" : ""} registado{suppliers.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        {canCreate("/fornecedores") && (
          <Button
            onClick={() => {
              setEditingSupplier(null);
              setFormOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Novo Fornecedor
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar por nome, email, NIF..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          maxLength={100}
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Nome</TableHead>
              <TableHead className="hidden md:table-cell">Contacto</TableHead>
              <TableHead className="hidden lg:table-cell">NIF</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  A carregar...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  {search ? "Nenhum resultado encontrado." : "Nenhum fornecedor registado."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((s) => (
                <TableRow key={s.id} className="group">
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="font-medium text-foreground">{s.name}</p>
                      {s.contact_person && (
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          {s.contact_person}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="space-y-0.5 text-sm">
                      {s.email && (
                        <p className="flex items-center gap-1 text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {s.email}
                        </p>
                      )}
                      {s.phone && (
                        <p className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {s.phone}
                        </p>
                      )}
                      {s.website && (
                        <p className="flex items-center gap-1 text-muted-foreground">
                          <Globe className="h-3 w-3" />
                          {s.website}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell font-mono text-sm text-muted-foreground">
                    {s.nif || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {CATEGORY_LABELS[s.category] || s.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${
                        STATUS_VARIANTS[s.status] || "bg-muted text-muted-foreground"
                      }`}
                    >
                      {s.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {canEdit("/fornecedores") && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(s)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {canDelete("/fornecedores") && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(s.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Form Dialog */}
      <SupplierFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingSupplier(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingSupplier}
        loading={saving}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Fornecedor</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que deseja eliminar este fornecedor? Esta ação não pode ser revertida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FornecedoresPage;
