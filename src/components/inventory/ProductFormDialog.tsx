import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit2 } from "lucide-react";
import { warehouses, warehouseLocations, type InventoryItem } from "@/data/mockData";
import { toast } from "sonner";

interface Props {
  onAdd?: (item: InventoryItem) => void;
  onEdit?: (item: InventoryItem) => void;
  editItem?: InventoryItem | null;
  categories?: string[];
  departments?: { id: string; name: string }[];
}

const ProductFormDialog = ({ onAdd, onEdit, editItem, categories: propCategories, departments: propDepartments }: Props) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: editItem?.name || "",
    code: editItem?.code || "",
    serialNumber: editItem?.serialNumber || "",
    category: editItem?.category || "",
    warehouseId: editItem?.warehouseId || "",
    locationId: editItem?.locationId || "",
    departmentId: editItem?.departmentId || "",
    userName: editItem?.userName || "",
  });

  const categories = propCategories || ["Equipamento Informático", "Software", "Infraestrutura", "Equipamento Industrial", "Audiovisual", "Material de Escritório", "Outro"];
  const depts = propDepartments || [];
  const filteredLocations = warehouseLocations.filter(l => l.warehouseId === form.warehouseId);

  const handleSubmit = () => {
    if (!form.name || !form.category || !form.warehouseId || !form.departmentId) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    const wh = warehouses.find(w => w.id === form.warehouseId);
    const loc = warehouseLocations.find(l => l.id === form.locationId);
    const newItem: InventoryItem = {
      id: editItem?.id || `i${Date.now()}`,
      code: form.code || "AUTO",
      name: form.name,
      category: form.category,
      location: loc?.name || wh?.name || "",
      warehouseId: form.warehouseId,
      locationId: form.locationId,
      departmentId: form.departmentId,
      userId: editItem?.userId || "",
      userName: form.userName,
      status: editItem?.status || "ativo",
    };
    if (editItem && onEdit) {
      onEdit(newItem);
      toast.success("Produto atualizado com sucesso.");
    } else if (onAdd) {
      onAdd(newItem);
      toast.success("Produto adicionado com sucesso.");
    }
    setOpen(false);
    setForm({ name: "", code: "", category: "", warehouseId: "", locationId: "", departmentId: "", userName: "" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {editItem ? (
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none h-8 w-8 hover:bg-muted">
            <Edit2 className="h-4 w-4" />
          </button>
        ) : (
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> Adicionar Produto
          </Button>
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
          <div className="space-y-1.5">
            <Label>Categoria *</Label>
            <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
              <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
              <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Departamento *</Label>
            <Select value={form.departmentId} onValueChange={v => setForm(f => ({ ...f, departmentId: v }))}>
              <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
              <SelectContent>{depts.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Armazém *</Label>
            <Select value={form.warehouseId} onValueChange={v => setForm(f => ({ ...f, warehouseId: v, locationId: "" }))}>
              <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
              <SelectContent>{warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Localização</Label>
            <Select value={form.locationId} onValueChange={v => setForm(f => ({ ...f, locationId: v }))} disabled={!form.warehouseId}>
              <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
              <SelectContent>{filteredLocations.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>Utilizador</Label>
            <Input value={form.userName} onChange={e => setForm(f => ({ ...f, userName: e.target.value }))} placeholder="Nome do utilizador responsável" />
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
