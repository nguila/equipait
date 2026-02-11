import { useState } from "react";
import { warehouses as initialWarehouses, warehouseLocations as initialLocations, type Warehouse, type WarehouseLocation } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, MapPin, Warehouse as WarehouseIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const WarehouseManager = () => {
  const [whList, setWhList] = useState<Warehouse[]>(initialWarehouses);
  const [locList, setLocList] = useState<WarehouseLocation[]>(initialLocations);
  const [openWh, setOpenWh] = useState(false);
  const [openLoc, setOpenLoc] = useState(false);
  const [whForm, setWhForm] = useState({ name: "", code: "", address: "" });
  const [locForm, setLocForm] = useState({ warehouseId: "", name: "", zone: "", capacity: "" });

  const addWarehouse = () => {
    if (!whForm.name || !whForm.code) { toast.error("Preencha nome e código."); return; }
    setWhList(prev => [...prev, { id: `w${Date.now()}`, ...whForm, locations: [] }]);
    setOpenWh(false);
    setWhForm({ name: "", code: "", address: "" });
    toast.success("Armazém criado.");
  };

  const addLocation = () => {
    if (!locForm.warehouseId || !locForm.name) { toast.error("Preencha os campos obrigatórios."); return; }
    setLocList(prev => [...prev, { id: `wl${Date.now()}`, warehouseId: locForm.warehouseId, name: locForm.name, zone: locForm.zone, capacity: Number(locForm.capacity) || 0, currentOccupancy: 0 }]);
    setOpenLoc(false);
    setLocForm({ warehouseId: "", name: "", zone: "", capacity: "" });
    toast.success("Localização criada.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Dialog open={openWh} onOpenChange={setOpenWh}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" />Novo Armazém</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo Armazém</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1.5"><Label>Nome *</Label><Input value={whForm.name} onChange={e => setWhForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Código *</Label><Input value={whForm.code} onChange={e => setWhForm(f => ({ ...f, code: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Endereço</Label><Input value={whForm.address} onChange={e => setWhForm(f => ({ ...f, address: e.target.value }))} /></div>
            </div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpenWh(false)}>Cancelar</Button><Button onClick={addWarehouse}>Guardar</Button></div>
          </DialogContent>
        </Dialog>
        <Dialog open={openLoc} onOpenChange={setOpenLoc}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1.5"><MapPin className="h-4 w-4" />Nova Localização</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova Localização</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <Label>Armazém *</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={locForm.warehouseId} onChange={e => setLocForm(f => ({ ...f, warehouseId: e.target.value }))}>
                  <option value="">Selecionar...</option>
                  {whList.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5"><Label>Nome *</Label><Input value={locForm.name} onChange={e => setLocForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Corredor C - Prateleira 3" /></div>
              <div className="space-y-1.5"><Label>Zona</Label><Input value={locForm.zone} onChange={e => setLocForm(f => ({ ...f, zone: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Capacidade</Label><Input type="number" value={locForm.capacity} onChange={e => setLocForm(f => ({ ...f, capacity: e.target.value }))} /></div>
            </div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpenLoc(false)}>Cancelar</Button><Button onClick={addLocation}>Guardar</Button></div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {whList.map(wh => {
          const locs = locList.filter(l => l.warehouseId === wh.id);
          return (
            <div key={wh.id} className="rounded-xl border border-border bg-card p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <WarehouseIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground">{wh.name}</h3>
                  <p className="text-xs text-muted-foreground">{wh.code} · {wh.address}</p>
                </div>
              </div>
              <div className="space-y-2">
                {locs.length === 0 && <p className="text-xs text-muted-foreground italic">Sem localizações definidas</p>}
                {locs.map(loc => {
                  const pct = loc.capacity > 0 ? Math.round((loc.currentOccupancy / loc.capacity) * 100) : 0;
                  return (
                    <div key={loc.id} className="rounded-lg bg-muted/50 p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-card-foreground">{loc.name}</span>
                        <span className="text-xs text-muted-foreground">{loc.zone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={pct} className="h-1.5 flex-1" />
                        <span className="text-xs text-muted-foreground">{pct}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{loc.currentOccupancy}/{loc.capacity} ocupados</p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WarehouseManager;
