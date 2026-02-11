import { type Task, type Project, resources } from "@/data/mockData";
import StatusBadge from "@/components/shared/StatusBadge";
import { AlertTriangle, Diamond } from "lucide-react";

interface Props {
  project: Project;
  tasks: Task[];
}

const TaskTimelineView = ({ project, tasks }: Props) => {
  const parentTasks = tasks.filter(t => !t.parentTaskId);

  // Calculate timeline range
  const projectStart = new Date(project.startDate);
  const projectEnd = new Date(project.endDate);
  const totalDays = Math.max(1, Math.ceil((projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24)));

  const today = new Date();
  const todayOffset = Math.max(0, Math.min(100, ((today.getTime() - projectStart.getTime()) / (projectEnd.getTime() - projectStart.getTime())) * 100));

  // Generate month markers
  const months: { label: string; left: number }[] = [];
  const cur = new Date(projectStart);
  cur.setDate(1);
  if (cur < projectStart) cur.setMonth(cur.getMonth() + 1);
  while (cur <= projectEnd) {
    const offset = ((cur.getTime() - projectStart.getTime()) / (projectEnd.getTime() - projectStart.getTime())) * 100;
    months.push({ label: cur.toLocaleDateString("pt-PT", { month: "short", year: "2-digit" }), left: offset });
    cur.setMonth(cur.getMonth() + 1);
  }

  const getBarPosition = (task: Task) => {
    const start = new Date(task.startDate);
    const end = new Date(task.endDate);
    const left = Math.max(0, ((start.getTime() - projectStart.getTime()) / (projectEnd.getTime() - projectStart.getTime())) * 100);
    const width = Math.max(1, ((end.getTime() - start.getTime()) / (projectEnd.getTime() - projectStart.getTime())) * 100);
    return { left: `${left}%`, width: `${Math.min(width, 100 - left)}%` };
  };

  const getBarColor = (task: Task) => {
    if (task.isMilestone) return 'bg-primary';
    if (task.status === 'concluida') return 'bg-success';
    if (task.riskLevel === 'high') return 'bg-destructive';
    if (task.riskLevel === 'medium') return 'bg-warning';
    if (task.status === 'em_execucao') return 'bg-primary';
    if (task.status === 'em_revisao') return 'bg-warning';
    return 'bg-muted-foreground/40';
  };

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5"><div className="h-2.5 w-6 rounded bg-success" /> Concluída</div>
        <div className="flex items-center gap-1.5"><div className="h-2.5 w-6 rounded bg-primary" /> Em Execução</div>
        <div className="flex items-center gap-1.5"><div className="h-2.5 w-6 rounded bg-warning" /> Em Revisão / Risco Médio</div>
        <div className="flex items-center gap-1.5"><div className="h-2.5 w-6 rounded bg-destructive" /> Risco Alto</div>
        <div className="flex items-center gap-1.5"><div className="h-2.5 w-6 rounded bg-muted-foreground/40" /> Por Iniciar</div>
        <div className="flex items-center gap-1.5"><Diamond className="h-3 w-3 text-primary fill-primary" /> Milestone</div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Month Headers */}
        <div className="relative h-8 border-b border-border bg-muted/50">
          {months.map((m, i) => (
            <div key={i} className="absolute top-0 h-full flex items-center border-l border-border/60" style={{ left: `calc(240px + (100% - 240px) * ${m.left / 100})` }}>
              <span className="text-[10px] font-semibold uppercase text-muted-foreground ml-1">{m.label}</span>
            </div>
          ))}
          {/* Today indicator */}
          {todayOffset > 0 && todayOffset < 100 && (
            <div className="absolute top-0 h-full w-px bg-destructive z-10" style={{ left: `calc(240px + (100% - 240px) * ${todayOffset / 100})` }}>
              <div className="absolute -top-0 -translate-x-1/2 bg-destructive text-destructive-foreground text-[9px] font-bold px-1 rounded-b">Hoje</div>
            </div>
          )}
        </div>

        {/* Task Rows */}
        {parentTasks.map(task => {
          const assignee = resources.find(r => r.id === task.assigneeId);
          const bar = getBarPosition(task);
          const hasDelay = task.delayDays && task.delayDays > 0;

          return (
            <div key={task.id} className="relative flex items-center border-b border-border hover:bg-muted/30 transition-colors" style={{ minHeight: 44 }}>
              {/* Task Label */}
              <div className="w-60 flex-shrink-0 px-3 py-2 border-r border-border">
                <div className="flex items-center gap-1.5">
                  {task.isMilestone && <Diamond className="h-3 w-3 text-primary fill-primary flex-shrink-0" />}
                  <span className={`text-xs ${task.isMilestone ? 'font-bold text-primary' : 'font-medium text-card-foreground'} truncate`}>
                    {task.title}
                  </span>
                </div>
                {assignee && <span className="text-[10px] text-muted-foreground">{assignee.name.split(" ")[0]}</span>}
              </div>

              {/* Timeline Area */}
              <div className="flex-1 relative h-full px-1 py-2">
                {/* Month grid lines */}
                {months.map((m, i) => (
                  <div key={i} className="absolute top-0 bottom-0 w-px bg-border/40" style={{ left: `${m.left}%` }} />
                ))}

                {/* Today line */}
                {todayOffset > 0 && todayOffset < 100 && (
                  <div className="absolute top-0 bottom-0 w-px bg-destructive/30 z-10" style={{ left: `${todayOffset}%` }} />
                )}

                {/* Task Bar */}
                {task.isMilestone ? (
                  <div className="absolute top-1/2 -translate-y-1/2 z-20" style={{ left: bar.left }}>
                    <Diamond className="h-5 w-5 text-primary fill-primary" />
                  </div>
                ) : (
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 h-5 rounded-md z-20 ${getBarColor(task)} shadow-sm`}
                    style={bar}
                  >
                    {/* Progress fill */}
                    {task.hoursEstimated > 0 && (
                      <div 
                        className="h-full rounded-md bg-white/20"
                        style={{ width: `${Math.min(100, (task.hoursLogged / task.hoursEstimated) * 100)}%` }}
                      />
                    )}
                    {/* Delay indicator */}
                    {hasDelay && (
                      <div className="absolute -right-1 -top-1">
                        <AlertTriangle className="h-3 w-3 text-destructive" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskTimelineView;
