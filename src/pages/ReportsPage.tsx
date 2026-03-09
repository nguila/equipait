import { useMemo, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Loader2 } from "lucide-react";

interface ResourceRow { id: string; name: string; current_allocation: number; skills: string[]; }
interface VehicleRow { id: string; type: string; status: string; }
interface ProjectRow { id: string; title: string; status: string; priority: string; }
interface DeptRow { id: string; name: string; }

const ReportsPage = () => {
  const [resources, setResources] = useState<ResourceRow[]>([]);
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [departments, setDepartments] = useState<DeptRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [{ data: r }, { data: v }, { data: p }, { data: d }] = await Promise.all([
        supabase.from("resources").select("id, name, current_allocation, skills"),
        supabase.from("vehicles").select("id, type, status"),
        supabase.from("projects").select("id, title, status, priority"),
        supabase.from("departments").select("id, name"),
      ]);
      if (r) setResources(r as ResourceRow[]);
      if (v) setVehicles(v as VehicleRow[]);
      if (p) setProjects(p as ProjectRow[]);
      if (d) setDepartments(d);
      setLoading(false);
    };
    fetch();
  }, []);

  const resourceUtilizationData = useMemo(() => {
    return resources
      .sort((a, b) => b.current_allocation - a.current_allocation)
      .slice(0, 8)
      .map((r) => ({
        name: r.name.split(" ")[0],
        allocation: r.current_allocation,
        available: Math.max(0, 100 - r.current_allocation),
      }));
  }, [resources]);

  const projectsByStatus = useMemo(() => {
    const statusMap: Record<string, number> = {};
    projects.forEach(p => { statusMap[p.status] = (statusMap[p.status] || 0) + 1; });
    const labels: Record<string, string> = { planning: "Planeamento", active: "Ativo", on_hold: "Em Pausa", completed: "Concluído", cancelled: "Cancelado" };
    return Object.entries(statusMap).map(([status, count]) => ({ status: labels[status] || status, count }));
  }, [projects]);

  const fleetData = useMemo(() => {
    const grouped: Record<string, { type: string; typeLabel: string; count: number; operational: number; maintenance: number; inactive: number }> = {};
    const typeLabels: Record<string, string> = { ligeiro: "Ligeiro", pesado: "Pesado", comercial: "Comercial", outro: "Outro" };
    vehicles.forEach(v => {
      if (!grouped[v.type]) grouped[v.type] = { type: v.type, typeLabel: typeLabels[v.type] || v.type, count: 0, operational: 0, maintenance: 0, inactive: 0 };
      grouped[v.type].count++;
      if (v.status === "operacional") grouped[v.type].operational++;
      else if (v.status === "em_manutencao") grouped[v.type].maintenance++;
      else grouped[v.type].inactive++;
    });
    return Object.values(grouped);
  }, [vehicles]);

  const skillsData = useMemo(() => {
    const skillCount: Record<string, number> = {};
    resources.forEach((r) => {
      (r.skills || []).forEach((skill) => { skillCount[skill] = (skillCount[skill] || 0) + 1; });
    });
    return Object.entries(skillCount).map(([skill, count]) => ({ skill, count })).sort((a, b) => b.count - a.count);
  }, [resources]);

  const colors = ["hsl(200 80% 50%)", "hsl(152 60% 40%)", "hsl(38 92% 50%)", "hsl(280 60% 55%)", "hsl(0 72% 51%)"];
  const chartColors = { primary: "hsl(200 80% 50%)", success: "hsl(152 60% 40%)", warning: "hsl(38 92% 50%)", destructive: "hsl(0 72% 51%)" };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Relatórios & Análise</h1>
        <p className="text-sm text-muted-foreground">Dashboards e métricas de desempenho organizacional</p>
      </div>

      {/* Resource Utilization */}
      {resourceUtilizationData.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">📊 Utilização de Recursos</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={resourceUtilizationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 90%)" />
              <XAxis dataKey="name" stroke="hsl(215.4 16.3% 46.9%)" />
              <YAxis stroke="hsl(215.4 16.3% 46.9%)" />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.5rem" }} />
              <Legend />
              <Bar dataKey="allocation" fill={chartColors.primary} name="Alocado (%)" />
              <Bar dataKey="available" fill={chartColors.success} name="Disponível (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Projects by Status */}
      {projectsByStatus.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">🏢 Projetos por Estado</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={projectsByStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={100} label={({ status, count }) => `${status} (${count})`}>
                {projectsByStatus.map((_, index) => (<Cell key={`cell-${index}`} fill={colors[index % colors.length]} />))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.5rem" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Fleet Status */}
        {fleetData.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-card-foreground mb-4">🔧 Estado da Frota</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={fleetData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 90%)" />
                <XAxis dataKey="typeLabel" stroke="hsl(215.4 16.3% 46.9%)" />
                <YAxis stroke="hsl(215.4 16.3% 46.9%)" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.5rem" }} />
                <Legend />
                <Bar dataKey="operational" fill={chartColors.success} name="Operacional" />
                <Bar dataKey="maintenance" fill={chartColors.warning} name="Manutenção" />
                <Bar dataKey="inactive" fill={chartColors.destructive} name="Inativo" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Skills Distribution */}
        {skillsData.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-card-foreground mb-4">🛠️ Distribuição de Competências</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={skillsData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 90%)" />
                <XAxis type="number" stroke="hsl(215.4 16.3% 46.9%)" />
                <YAxis dataKey="skill" type="category" stroke="hsl(215.4 16.3% 46.9%)" width={90} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.5rem" }} />
                <Bar dataKey="count" fill={chartColors.primary} name="Recursos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Empty state */}
      {resources.length === 0 && vehicles.length === 0 && projects.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-semibold">Sem dados para apresentar</p>
          <p className="text-sm mt-1">Adicione recursos, veículos e projetos para visualizar os relatórios.</p>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
