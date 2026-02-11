import { vehicles, departments } from "@/data/mockData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import StatusBadge from "@/components/shared/StatusBadge";
import { AlertTriangle, Truck, Calendar, Gauge } from "lucide-react";

const FleetPage = () => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filtered = vehicles.filter((v) => {
    if (statusFilter !== "all" && v.status !== statusFilter) return false;
    if (typeFilter !== "all" && v.type !== typeFilter) return false;
    return true;
  });

  const typeLabels: Record<string, string> = {
    ligeiro: "Ligeiro",
    pesado: "Pesado",
    comercial: "Comercial",
    outro: "Outro",
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Frota</h1>
        <p className="text-sm text-muted-foreground">Gestão de veículos e manutenções</p>
      </div>

      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 h-9 text-sm">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os estados</SelectItem>
            <SelectItem value="operacional">Operacional</SelectItem>
            <SelectItem value="em_manutencao">Em Manutenção</SelectItem>
            <SelectItem value="inativo">Inativo</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40 h-9 text-sm">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
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
          const dept = departments.find((d) => d.id === vehicle.departmentId);
          const insuranceSoon = vehicle.insuranceExpiry && new Date(vehicle.insuranceExpiry) < new Date("2026-05-01");
          const maintenanceSoon = vehicle.nextMaintenance && new Date(vehicle.nextMaintenance) < new Date("2026-03-15");

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
                <StatusBadge status={vehicle.status} />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo</span>
                  <span className="text-card-foreground">{typeLabels[vehicle.type]}</span>
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
                  <span className="text-card-foreground">{vehicle.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Departamento</span>
                  <span className="text-card-foreground">{dept?.code}</span>
                </div>
              </div>

              {(insuranceSoon || maintenanceSoon) && (
                <div className="mt-3 space-y-1.5 border-t border-border pt-3">
                  {maintenanceSoon && (
                    <div className="flex items-center gap-2 text-xs text-warning">
                      <Calendar className="h-3.5 w-3.5" />
                      Manutenção: {new Date(vehicle.nextMaintenance!).toLocaleDateString("pt-PT")}
                    </div>
                  )}
                  {insuranceSoon && (
                    <div className="flex items-center gap-2 text-xs text-destructive">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Seguro expira: {new Date(vehicle.insuranceExpiry!).toLocaleDateString("pt-PT")}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FleetPage;
