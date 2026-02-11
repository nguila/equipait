import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { departments, type Vehicle } from "@/data/mockData";

interface VehicleFormDialogProps {
  onAdd: (vehicle: Vehicle) => void;
}

const VehicleFormDialog = ({ onAdd }: VehicleFormDialogProps) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    plate: "",
    brand: "",
    model: "",
    type: "" as Vehicle["type"] | "",
    year: "",
    mileage: "",
    status: "operacional" as Vehicle["status"],
    location: "",
    departmentId: "",
    nextMaintenance: "",
    insuranceExpiry: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.plate || !form.brand || !form.model || !form.type || !form.year || !form.departmentId) return;

    const newVehicle: Vehicle = {
      id: `v${Date.now()}`,
      plate: form.plate.trim().toUpperCase(),
      brand: form.brand.trim(),
      model: form.model.trim(),
      type: form.type as Vehicle["type"],
      year: Number(form.year),
      mileage: Number(form.mileage) || 0,
      status: form.status,
      location: form.location.trim() || "Sede",
      departmentId: form.departmentId,
      nextMaintenance: form.nextMaintenance || undefined,
      insuranceExpiry: form.insuranceExpiry || undefined,
    };

    onAdd(newVehicle);
    setForm({ plate: "", brand: "", model: "", type: "", year: "", mileage: "", status: "operacional", location: "", departmentId: "", nextMaintenance: "", insuranceExpiry: "" });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" /> Novo Veículo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo Veículo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="v-plate">Matrícula *</Label>
              <Input id="v-plate" value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value })} placeholder="AA-00-BB" maxLength={10} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="v-brand">Marca *</Label>
              <Input id="v-brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} maxLength={50} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="v-model">Modelo *</Label>
              <Input id="v-model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} maxLength={50} required />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Tipo *</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as Vehicle["type"] })}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ligeiro">Ligeiro</SelectItem>
                  <SelectItem value="pesado">Pesado</SelectItem>
                  <SelectItem value="comercial">Comercial</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="v-year">Ano *</Label>
              <Input id="v-year" type="number" min={2000} max={2030} value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="v-mileage">Km</Label>
              <Input id="v-mileage" type="number" min={0} value={form.mileage} onChange={(e) => setForm({ ...form, mileage: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="v-location">Localização</Label>
              <Input id="v-location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Sede" maxLength={50} />
            </div>
            <div className="space-y-1.5">
              <Label>Departamento *</Label>
              <Select value={form.departmentId} onValueChange={(v) => setForm({ ...form, departmentId: v })}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="v-maint">Próxima Manutenção</Label>
              <Input id="v-maint" type="date" value={form.nextMaintenance} onChange={(e) => setForm({ ...form, nextMaintenance: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="v-insur">Expiração Seguro</Label>
              <Input id="v-insur" type="date" value={form.insuranceExpiry} onChange={(e) => setForm({ ...form, insuranceExpiry: e.target.value })} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit">Adicionar Veículo</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleFormDialog;
