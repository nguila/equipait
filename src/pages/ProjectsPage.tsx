import { useState } from "react";
import { projects, departments, tasks, resources, type Task } from "@/data/mockData";
import StatusBadge from "@/components/shared/StatusBadge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { List, LayoutGrid, ChevronRight, Clock as ClockIcon, GanttChart } from "lucide-react";
import TaskListView from "@/components/projects/TaskListView";
import TaskKanbanView from "@/components/projects/TaskKanbanView";
import TaskTimelineView from "@/components/projects/TaskTimelineView";

const ProjectsPage = () => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const filtered = projects.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (deptFilter !== "all" && p.departmentId !== deptFilter) return false;
    return true;
  });

  const selectedProjectData = selectedProject ? projects.find((p) => p.id === selectedProject) : null;
  const projectTasks = selectedProject ? tasks.filter((t) => t.projectId === selectedProject) : [];

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Projetos</h1>
        <p className="text-sm text-muted-foreground">Portefólio de projetos da organização</p>
      </div>

      {/* Filters */}
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
      </div>

      {/* Project Selection or Detail */}
      {!selectedProject ? (
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
      ) : selectedProjectData ? (
        <div className="space-y-4">
          <button
            onClick={() => setSelectedProject(null)}
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            ← Voltar à lista de projetos
          </button>

          {/* Project Header Card */}
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

          {/* Task Views with Tabs */}
          <Tabs defaultValue="list" className="space-y-4">
            <TabsList className="bg-muted/60 p-1">
              <TabsTrigger value="list" className="gap-1.5 text-xs">
                <List className="h-4 w-4" /> Lista
              </TabsTrigger>
              <TabsTrigger value="kanban" className="gap-1.5 text-xs">
                <LayoutGrid className="h-4 w-4" /> Kanban
              </TabsTrigger>
              <TabsTrigger value="timeline" className="gap-1.5 text-xs">
                <ClockIcon className="h-4 w-4" /> Timeline
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list">
              <TaskListView project={selectedProjectData} tasks={projectTasks} />
            </TabsContent>

            <TabsContent value="kanban">
              <TaskKanbanView tasks={projectTasks} />
            </TabsContent>

            <TabsContent value="timeline">
              <TaskTimelineView project={selectedProjectData} tasks={projectTasks} />
            </TabsContent>
          </Tabs>
        </div>
      ) : null}
    </div>
  );
};

export default ProjectsPage;
