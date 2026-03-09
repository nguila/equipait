import { useRef, useState, useMemo, useEffect, useCallback } from "react";
import { Diamond, AlertTriangle, ZoomIn, ZoomOut, Download, Link2, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface TaskRow {
  id: string;
  parent_task_id: string | null;
  title: string;
  assignee_id: string | null;
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

interface ProfileRow {
  id: string;
  user_id: string;
  full_name: string | null;
}

interface Dependency {
  id: string;
  predecessor_id: string;
  successor_id: string;
  dependency_type: string;
}

interface Props {
  project: { id: string; title: string; start_date: string | null; end_date: string | null };
  tasks: TaskRow[];
  profiles: ProfileRow[];
}

const STATUS_LABELS: Record<string, string> = {
  por_iniciar: "Por Iniciar",
  em_execucao: "Em Execução",
  em_revisao: "Em Revisão",
  concluida: "Concluída",
  cancelada: "Cancelada",
  bloqueada: "Bloqueada",
};

const PRIORITY_LABELS: Record<string, string> = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
  critica: "Crítica",
};

const ROW_HEIGHT = 40;
const LABEL_WIDTH = 260;

const GanttChartView = ({ project, tasks, profiles }: Props) => {
  const [zoom, setZoom] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [showDepPanel, setShowDepPanel] = useState(false);
  const [newPredecessor, setNewPredecessor] = useState("");
  const [newSuccessor, setNewSuccessor] = useState("");

  const parentTasks = useMemo(() => tasks.filter(t => !t.parent_task_id), [tasks]);

  // Fetch dependencies
  const fetchDeps = useCallback(async () => {
    const taskIds = tasks.map(t => t.id);
    if (taskIds.length === 0) { setDependencies([]); return; }
    const { data } = await supabase
      .from("task_dependencies")
      .select("*")
      .or(`predecessor_id.in.(${taskIds.join(",")}),successor_id.in.(${taskIds.join(",")})`);
    if (data) setDependencies(data as Dependency[]);
  }, [tasks]);

  useEffect(() => { fetchDeps(); }, [fetchDeps]);

  const addDependency = async () => {
    if (!newPredecessor || !newSuccessor || newPredecessor === newSuccessor) {
      toast.error("Selecione duas tarefas diferentes");
      return;
    }
    const { error } = await supabase.from("task_dependencies").insert({
      predecessor_id: newPredecessor,
      successor_id: newSuccessor,
      dependency_type: "finish_to_start",
    });
    if (error) { toast.error("Erro: " + error.message); return; }
    toast.success("Dependência adicionada");
    setNewPredecessor("");
    setNewSuccessor("");
    fetchDeps();
  };

  const removeDependency = async (id: string) => {
    const { error } = await supabase.from("task_dependencies").delete().eq("id", id);
    if (error) { toast.error("Erro: " + error.message); return; }
    toast.success("Dependência removida");
    fetchDeps();
  };

  const getProfileName = (userId: string | null) => {
    if (!userId) return "—";
    const profile = profiles.find(p => p.user_id === userId);
    return profile?.full_name || "—";
  };

  const getTaskTitle = (taskId: string) => {
    return tasks.find(t => t.id === taskId)?.title || "—";
  };

  if (!project.start_date || !project.end_date) {
    return (
      <p className="text-center text-sm text-muted-foreground py-12">
        Defina datas de início e fim no projeto para ver o gráfico de Gantt
      </p>
    );
  }

  const projectStart = new Date(project.start_date);
  const projectEnd = new Date(project.end_date);
  const totalDays = Math.max(1, Math.ceil((projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24)));
  const today = new Date();

  const dayWidth = 28 * zoom;
  const chartWidth = totalDays * dayWidth;

  const months: { label: string; left: number; width: number }[] = [];
  const weeks: { left: number; width: number; label: string }[] = [];

  const curMonth = new Date(projectStart.getFullYear(), projectStart.getMonth(), 1);
  while (curMonth <= projectEnd) {
    const monthStart = new Date(Math.max(curMonth.getTime(), projectStart.getTime()));
    const nextMonth = new Date(curMonth.getFullYear(), curMonth.getMonth() + 1, 1);
    const monthEnd = new Date(Math.min(nextMonth.getTime() - 1, projectEnd.getTime()));
    const leftDay = Math.max(0, Math.ceil((monthStart.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24)));
    const widthDays = Math.max(1, Math.ceil((monthEnd.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    months.push({
      label: curMonth.toLocaleDateString("pt-PT", { month: "short", year: "2-digit" }),
      left: leftDay * dayWidth,
      width: widthDays * dayWidth,
    });
    curMonth.setMonth(curMonth.getMonth() + 1);
  }

  const curWeek = new Date(projectStart);
  curWeek.setDate(curWeek.getDate() - curWeek.getDay() + 1);
  if (curWeek < projectStart) curWeek.setDate(curWeek.getDate() + 7);
  while (curWeek <= projectEnd) {
    const leftDay = Math.max(0, Math.ceil((curWeek.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24)));
    weeks.push({
      left: leftDay * dayWidth,
      width: 7 * dayWidth,
      label: `S${Math.ceil(leftDay / 7) + 1}`,
    });
    curWeek.setDate(curWeek.getDate() + 7);
  }

  const todayDay = Math.ceil((today.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24));
  const todayLeft = todayDay * dayWidth;
  const showToday = todayDay >= 0 && todayDay <= totalDays;

  const getBarStyle = (task: TaskRow) => {
    if (!task.start_date || !task.end_date) return { left: 0, width: 0 };
    const start = new Date(task.start_date);
    const end = new Date(task.end_date);
    const startDay = Math.max(0, Math.ceil((start.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24)));
    const durationDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    return { left: startDay * dayWidth, width: durationDays * dayWidth };
  };

  const getBarColor = (task: TaskRow) => {
    if (task.is_milestone) return "bg-primary";
    if (task.status === "concluida") return "bg-success";
    if (task.risk_level === "high") return "bg-destructive";
    if (task.risk_level === "medium") return "bg-warning";
    if (task.status === "em_execucao") return "bg-primary";
    if (task.status === "em_revisao") return "bg-warning";
    if (task.status === "bloqueada") return "bg-destructive/60";
    return "bg-muted-foreground/40";
  };

  const exportGanttCSV = () => {
    const headers = [
      "Tarefa", "Responsável", "Data Início", "Data Fim", "Duração (dias)",
      "Estado", "Prioridade", "Progresso (%)", "Horas Estimadas", "Horas Registadas",
      "Nível Risco", "Atraso (dias)", "Milestone", "Projeto", "Predecessores",
    ];

    const rows = parentTasks.map((t) => {
      const startD = t.start_date ? new Date(t.start_date) : null;
      const endD = t.end_date ? new Date(t.end_date) : null;
      const duration = startD && endD ? Math.ceil((endD.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24)) + 1 : 0;
      const progress = t.hours_estimated > 0 ? Math.min(100, Math.round((t.hours_logged / t.hours_estimated) * 100)) : (t.status === "concluida" ? 100 : 0);
      const preds = dependencies.filter(d => d.successor_id === t.id).map(d => getTaskTitle(d.predecessor_id)).join("; ");

      return [
        t.title, getProfileName(t.assignee_id), t.start_date || "", t.end_date || "",
        duration, STATUS_LABELS[t.status] || t.status, PRIORITY_LABELS[t.priority] || t.priority,
        progress, t.hours_estimated, t.hours_logged, t.risk_level || "none",
        t.delay_days || 0, t.is_milestone ? "Sim" : "Não", project.title, preds,
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gantt_${project.title.toLowerCase().replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV para Power BI exportado com sucesso");
  };

  // Build dependency arrows as SVG paths
  const taskIndexMap = new Map(parentTasks.map((t, i) => [t.id, i]));

  const arrowPaths = dependencies
    .filter(d => taskIndexMap.has(d.predecessor_id) && taskIndexMap.has(d.successor_id))
    .map((dep) => {
      const predIdx = taskIndexMap.get(dep.predecessor_id)!;
      const succIdx = taskIndexMap.get(dep.successor_id)!;
      const predTask = parentTasks[predIdx];
      const succTask = parentTasks[succIdx];
      const predBar = getBarStyle(predTask);
      const succBar = getBarStyle(succTask);

      // finish_to_start: arrow from end of predecessor to start of successor
      const x1 = predBar.left + predBar.width;
      const y1 = predIdx * ROW_HEIGHT + ROW_HEIGHT / 2;
      const x2 = succBar.left;
      const y2 = succIdx * ROW_HEIGHT + ROW_HEIGHT / 2;

      // Create a path with rounded corners
      const midX = x1 + Math.max(8, (x2 - x1) / 2);

      return {
        id: dep.id,
        path: `M ${x1} ${y1} H ${midX} V ${y2} H ${x2}`,
        arrowX: x2,
        arrowY: y2,
      };
    });

  const svgHeight = parentTasks.length * ROW_HEIGHT;

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
          <div className="flex items-center gap-1.5"><div className="h-2.5 w-6 rounded bg-success" /> Concluída</div>
          <div className="flex items-center gap-1.5"><div className="h-2.5 w-6 rounded bg-primary" /> Em Execução</div>
          <div className="flex items-center gap-1.5"><div className="h-2.5 w-6 rounded bg-warning" /> Revisão / Risco Médio</div>
          <div className="flex items-center gap-1.5"><div className="h-2.5 w-6 rounded bg-destructive" /> Risco Alto</div>
          <div className="flex items-center gap-1.5"><div className="h-2.5 w-6 rounded bg-muted-foreground/40" /> Por Iniciar</div>
          <div className="flex items-center gap-1.5"><Diamond className="h-3 w-3 text-primary fill-primary" /> Milestone</div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant={showDepPanel ? "default" : "outline"} className="gap-1.5 h-8" onClick={() => setShowDepPanel(!showDepPanel)}>
            <Link2 className="h-3.5 w-3.5" /> Dependências
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 h-8" onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}>
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs text-muted-foreground font-medium w-10 text-center">{Math.round(zoom * 100)}%</span>
          <Button size="sm" variant="outline" className="gap-1.5 h-8" onClick={() => setZoom(Math.min(3, zoom + 0.25))}>
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 h-8" onClick={exportGanttCSV}>
            <Download className="h-3.5 w-3.5" /> CSV Power BI
          </Button>
        </div>
      </div>

      {/* Dependencies Panel */}
      {showDepPanel && (
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold text-card-foreground flex items-center gap-1.5">
            <Link2 className="h-4 w-4" /> Gestão de Dependências
          </h3>

          {/* Add new */}
          <div className="flex items-end gap-2 flex-wrap">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Predecessora</label>
              <Select value={newPredecessor} onValueChange={setNewPredecessor}>
                <SelectTrigger className="w-48 h-8 text-xs"><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                <SelectContent>
                  {parentTasks.map(t => (
                    <SelectItem key={t.id} value={t.id} className="text-xs">{t.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <span className="text-xs text-muted-foreground pb-1.5">→</span>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Sucessora</label>
              <Select value={newSuccessor} onValueChange={setNewSuccessor}>
                <SelectTrigger className="w-48 h-8 text-xs"><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                <SelectContent>
                  {parentTasks.filter(t => t.id !== newPredecessor).map(t => (
                    <SelectItem key={t.id} value={t.id} className="text-xs">{t.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button size="sm" className="h-8 gap-1" onClick={addDependency}>
              <Plus className="h-3.5 w-3.5" /> Adicionar
            </Button>
          </div>

          {/* Existing deps */}
          {dependencies.length > 0 ? (
            <div className="space-y-1">
              {dependencies.map(dep => (
                <div key={dep.id} className="flex items-center justify-between text-xs py-1.5 px-2 rounded bg-muted/50">
                  <span className="text-card-foreground">
                    <span className="font-medium">{getTaskTitle(dep.predecessor_id)}</span>
                    <span className="text-muted-foreground mx-1.5">→</span>
                    <span className="font-medium">{getTaskTitle(dep.successor_id)}</span>
                  </span>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive hover:text-destructive" onClick={() => removeDependency(dep.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Nenhuma dependência definida</p>
          )}
        </div>
      )}

      {/* Gantt Chart */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex">
          {/* Fixed left panel */}
          <div className="flex-shrink-0 border-r border-border" style={{ width: LABEL_WIDTH }}>
            <div className="h-8 border-b border-border bg-muted/50" />
            <div className="h-6 border-b border-border bg-muted/30" />
            {parentTasks.length === 0 ? (
              <p className="px-3 py-12 text-center text-sm text-muted-foreground">Nenhuma tarefa</p>
            ) : (
              parentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-1.5 px-3 border-b border-border hover:bg-muted/30 transition-colors"
                  style={{ height: ROW_HEIGHT }}
                >
                  {task.is_milestone && <Diamond className="h-3 w-3 text-primary fill-primary flex-shrink-0" />}
                  <div className="min-w-0 flex-1">
                    <span className={`text-xs truncate block ${task.is_milestone ? "font-bold text-primary" : "font-medium text-card-foreground"}`}>
                      {task.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate block">{getProfileName(task.assignee_id)}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Scrollable chart area */}
          <div ref={scrollRef} className="flex-1 overflow-x-auto">
            <div style={{ width: chartWidth, minWidth: "100%" }}>
              {/* Month headers */}
              <div className="relative h-8 border-b border-border bg-muted/50">
                {months.map((m, i) => (
                  <div key={i} className="absolute top-0 h-full flex items-center border-l border-border/60 px-1.5" style={{ left: m.left, width: m.width }}>
                    <span className="text-[10px] font-semibold uppercase text-muted-foreground truncate">{m.label}</span>
                  </div>
                ))}
              </div>

              {/* Week headers */}
              <div className="relative h-6 border-b border-border bg-muted/30">
                {weeks.map((w, i) => (
                  <div key={i} className="absolute top-0 h-full flex items-center justify-center border-l border-border/30" style={{ left: w.left, width: w.width }}>
                    <span className="text-[9px] text-muted-foreground">{w.label}</span>
                  </div>
                ))}
              </div>

              {/* Task rows + SVG overlay */}
              <div className="relative">
                <TooltipProvider delayDuration={200}>
                  {parentTasks.map((task) => {
                    const bar = getBarStyle(task);
                    const hasDelay = task.delay_days && task.delay_days > 0;
                    const progress = task.hours_estimated > 0
                      ? Math.min(100, Math.round((task.hours_logged / task.hours_estimated) * 100))
                      : task.status === "concluida" ? 100 : 0;

                    return (
                      <div key={task.id} className="relative border-b border-border hover:bg-muted/20 transition-colors" style={{ height: ROW_HEIGHT }}>
                        {weeks.map((w, i) => (
                          <div key={i} className="absolute top-0 bottom-0 w-px bg-border/20" style={{ left: w.left }} />
                        ))}
                        {showToday && <div className="absolute top-0 bottom-0 w-px bg-destructive/40 z-10" style={{ left: todayLeft }} />}

                        {task.is_milestone ? (
                          <div className="absolute top-1/2 -translate-y-1/2 z-20" style={{ left: bar.left }}>
                            <Diamond className="h-5 w-5 text-primary fill-primary drop-shadow" />
                          </div>
                        ) : bar.width > 0 ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={`absolute top-1/2 -translate-y-1/2 h-6 rounded-md z-20 ${getBarColor(task)} shadow-sm cursor-default`}
                                style={{ left: bar.left, width: bar.width }}
                              >
                                <div className="h-full rounded-md bg-white/25" style={{ width: `${progress}%` }} />
                                {bar.width > 60 && (
                                  <span className="absolute inset-0 flex items-center px-1.5 text-[9px] font-semibold text-white truncate drop-shadow-sm">
                                    {progress}%
                                  </span>
                                )}
                                {hasDelay && (
                                  <div className="absolute -right-1 -top-1">
                                    <AlertTriangle className="h-3 w-3 text-destructive" />
                                  </div>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                              <p className="font-semibold">{task.title}</p>
                              <p>{task.start_date} → {task.end_date}</p>
                              <p>Progresso: {progress}% | Horas: {task.hours_logged}/{task.hours_estimated}h</p>
                              {hasDelay && <p className="text-destructive">Atraso: {task.delay_days}d</p>}
                            </TooltipContent>
                          </Tooltip>
                        ) : null}
                      </div>
                    );
                  })}
                </TooltipProvider>

                {/* SVG Dependency Arrows */}
                {arrowPaths.length > 0 && (
                  <svg
                    className="absolute top-0 left-0 pointer-events-none z-30"
                    width={chartWidth}
                    height={svgHeight}
                    style={{ overflow: "visible" }}
                  >
                    <defs>
                      <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                        <path d="M 0 0 L 8 3 L 0 6 Z" className="fill-primary" />
                      </marker>
                    </defs>
                    {arrowPaths.map((arrow) => (
                      <path
                        key={arrow.id}
                        d={arrow.path}
                        fill="none"
                        className="stroke-primary"
                        strokeWidth={1.5}
                        strokeDasharray="4 2"
                        markerEnd="url(#arrowhead)"
                      />
                    ))}
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>

        {showToday && (
          <div className="px-3 py-1.5 border-t border-border bg-destructive/5 text-[10px] text-destructive font-medium">
            Hoje: {today.toLocaleDateString("pt-PT")}
          </div>
        )}
      </div>
    </div>
  );
};

export default GanttChartView;
