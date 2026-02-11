import { useState } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
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
    nextMaintenance: undefined as Date | undefined,
    insuranceExpiry: undefined as Date | undefined,
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
      nextMaintenance: form.nextMaintenance ? format(form.nextMaintenance, "yyyy-MM-dd") : undefined,
      insuranceExpiry: form.insuranceExpiry ? format(form.insuranceExpiry, "yyyy-MM-dd") : undefined,
    };

    onAdd(newVehicle);
    setForm({ plate: "", brand: "", model: "", type: "", year: "", mileage: "", status: "operacional", location: "", departmentId: "", nextMaintenance: undefined, insuranceExpiry: undefined });
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
              <Label>Próxima Manutenção</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !form.nextMaintenance && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.nextMaintenance ? format(form.nextMaintenance, "dd MMM yyyy") : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={form.nextMaintenance} onSelect={(date) => setForm({ ...form, nextMaintenance: date })} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <Label>Expiração Seguro</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !form.insuranceExpiry && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.insuranceExpiry ? format(form.insuranceExpiry, "dd MMM yyyy") : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={form.insuranceExpiry} onSelect={(date) => setForm({ ...form, insuranceExpiry: date })} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
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
