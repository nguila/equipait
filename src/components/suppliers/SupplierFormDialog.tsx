import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export interface SupplierFormData {
  id?: string;
  name: string;
  email: string;
  phone: string;
  nif: string;
  address: string;
  category: string;
  status: string;
  notes: string;
  website: string;
  contact_person: string;
}

const CATEGORIES = [
  { value: "geral", label: "Geral" },
  { value: "hardware", label: "Hardware" },
  { value: "software", label: "Software" },
  { value: "redes", label: "Redes & Telecomunicações" },
  { value: "servicos", label: "Serviços" },
  { value: "consumiveis", label: "Consumíveis" },
  { value: "cloud", label: "Cloud & Hosting" },
];

const STATUSES = [
  { value: "ativo", label: "Ativo" },
  { value: "inativo", label: "Inativo" },
  { value: "pendente", label: "Pendente" },
];

const emptyForm: SupplierFormData = {
  name: "",
  email: "",
  phone: "",
  nif: "",
  address: "",
  category: "geral",
  status: "ativo",
  notes: "",
  website: "",
  contact_person: "",
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SupplierFormData) => void;
  initialData?: SupplierFormData | null;
  loading?: boolean;
}

const SupplierFormDialog = ({ open, onOpenChange, onSubmit, initialData, loading }: Props) => {
  const [form, setForm] = useState<SupplierFormData>(emptyForm);
  const isEditing = !!initialData?.id;

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm(emptyForm);
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("O nome do fornecedor é obrigatório.");
      return;
    }
    if (form.name.trim().length > 200) {
      toast.error("O nome não pode exceder 200 caracteres.");
      return;
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error("Email inválido.");
      return;
    }
    onSubmit(form);
  };

  const update = (field: keyof SupplierFormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Fornecedor" : "Novo Fornecedor"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Nome do fornecedor"
                maxLength={200}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_person">Pessoa de Contacto</Label>
              <Input
                id="contact_person"
                value={form.contact_person}
                onChange={(e) => update("contact_person", e.target.value)}
                placeholder="Nome do contacto"
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="email@exemplo.com"
                maxLength={255}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="+351 000 000 000"
                maxLength={20}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nif">NIF</Label>
              <Input
                id="nif"
                value={form.nif}
                onChange={(e) => update("nif", e.target.value)}
                placeholder="Número de identificação fiscal"
                maxLength={20}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={form.website}
                onChange={(e) => update("website", e.target.value)}
                placeholder="https://www.exemplo.com"
                maxLength={255}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={form.category} onValueChange={(v) => update("category", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select value={form.status} onValueChange={(v) => update("status", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Morada</Label>
            <Input
              id="address"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              placeholder="Morada completa"
              maxLength={500}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Observações adicionais..."
              maxLength={1000}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "A guardar..." : isEditing ? "Guardar" : "Criar Fornecedor"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SupplierFormDialog;
