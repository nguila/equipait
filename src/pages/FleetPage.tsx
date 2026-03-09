import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatusBadge from "@/components/shared/StatusBadge";
import { AlertTriangle, Truck, Calendar, Gauge, Loader2, Trash2 } from "lucide-react";
import VehicleFormDialog from "@/components/fleet/VehicleFormDialog";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/hooks/useUserRole";

interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  type: string;
  year: number;
  mileage: number;
  status: string;
  location: string | null;
  department_id: string | null;
  next_maintenance: string | null;
  insurance_expiry: string | null;
}

interface Department {
  id: string;
  name: string;
}

const FleetPage = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const { user } = useAuth();
  const { isCollaborator } = useUserRole();

  const fetchData = async () => {
    const [{ data: v }, { data: d }] = await Promise.all([
      supabase.from("vehicles").select("*").order("created_at", { ascending: false }),
      supabase.from("departments").select("id, name"),
    ]);
    if (v) setVehicles(v as Vehicle[]);
    if (d) setDepartments(d);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = async (form: any) => {
    if (!user) return;
    const { data, error } = await supabase.from("vehicles").insert({
      plate: form.plate,
      brand: form.brand,
      model: form.model,
      type: form.type,
      year: form.year,
      mileage: form.mileage || 0,
      status: form.status || "operacional",
      location: form.location || null,
      department_id: form.department_id || null,
      next_maintenance: form.next_maintenance || null,
      insurance_expiry: form.insurance_expiry || null,
      created_by: user.id,
    }).select().single();
    if (error) { toast.error("Erro ao criar veículo: " + error.message); return; }
    if (data) { setVehicles([data as Vehicle, ...vehicles]); toast.success("Veículo adicionado"); }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("vehicles").delete().eq("id", id);
    if (error) { toast.error("Erro ao eliminar: " + error.message); return; }
    setVehicles(vehicles.filter(v => v.id !== id));
    toast.success("Veículo eliminado");
  };

  const filtered = vehicles.filter((v) => {
    if (statusFilter !== "all" && v.status !== statusFilter) return false;
    if (typeFilter !== "all" && v.type !== typeFilter) return false;
    return true;
  });

  const typeLabels: Record<string, string> = {
    ligeiro: "Ligeiro", pesado: "Pesado", comercial: "Comercial", outro: "Outro",
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Frota</h1>
          <p className="text-sm text-muted-foreground">Gestão de veículos e manutenções</p>
        </div>
        {!isCollaborator && <VehicleFormDialog departments={departments} onAdd={handleAdd} />}
      </div>

      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 h-9 text-sm"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os estados</SelectItem>
            <SelectItem value="operacional">Operacional</SelectItem>
            <SelectItem value="em_manutencao">Em Manutenção</SelectItem>
            <SelectItem value="inativo">Inativo</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40 h-9 text-sm"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="ligeiro">Ligeiro</SelectItem>
            <SelectItem value="pesado">Pesado</SelectItem>
            <SelectItem value="comercial">Comercial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((vehicle) => {
          const dept = departments.find((d) => d.id === vehicle.department_id);
          const insuranceSoon = vehicle.insurance_expiry && new Date(vehicle.insurance_expiry) < new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
          const maintenanceSoon = vehicle.next_maintenance && new Date(vehicle.next_maintenance) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

          return (
            <div key={vehicle.id} className="rounded-xl border border-border bg-card p-5 hover-lift">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-bold text-card-foreground">{vehicle.brand} {vehicle.model}</p>
                    <p className="text-xs font-mono text-muted-foreground">{vehicle.plate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={vehicle.status} />
                  {!isCollaborator && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(vehicle.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo</span>
                  <span className="text-card-foreground">{typeLabels[vehicle.type] || vehicle.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ano</span>
                  <span className="text-card-foreground">{vehicle.year}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Quilometragem</span>
                  <span className="flex items-center gap-1 text-card-foreground">
                    <Gauge className="h-3.5 w-3.5" />
                    {vehicle.mileage.toLocaleString("pt-PT")} km
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Localização</span>
                  <span className="text-card-foreground">{vehicle.location || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Departamento</span>
                  <span className="text-card-foreground">{dept?.name || "—"}</span>
                </div>
              </div>

              {(insuranceSoon || maintenanceSoon) && (
                <div className="mt-3 space-y-1.5 border-t border-border pt-3">
                  {maintenanceSoon && (
                    <div className="flex items-center gap-2 text-xs text-warning">
                      <Calendar className="h-3.5 w-3.5" />
                      Manutenção: {new Date(vehicle.next_maintenance!).toLocaleDateString("pt-PT")}
                    </div>
                  )}
                  {insuranceSoon && (
                    <div className="flex items-center gap-2 text-xs text-destructive">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Seguro expira: {new Date(vehicle.insurance_expiry!).toLocaleDateString("pt-PT")}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="col-span-full text-center text-sm text-muted-foreground py-12">Nenhum veículo encontrado</p>
        )}
      </div>
    </div>
  );
};

export default FleetPage;
