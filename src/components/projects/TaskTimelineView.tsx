import StatusBadge from "@/components/shared/StatusBadge";
import { AlertTriangle, Diamond } from "lucide-react";

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

interface Props {
  project: any;
  tasks: TaskRow[];
  profiles: ProfileRow[];
}

const TaskTimelineView = ({ project, tasks, profiles }: Props) => {
  const parentTasks = tasks.filter(t => !t.parent_task_id);

  if (!project.start_date || !project.end_date) {
    return <p className="text-center text-sm text-muted-foreground py-12">Defina datas de início e fim no projeto para ver a timeline</p>;
  }

  const projectStart = new Date(project.start_date);
  const projectEnd = new Date(project.end_date);
  const today = new Date();
  const todayOffset = Math.max(0, Math.min(100, ((today.getTime() - projectStart.getTime()) / (projectEnd.getTime() - projectStart.getTime())) * 100));

  const months: { label: string; left: number }[] = [];
  const cur = new Date(projectStart);
  cur.setDate(1);
  if (cur < projectStart) cur.setMonth(cur.getMonth() + 1);
  while (cur <= projectEnd) {
    const offset = ((cur.getTime() - projectStart.getTime()) / (projectEnd.getTime() - projectStart.getTime())) * 100;
    months.push({ label: cur.toLocaleDateString("pt-PT", { month: "short", year: "2-digit" }), left: offset });
    cur.setMonth(cur.getMonth() + 1);
  }

  const getBarPosition = (task: TaskRow) => {
    if (!task.start_date || !task.end_date) return { left: "0%", width: "0%" };
    const start = new Date(task.start_date);
    const end = new Date(task.end_date);
    const left = Math.max(0, ((start.getTime() - projectStart.getTime()) / (projectEnd.getTime() - projectStart.getTime())) * 100);
    const width = Math.max(1, ((end.getTime() - start.getTime()) / (projectEnd.getTime() - projectStart.getTime())) * 100);
    return { left: `${left}%`, width: `${Math.min(width, 100 - left)}%` };
  };

  const getBarColor = (task: TaskRow) => {
    if (task.is_milestone) return 'bg-primary';
    if (task.status === 'concluida') return 'bg-success';
    if (task.risk_level === 'high') return 'bg-destructive';
    if (task.risk_level === 'medium') return 'bg-warning';
    if (task.status === 'em_execucao') return 'bg-primary';
    if (task.status === 'em_revisao') return 'bg-warning';
    return 'bg-muted-foreground/40';
  };

  const getProfileName = (userId: string | null) => {
    if (!userId) return null;
    const profile = profiles.find(p => p.user_id === userId);
    return profile?.full_name || null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5"><div className="h-2.5 w-6 rounded bg-success" /> Concluída</div>
        <div className="flex items-center gap-1.5"><div className="h-2.5 w-6 rounded bg-primary" /> Em Execução</div>
        <div className="flex items-center gap-1.5"><div className="h-2.5 w-6 rounded bg-warning" /> Em Revisão / Risco Médio</div>
        <div className="flex items-center gap-1.5"><div className="h-2.5 w-6 rounded bg-destructive" /> Risco Alto</div>
        <div className="flex items-center gap-1.5"><div className="h-2.5 w-6 rounded bg-muted-foreground/40" /> Por Iniciar</div>
        <div className="flex items-center gap-1.5"><Diamond className="h-3 w-3 text-primary fill-primary" /> Milestone</div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="relative h-8 border-b border-border bg-muted/50">
          {months.map((m, i) => (
            <div key={i} className="absolute top-0 h-full flex items-center border-l border-border/60" style={{ left: `calc(240px + (100% - 240px) * ${m.left / 100})` }}>
              <span className="text-[10px] font-semibold uppercase text-muted-foreground ml-1">{m.label}</span>
            </div>
          ))}
          {todayOffset > 0 && todayOffset < 100 && (
            <div className="absolute top-0 h-full w-px bg-destructive z-10" style={{ left: `calc(240px + (100% - 240px) * ${todayOffset / 100})` }}>
              <div className="absolute -top-0 -translate-x-1/2 bg-destructive text-destructive-foreground text-[9px] font-bold px-1 rounded-b">Hoje</div>
            </div>
          )}
        </div>

        {parentTasks.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-muted-foreground">Nenhuma tarefa para mostrar na timeline</p>
        ) : (
          parentTasks.map(task => {
            const assigneeName = getProfileName(task.assignee_id);
            const bar = getBarPosition(task);
            const hasDelay = task.delay_days && task.delay_days > 0;

            return (
              <div key={task.id} className="relative flex items-center border-b border-border hover:bg-muted/30 transition-colors" style={{ minHeight: 44 }}>
                <div className="w-60 flex-shrink-0 px-3 py-2 border-r border-border">
                  <div className="flex items-center gap-1.5">
                    {task.is_milestone && <Diamond className="h-3 w-3 text-primary fill-primary flex-shrink-0" />}
                    <span className={`text-xs ${task.is_milestone ? 'font-bold text-primary' : 'font-medium text-card-foreground'} truncate`}>{task.title}</span>
                  </div>
                  {assigneeName && <span className="text-[10px] text-muted-foreground">{assigneeName.split(" ")[0]}</span>}
                </div>
                <div className="flex-1 relative h-full px-1 py-2">
                  {months.map((m, i) => (
                    <div key={i} className="absolute top-0 bottom-0 w-px bg-border/40" style={{ left: `${m.left}%` }} />
                  ))}
                  {todayOffset > 0 && todayOffset < 100 && (
                    <div className="absolute top-0 bottom-0 w-px bg-destructive/30 z-10" style={{ left: `${todayOffset}%` }} />
                  )}
                  {task.is_milestone ? (
                    <div className="absolute top-1/2 -translate-y-1/2 z-20" style={{ left: bar.left }}>
                      <Diamond className="h-5 w-5 text-primary fill-primary" />
                    </div>
                  ) : (
                    <div className={`absolute top-1/2 -translate-y-1/2 h-5 rounded-md z-20 ${getBarColor(task)} shadow-sm`} style={bar}>
                      {task.hours_estimated > 0 && (
                        <div className="h-full rounded-md bg-white/20" style={{ width: `${Math.min(100, (task.hours_logged / task.hours_estimated) * 100)}%` }} />
                      )}
                      {hasDelay && (
                        <div className="absolute -right-1 -top-1"><AlertTriangle className="h-3 w-3 text-destructive" /></div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TaskTimelineView;
