import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import StatusBadge from "@/components/shared/StatusBadge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { List, LayoutGrid, ChevronRight, Clock as ClockIcon, Lock, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import TaskListView from "@/components/projects/TaskListView";
import TaskKanbanView from "@/components/projects/TaskKanbanView";
import TaskTimelineView from "@/components/projects/TaskTimelineView";
import ProjectFormDialog from "@/components/projects/ProjectFormDialog";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import ImportExportBar from "@/components/shared/ImportExportBar";
import { toast } from "sonner";

interface ProjectRow {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  start_date: string | null;
  end_date: string | null;
  responsible_id: string | null;
  technician_id: string | null;
  created_by: string;
}

interface Department {
  id: string;
  name: string;
}

interface TaskRow {
  id: string;
  project_id: string;
  parent_task_id: string | null;
  title: string;
  description: string | null;
  assignee_id: string | null;
  team_ids: string[] | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  hours_estimated: number;
  hours_logged: number;
  priority: string;
  is_milestone: boolean;
  milestone_label: string | null;
  risk_level: string | null;
  delay_days: number | null;
}

interface ResourceRow {
  id: string;
  name: string;
}

interface ProfileRow {
  id: string;
  user_id: string;
  full_name: string | null;
}

const ProjectsPage = () => {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const { isCollaborator } = useUserRole();
  const { user } = useAuth();

  const fetchData = async () => {
    const [{ data: p }, { data: d }, { data: pr }] = await Promise.all([
      supabase.from("projects").select("*").order("created_at", { ascending: false }),
      supabase.from("departments").select("id, name"),
      supabase.from("profiles").select("id, user_id, full_name"),
    ]);
    if (p) setProjects(p as ProjectRow[]);
    if (d) setDepartments(d);
    if (pr) setProfiles(pr);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // Fetch tasks when a project is selected
  useEffect(() => {
    if (!selectedProject) { setTasks([]); return; }
    const fetchTasks = async () => {
      const { data } = await supabase.from("project_tasks").select("*").eq("project_id", selectedProject).order("start_date");
      if (data) setTasks(data as TaskRow[]);
    };
    fetchTasks();
  }, [selectedProject]);

  const handleAdd = async (form: any) => {
    if (!user) return;
    const { data, error } = await supabase.from("projects").insert({
      title: form.title,
      description: form.description || null,
      status: form.status || "planning",
      priority: form.priority || "medium",
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      responsible_id: form.responsible_id || null,
      technician_id: form.technician_id || null,
      created_by: user.id,
    }).select().single();
    if (error) { toast.error("Erro ao criar projeto: " + error.message); return; }
    if (data) { setProjects([data as ProjectRow, ...projects]); toast.success("Projeto criado"); }
  };

  const filtered = projects.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    return true;
  });

  const selectedProjectData = selectedProject ? projects.find((p) => p.id === selectedProject) : null;

  const getProfileName = (userId: string | null) => {
    if (!userId) return "—";
    const profile = profiles.find(p => p.user_id === userId);
    return profile?.full_name || "—";
  };

  // Calculate progress from tasks
  const getProgress = (projectId: string) => {
    const projTasks = tasks.filter(t => t.project_id === projectId && !t.is_milestone);
    if (projTasks.length === 0) return 0;
    const done = projTasks.filter(t => t.status === "concluida").length;
    return Math.round((done / projTasks.length) * 100);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-5 animate-fade-in">
      {isCollaborator && (
        <Alert className="border-warning/50 bg-warning/10">
          <Lock className="h-4 w-4 text-warning" />
          <AlertDescription className="text-muted-foreground">
            Modo apenas leitura: Como colaborador, pode visualizar projetos mas não pode criar ou editar.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projetos</h1>
          <p className="text-sm text-muted-foreground">Portefólio de projetos da organização</p>
        </div>
        <div className="flex items-center gap-2">
          <ImportExportBar
            data={filtered.map(p => ({ ...p, name: p.title }))}
            columns={[
              { key: "title", label: "Projeto" },
              { key: "status", label: "Estado" },
              { key: "priority", label: "Prioridade" },
            ]}
            moduleName="Projetos"
          />
          {!isCollaborator && <ProjectFormDialog profiles={profiles} onAdd={handleAdd} />}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 h-9 text-sm"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os estados</SelectItem>
            <SelectItem value="planning">Planeamento</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="on_hold">Em Pausa</SelectItem>
            <SelectItem value="completed">Concluído</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!selectedProject ? (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Projeto</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estado</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Prioridade</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Responsável</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Período</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((project) => (
                <tr
                  key={project.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setSelectedProject(project.id)}
                >
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-card-foreground">{project.title}</p>
                    {project.description && <p className="text-xs text-muted-foreground truncate max-w-xs">{project.description}</p>}
                  </td>
                  <td className="px-5 py-3.5"><StatusBadge status={project.status} /></td>
                  <td className="px-5 py-3.5"><StatusBadge status={project.priority} /></td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground">{getProfileName(project.responsible_id)}</td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">
                    {project.start_date ? new Date(project.start_date).toLocaleDateString("pt-PT") : "—"} — {project.end_date ? new Date(project.end_date).toLocaleDateString("pt-PT") : "—"}
                  </td>
                  <td className="px-3 py-3.5"><ChevronRight className="h-4 w-4 text-muted-foreground" /></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-muted-foreground">Nenhum projeto encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      ) : selectedProjectData ? (
        <div className="space-y-4">
          <button onClick={() => setSelectedProject(null)} className="flex items-center gap-1 text-sm text-primary hover:underline">
            ← Voltar à lista de projetos
          </button>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-card-foreground">{selectedProjectData.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">{selectedProjectData.description}</p>
              </div>
              <div className="flex gap-2">
                <StatusBadge status={selectedProjectData.status} />
                <StatusBadge status={selectedProjectData.priority} />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div><span className="text-muted-foreground">Responsável:</span> <span className="font-medium">{getProfileName(selectedProjectData.responsible_id)}</span></div>
              <div><span className="text-muted-foreground">Início:</span> <span className="font-medium">{selectedProjectData.start_date ? new Date(selectedProjectData.start_date).toLocaleDateString("pt-PT") : "—"}</span></div>
              <div><span className="text-muted-foreground">Fim:</span> <span className="font-medium">{selectedProjectData.end_date ? new Date(selectedProjectData.end_date).toLocaleDateString("pt-PT") : "—"}</span></div>
              <div><span className="text-muted-foreground">Tarefas:</span> <span className="font-medium">{tasks.length}</span></div>
            </div>
          </div>

          <Tabs defaultValue="list" className="space-y-4">
            <TabsList className="bg-muted/60 p-1">
              <TabsTrigger value="list" className="gap-1.5 text-xs"><List className="h-4 w-4" /> Lista</TabsTrigger>
              <TabsTrigger value="kanban" className="gap-1.5 text-xs"><LayoutGrid className="h-4 w-4" /> Kanban</TabsTrigger>
              <TabsTrigger value="timeline" className="gap-1.5 text-xs"><ClockIcon className="h-4 w-4" /> Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="list">
              <TaskListView project={selectedProjectData} tasks={tasks} profiles={profiles} />
            </TabsContent>
            <TabsContent value="kanban">
              <TaskKanbanView tasks={tasks} profiles={profiles} />
            </TabsContent>
            <TabsContent value="timeline">
              <TaskTimelineView project={selectedProjectData} tasks={tasks} profiles={profiles} />
            </TabsContent>
          </Tabs>
        </div>
      ) : null}
    </div>
  );
};

export default ProjectsPage;
