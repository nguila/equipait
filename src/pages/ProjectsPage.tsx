import { useState } from "react";
import { projects, departments, tasks, resources } from "@/data/mockData";
import StatusBadge from "@/components/shared/StatusBadge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FolderKanban, List, LayoutGrid, ChevronRight } from "lucide-react";

type ViewMode = "list" | "kanban";

const ProjectsPage = () => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const filtered = projects.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (deptFilter !== "all" && p.departmentId !== deptFilter) return false;
    return true;
  });

  const selectedProjectData = selectedProject ? projects.find((p) => p.id === selectedProject) : null;
  const projectTasks = selectedProject ? tasks.filter((t) => t.projectId === selectedProject) : [];

  const kanbanColumns = [
    { key: "por_iniciar", label: "Por Iniciar" },
    { key: "em_execucao", label: "Em Execução" },
    { key: "em_revisao", label: "Em Revisão" },
    { key: "concluida", label: "Concluída" },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projetos</h1>
          <p className="text-sm text-muted-foreground">Portefólio de projetos da organização</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 h-9 text-sm">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os estados</SelectItem>
            <SelectItem value="planeado">Planeado</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="em_pausa">Em Pausa</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
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
        <div className="ml-auto flex items-center gap-1 rounded-lg border border-border bg-card p-0.5">
          <button
            onClick={() => { setViewMode("list"); setSelectedProject(null); }}
            className={`rounded-md p-1.5 ${viewMode === "list" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => { setViewMode("kanban"); setSelectedProject(null); }}
            className={`rounded-md p-1.5 ${viewMode === "kanban" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {viewMode === "list" && !selectedProject && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Projeto</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Departamento</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Categoria</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estado</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Prioridade</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Progresso</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Equipa</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((project) => {
                const dept = departments.find((d) => d.id === project.departmentId);
                return (
                  <tr
                    key={project.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setSelectedProject(project.id)}
                  >
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-card-foreground">{project.name}</p>
                      <p className="text-xs text-muted-foreground">{project.code}</p>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{dept?.name}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={project.category} /></td>
                    <td className="px-5 py-3.5"><StatusBadge status={project.status} /></td>
                    <td className="px-5 py-3.5"><StatusBadge status={project.priority} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Progress value={project.progress} className="h-1.5 w-20" />
                        <span className="text-xs font-medium text-muted-foreground">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{project.teamSize}</td>
                    <td className="px-3 py-3.5">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {viewMode === "list" && selectedProject && selectedProjectData && (
        <div className="space-y-4">
          <button
            onClick={() => setSelectedProject(null)}
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            ← Voltar à lista
          </button>
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-card-foreground">{selectedProjectData.name}</h2>
                <p className="text-sm text-muted-foreground mt-1">{selectedProjectData.description}</p>
              </div>
              <div className="flex gap-2">
                <StatusBadge status={selectedProjectData.status} />
                <StatusBadge status={selectedProjectData.priority} />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div><span className="text-muted-foreground">Código:</span> <span className="font-medium">{selectedProjectData.code}</span></div>
              <div><span className="text-muted-foreground">Início:</span> <span className="font-medium">{new Date(selectedProjectData.startDate).toLocaleDateString("pt-PT")}</span></div>
              <div><span className="text-muted-foreground">Fim:</span> <span className="font-medium">{new Date(selectedProjectData.endDate).toLocaleDateString("pt-PT")}</span></div>
              <div><span className="text-muted-foreground">Orçamento:</span> <span className="font-medium">{selectedProjectData.budget ? `€${selectedProjectData.budget.toLocaleString("pt-PT")}` : "N/D"}</span></div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">Progresso geral</span>
                <span className="font-medium">{selectedProjectData.progress}%</span>
              </div>
              <Progress value={selectedProjectData.progress} className="h-2" />
            </div>
          </div>

          <h3 className="text-sm font-semibold text-foreground">Tarefas ({projectTasks.length})</h3>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tarefa</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Atribuído</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estado</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Prioridade</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Horas</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Prazo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {projectTasks.map((task) => {
                  const assignee = resources.find((r) => r.id === task.assigneeId);
                  return (
                    <tr key={task.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-medium text-card-foreground">{task.title}</td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">{assignee?.name || "—"}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={task.status} /></td>
                      <td className="px-5 py-3.5"><StatusBadge status={task.priority} /></td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">{task.hoursLogged}/{task.hoursEstimated}h</td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">{new Date(task.endDate).toLocaleDateString("pt-PT")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewMode === "kanban" && (
        <div>
          <div className="mb-3">
            <Select value={selectedProject || ""} onValueChange={(v) => setSelectedProject(v || null)}>
              <SelectTrigger className="w-64 h-9 text-sm">
                <SelectValue placeholder="Selecione um projeto" />
              </SelectTrigger>
              <SelectContent>
                {filtered.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedProject ? (
            <div className="grid grid-cols-4 gap-4">
              {kanbanColumns.map((col) => {
                const colTasks = projectTasks.filter((t) => t.status === col.key);
                return (
                  <div key={col.key} className="rounded-xl bg-muted/50 p-3">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{col.label}</h3>
                      <span className="text-xs font-medium text-muted-foreground">{colTasks.length}</span>
                    </div>
                    <div className="space-y-2">
                      {colTasks.map((task) => {
                        const assignee = resources.find((r) => r.id === task.assigneeId);
                        return (
                          <div key={task.id} className="rounded-lg border border-border bg-card p-3 hover-lift cursor-pointer">
                            <p className="text-sm font-medium text-card-foreground">{task.title}</p>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">{assignee?.name}</span>
                              <StatusBadge status={task.priority} />
                            </div>
                          </div>
                        );
                      })}
                      {colTasks.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-4">Sem tarefas</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Selecione um projeto para ver as tarefas em Kanban.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
