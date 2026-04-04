import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit2 } from "lucide-react";
import { toast } from "sonner";

interface InventoryItem {
  id?: string;
  code?: string;
  name: string;
  serialNumber?: string;
  category: string;
  location?: string;
  warehouseId?: string;
  locationId?: string;
  departmentId?: string;
  userName?: string;
  status?: string;
}

interface Props {
  onAdd?: (item: InventoryItem) => void;
  onEdit?: (item: InventoryItem) => void;
  editItem?: InventoryItem;
  categories?: string[];
  departments?: { id: string; name: string }[];
  warehouses?: { id: string; name: string }[];
  locations?: { id: string; name: string; warehouseId?: string }[];
}

const emptyForm = { name: "", code: "", serialNumber: "", category: "", warehouseId: "", locationId: "", departmentId: "", userName: "", status: "ativo" };

const ProductFormDialog = ({ onAdd, onEdit, editItem, categories: propCategories, departments: propDepartments, warehouses: propWarehouses, locations: propLocations }: Props) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const categories = propCategories || ["Equipamento Informático", "Software", "Infraestrutura", "Equipamento Industrial", "Audiovisual", "Material de Escritório", "Outro"];
  const depts = propDepartments || [];
  const locs = propLocations || [];

  // Sync form when dialog opens with editItem
  useEffect(() => {
    if (open && editItem) {
      setForm({
        name: editItem.name || "",
        code: editItem.code || "",
        serialNumber: editItem.serialNumber || "",
        category: editItem.category || "",
        warehouseId: editItem.warehouseId || "",
        locationId: editItem.locationId || "",
        departmentId: editItem.departmentId || "",
        userName: editItem.userName || "",
        status: editItem.status || "ativo",
      });
    } else if (open && !editItem) {
      setForm(emptyForm);
    }
  }, [open, editItem]);

  const handleSubmit = () => {
    if (!form.name || !form.category) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    const data: InventoryItem = {
      id: editItem?.id,
      code: form.code || "AUTO",
      name: form.name,
      serialNumber: form.serialNumber || undefined,
      category: form.category,
      location: form.locationId ? (locs.find(l => l.id === form.locationId)?.name || "") : "",
      warehouseId: form.warehouseId || undefined,
      locationId: form.locationId || undefined,
      departmentId: form.departmentId || undefined,
      userName: form.userName || "",
      status: form.status || "ativo",
    };
    if (editItem && onEdit) {
      onEdit(data);
    } else if (onAdd) {
      onAdd(data);
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {editItem ? (
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none h-8 w-8 hover:bg-muted">
            <Edit2 className="h-4 w-4" />
          </button>
        ) : (
          <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Adicionar Produto</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editItem ? "Editar Produto" : "Novo Produto"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-2">
          {editItem && (
            <div className="space-y-1.5">
              <Label>Código</Label>
              <Input value={form.code} disabled className="font-mono bg-muted" />
            </div>
          )}
          <div className={`space-y-1.5 ${editItem ? "" : "col-span-2"}`}>
            <Label>Nome *</Label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nome do produto" />
          </div>
          {!editItem && (
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground italic">O código será atribuído automaticamente (INV-XXX)</p>
            </div>
          )}
          <div className="col-span-2 space-y-1.5">
            <Label>Nº de Série</Label>
            <Input value={form.serialNumber} onChange={e => setForm(f => ({ ...f, serialNumber: e.target.value }))} placeholder="Número de série do produto" />
          </div>
          <div className="space-y-1.5">
            <Label>Categoria *</Label>
            <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
              <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
              <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Departamento</Label>
            <Select value={form.departmentId} onValueChange={v => setForm(f => ({ ...f, departmentId: v }))}>
              <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
              <SelectContent>{depts.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>Utilizador</Label>
            <Input value={form.userName} onChange={e => setForm(f => ({ ...f, userName: e.target.value }))} placeholder="Nome do utilizador responsável" />
          {editItem && (
            <div className="col-span-2 space-y-1.5">
              <Label>Estado</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSubmit}>{editItem ? "Atualizar Produto" : "Guardar Produto"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;
