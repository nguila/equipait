import { useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts";
import { resources, projects, departments, vehicles } from "@/data/mockData";
import { Card } from "@/components/ui/card";

const ReportsPage = () => {
  // 1. Resource Utilization Data
  const resourceUtilizationData = useMemo(() => {
    return resources
      .sort((a, b) => b.currentAllocation - a.currentAllocation)
      .slice(0, 8)
      .map((r) => ({
        name: r.name.split(" ")[0],
        allocation: r.currentAllocation,
        capacity: 100,
        available: Math.max(0, 100 - r.currentAllocation),
      }));
  }, []);

  // 2. Projects by Department
  const projectsByDept = useMemo(() => {
    return departments.map((dept) => {
      const deptProjects = projects.filter((p) => p.departmentId === dept.id);
      return {
        name: dept.code,
        fullName: dept.name,
        total: deptProjects.length,
        active: deptProjects.filter((p) => p.status === "ativo").length,
        planned: deptProjects.filter((p) => p.status === "planeado").length,
        completed: deptProjects.filter((p) => p.status === "concluido").length,
        paused: deptProjects.filter((p) => p.status === "em_pausa").length,
      };
    });
  }, []);

  // 3. Fleet Costs & Status (estimated)
  const fleetCosts = useMemo(() => {
    const costPerType = {
      ligeiro: 25000,
      pesado: 60000,
      comercial: 45000,
      outro: 35000,
    };
    
    const grouped = vehicles.reduce(
      (acc, v) => {
        const type = v.type;
        const existing = acc.find((x) => x.type === type);
        const cost = costPerType[type];
        if (existing) {
          existing.count += 1;
          existing.totalCost += cost;
          existing.operational += v.status === "operacional" ? 1 : 0;
          existing.maintenance += v.status === "em_manutencao" ? 1 : 0;
        } else {
          acc.push({
            type,
            typeLabel: type.charAt(0).toUpperCase() + type.slice(1),
            count: 1,
            totalCost: cost,
            costPerUnit: cost,
            operational: v.status === "operacional" ? 1 : 0,
            maintenance: v.status === "em_manutencao" ? 1 : 0,
            inactive: v.status === "inativo" ? 1 : 0,
          });
        }
        return acc;
      },
      [] as Array<{
        type: string;
        typeLabel: string;
        count: number;
        totalCost: number;
        costPerUnit: number;
        operational: number;
        maintenance: number;
        inactive: number;
      }>
    );
    return grouped;
  }, []);

  // 4. Project Budget & Actual Spend (sample correlation)
  const projectBudgetData = useMemo(() => {
    return projects
      .filter((p) => p.budget)
      .map((p) => ({
        name: p.code,
        budget: p.budget!,
        spent: Math.round(p.budget! * (p.progress / 100) * (0.8 + Math.random() * 0.4)),
        progress: p.progress,
      }));
  }, []);

  // 5. Resource Skills Distribution
  const skillsData = useMemo(() => {
    const skillCount: Record<string, number> = {};
    resources.forEach((r) => {
      r.skills.forEach((skill) => {
        skillCount[skill] = (skillCount[skill] || 0) + 1;
      });
    });
    return Object.entries(skillCount)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count);
  }, []);

  const colors = [
    "hsl(200 80% 50%)",
    "hsl(152 60% 40%)",
    "hsl(38 92% 50%)",
    "hsl(280 60% 55%)",
  ];

  const chartColors = {
    primary: "hsl(200 80% 50%)",
    success: "hsl(152 60% 40%)",
    warning: "hsl(38 92% 50%)",
    destructive: "hsl(0 72% 51%)",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Relatórios & Análise</h1>
        <p className="text-sm text-muted-foreground">
          Dashboards e métricas de desempenho organizacional
        </p>
      </div>

      {/* Resource Utilization */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground mb-4">
          📊 Utilização de Recursos
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={resourceUtilizationData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 90%)" />
            <XAxis dataKey="name" stroke="hsl(215.4 16.3% 46.9%)" />
            <YAxis stroke="hsl(215.4 16.3% 46.9%)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0 0% 100%)",
                border: "1px solid hsl(220 15% 90%)",
                borderRadius: "0.5rem",
              }}
            />
            <Legend />
            <Bar dataKey="allocation" fill={chartColors.primary} name="Alocado (%)" />
            <Bar dataKey="available" fill={chartColors.success} name="Disponível (%)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Projects by Department */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground mb-4">
          🏢 Projetos por Departamento
        </h2>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={projectsByDept}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 90%)" />
            <XAxis dataKey="name" stroke="hsl(215.4 16.3% 46.9%)" />
            <YAxis stroke="hsl(215.4 16.3% 46.9%)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0 0% 100%)",
                border: "1px solid hsl(220 15% 90%)",
                borderRadius: "0.5rem",
              }}
            />
            <Legend />
            <Bar dataKey="active" fill={chartColors.primary} name="Ativos" />
            <Bar dataKey="planned" fill={chartColors.warning} name="Planeados" />
            <Bar dataKey="completed" fill={chartColors.success} name="Concluídos" />
            <Bar dataKey="paused" fill={chartColors.destructive} name="Em Pausa" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Fleet Cost Distribution */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">
            🚗 Custos da Frota por Tipo
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={fleetCosts}
                dataKey="totalCost"
                nameKey="typeLabel"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ typeLabel, count }) => `${typeLabel} (${count})`}
              >
                {fleetCosts.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `€${value.toLocaleString("pt-PT")}`}
                contentStyle={{
                  backgroundColor: "hsl(0 0% 100%)",
                  border: "1px solid hsl(220 15% 90%)",
                  borderRadius: "0.5rem",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Fleet Status */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">
            🔧 Estado da Frota
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={fleetCosts}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 90%)" />
              <XAxis dataKey="typeLabel" stroke="hsl(215.4 16.3% 46.9%)" />
              <YAxis stroke="hsl(215.4 16.3% 46.9%)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(0 0% 100%)",
                  border: "1px solid hsl(220 15% 90%)",
                  borderRadius: "0.5rem",
                }}
              />
              <Legend />
              <Bar dataKey="operational" fill={chartColors.success} name="Operacional" />
              <Bar dataKey="maintenance" fill={chartColors.warning} name="Manutenção" />
              <Bar dataKey="inactive" fill={chartColors.destructive} name="Inativo" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Project Budget vs Actual */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground mb-4">
          💰 Orçamento vs Despesa Real (Projetos)
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={projectBudgetData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 90%)" />
            <XAxis dataKey="name" stroke="hsl(215.4 16.3% 46.9%)" />
            <YAxis stroke="hsl(215.4 16.3% 46.9%)" />
            <Tooltip
              formatter={(value) => `€${value.toLocaleString("pt-PT")}`}
              contentStyle={{
                backgroundColor: "hsl(0 0% 100%)",
                border: "1px solid hsl(220 15% 90%)",
                borderRadius: "0.5rem",
              }}
            />
            <Legend />
            <Bar dataKey="budget" fill={chartColors.primary} name="Orçamento" />
            <Bar dataKey="spent" fill={chartColors.warning} name="Despesa Real" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Skills Distribution */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground mb-4">
          🛠️ Distribuição de Competências
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={skillsData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 90%)" />
            <XAxis type="number" stroke="hsl(215.4 16.3% 46.9%)" />
            <YAxis dataKey="skill" type="category" stroke="hsl(215.4 16.3% 46.9%)" width={90} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0 0% 100%)",
                border: "1px solid hsl(220 15% 90%)",
                borderRadius: "0.5rem",
              }}
            />
            <Bar dataKey="count" fill={chartColors.primary} name="Recursos" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Fleet Cost Summary Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-6 py-3.5 border-b border-border bg-muted/50">
          <h2 className="text-sm font-semibold text-card-foreground">
            Resumo de Custos da Frota
          </h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tipo de Veículo
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Quantidade
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Custo Unitário
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Custo Total
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Operacional
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Manutenção
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {fleetCosts.map((row) => (
              <tr key={row.type} className="hover:bg-muted/50 transition-colors">
                <td className="px-5 py-3.5 text-sm font-medium text-card-foreground">
                  {row.typeLabel}
                </td>
                <td className="px-5 py-3.5 text-sm text-muted-foreground">{row.count}</td>
                <td className="px-5 py-3.5 text-sm text-muted-foreground">
                  €{row.costPerUnit.toLocaleString("pt-PT")}
                </td>
                <td className="px-5 py-3.5 text-sm font-semibold text-card-foreground">
                  €{row.totalCost.toLocaleString("pt-PT")}
                </td>
                <td className="px-5 py-3.5 text-sm text-success font-medium">{row.operational}</td>
                <td className="px-5 py-3.5 text-sm text-warning font-medium">{row.maintenance}</td>
              </tr>
            ))}
            <tr className="border-t-2 border-border font-semibold">
              <td colSpan={2} className="px-5 py-3.5 text-sm text-card-foreground">
                TOTAL
              </td>
              <td className="px-5 py-3.5 text-sm text-muted-foreground">—</td>
              <td className="px-5 py-3.5 text-sm text-card-foreground">
                €{fleetCosts.reduce((sum, r) => sum + r.totalCost, 0).toLocaleString("pt-PT")}
              </td>
              <td colSpan={2} />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsPage;
