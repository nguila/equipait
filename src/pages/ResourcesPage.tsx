import { resources, departments, tasks, projects } from "@/data/mockData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";

const ResourcesPage = () => {
  const [deptFilter, setDeptFilter] = useState<string>("all");

  const filtered = resources.filter((r) => {
    if (deptFilter !== "all" && r.departmentId !== deptFilter) return false;
    return true;
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Recursos</h1>
        <p className="text-sm text-muted-foreground">Gestão de pessoas e carga de trabalho</p>
      </div>

      <div className="flex items-center gap-3">
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-52 h-9 text-sm">
            <SelectValue placeholder="Departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os departamentos</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recurso</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Função</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Departamento</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Competências</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Alocação</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Projetos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((resource) => {
              const dept = departments.find((d) => d.id === resource.departmentId);
              const isOverloaded = resource.currentAllocation > 100;
              const isHigh = resource.currentAllocation > 80;
              const resourceTasks = tasks.filter((t) => t.assigneeId === resource.id && t.status !== "concluida" && t.status !== "cancelada");
              const resourceProjects = [...new Set(resourceTasks.map((t) => t.projectId))];

              return (
                <tr key={resource.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {resource.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-card-foreground">{resource.name}</p>
                        <p className="text-xs text-muted-foreground">{resource.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground">{resource.role}</td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground">{dept?.name}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {resource.skills.map((s) => (
                        <span key={s} className="inline-flex items-center rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isOverloaded ? "bg-destructive" : isHigh ? "bg-warning" : "bg-success"
                          }`}
                          style={{ width: `${Math.min(resource.currentAllocation, 100)}%` }}
                        />
                      </div>
                      <span className={`text-xs font-semibold ${isOverloaded ? "text-destructive" : isHigh ? "text-warning" : "text-success"}`}>
                        {resource.currentAllocation}%
                      </span>
                      {isOverloaded && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-col gap-0.5">
                      {resourceProjects.map((pId) => {
                        const proj = projects.find((p) => p.id === pId);
                        return proj ? (
                          <span key={pId} className="text-xs text-muted-foreground">{proj.name}</span>
                        ) : null;
                      })}
                      {resourceProjects.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResourcesPage;
