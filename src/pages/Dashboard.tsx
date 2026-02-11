import {
  FolderKanban,
  Users,
  AlertTriangle,
  TrendingUp,
  Package,
  Truck,
  Clock,
  CheckCircle2,
} from "lucide-react";
import StatCard from "@/components/shared/StatCard";
import StatusBadge from "@/components/shared/StatusBadge";
import { projects, resources, tasks, vehicles, inventoryItems, departments } from "@/data/mockData";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const activeProjects = projects.filter((p) => p.status === "ativo");
  const overloadedResources = resources.filter((r) => r.currentAllocation > 100);
  const overdueTasks = tasks.filter(
    (t) => t.status !== "concluida" && t.status !== "cancelada" && new Date(t.endDate) < new Date()
  );
  const vehiclesInMaintenance = vehicles.filter((v) => v.status === "em_manutencao");

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Visão geral da organização — {new Date().toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Projetos Ativos"
          value={activeProjects.length}
          subtitle={`${projects.length} total`}
          icon={FolderKanban}
          trend={{ value: "+2 este mês", positive: true }}
        />
        <StatCard
          title="Recursos em Sobrecarga"
          value={overloadedResources.length}
          subtitle={`de ${resources.length} recursos`}
          icon={AlertTriangle}
          trend={overloadedResources.length > 0 ? { value: "Atenção necessária", positive: false } : undefined}
        />
        <StatCard
          title="Tarefas em Atraso"
          value={overdueTasks.length}
          subtitle={`${tasks.length} total`}
          icon={Clock}
        />
        <StatCard
          title="Frota Operacional"
          value={`${vehicles.filter((v) => v.status === "operacional").length}/${vehicles.length}`}
          subtitle={`${vehiclesInMaintenance.length} em manutenção`}
          icon={Truck}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Active Projects */}
        <div className="col-span-2 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <h2 className="text-sm font-semibold text-card-foreground">Projetos Ativos</h2>
            <Link to="/projetos" className="text-xs font-medium text-primary hover:underline">
              Ver todos →
            </Link>
          </div>
          <div className="divide-y divide-border">
            {activeProjects.map((project) => {
              const dept = departments.find((d) => d.id === project.departmentId);
              return (
                <div key={project.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-card-foreground truncate">{project.name}</p>
                      <StatusBadge status={project.priority} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {dept?.name} · {project.code} · {project.teamSize} membros
                    </p>
                  </div>
                  <div className="w-32 shrink-0">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-medium text-card-foreground">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-1.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resource Load */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <h2 className="text-sm font-semibold text-card-foreground">Carga de Recursos</h2>
            <Link to="/recursos" className="text-xs font-medium text-primary hover:underline">
              Ver todos →
            </Link>
          </div>
          <div className="divide-y divide-border">
            {resources.slice(0, 6).map((resource) => {
              const isOverloaded = resource.currentAllocation > 100;
              const isHigh = resource.currentAllocation > 80;
              return (
                <div key={resource.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/50 transition-colors">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary shrink-0">
                    {resource.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-card-foreground truncate">{resource.name}</p>
                    <p className="text-xs text-muted-foreground">{resource.role}</p>
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      isOverloaded ? "text-destructive" : isHigh ? "text-warning" : "text-success"
                    }`}
                  >
                    {resource.currentAllocation}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-5 py-3.5">
            <h2 className="text-sm font-semibold text-card-foreground">⚠️ Alertas</h2>
          </div>
          <div className="divide-y divide-border">
            {overloadedResources.map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-5 py-3">
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                <p className="text-sm text-card-foreground">
                  <span className="font-medium">{r.name}</span> está a {r.currentAllocation}% de alocação
                </p>
              </div>
            ))}
            {vehicles.filter((v) => v.insuranceExpiry && new Date(v.insuranceExpiry) < new Date("2026-05-01")).map((v) => (
              <div key={v.id} className="flex items-center gap-3 px-5 py-3">
                <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
                <p className="text-sm text-card-foreground">
                  Seguro do veículo <span className="font-medium">{v.plate}</span> expira a{" "}
                  {new Date(v.insuranceExpiry!).toLocaleDateString("pt-PT")}
                </p>
              </div>
            ))}
            {inventoryItems.filter((i) => i.availableQty <= 3).map((i) => (
              <div key={i.id} className="flex items-center gap-3 px-5 py-3">
                <Package className="h-4 w-4 text-warning shrink-0" />
                <p className="text-sm text-card-foreground">
                  <span className="font-medium">{i.name}</span> — apenas {i.availableQty} disponível(is)
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-5 py-3.5">
            <h2 className="text-sm font-semibold text-card-foreground">📊 Projetos por Departamento</h2>
          </div>
          <div className="divide-y divide-border">
            {departments.map((dept) => {
              const deptProjects = projects.filter((p) => p.departmentId === dept.id);
              const active = deptProjects.filter((p) => p.status === "ativo").length;
              return (
                <div key={dept.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{dept.name}</p>
                    <p className="text-xs text-muted-foreground">{dept.code}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-card-foreground">{deptProjects.length}</p>
                    <p className="text-xs text-muted-foreground">{active} ativo(s)</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
