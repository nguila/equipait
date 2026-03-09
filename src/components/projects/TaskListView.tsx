import StatusBadge from "@/components/shared/StatusBadge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Clock, Flag, ChevronRight, ChevronDown, Diamond } from "lucide-react";
import { useState } from "react";

interface TaskRow {
  id: string;
  project_id: string;
  parent_task_id: string | null;
  title: string;
  description: string | null;
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

const TaskListView = ({ project, tasks, profiles }: Props) => {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const parentTasks = tasks.filter(t => !t.parent_task_id);
  const getSubtasks = (parentId: string) => tasks.filter(t => t.parent_task_id === parentId);

  const toggleExpand = (id: string) => {
    setExpandedTasks(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const today = new Date();

  const getDelayInfo = (task: TaskRow) => {
    if (!task.end_date) return null;
    const end = new Date(task.end_date);
    const doneStatuses = ['concluida', 'cancelada'];
    if (doneStatuses.includes(task.status)) return null;
    if (task.delay_days && task.delay_days > 0) return { days: task.delay_days, label: `${task.delay_days}d atraso` };
    if (end < today) {
      const diff = Math.ceil((today.getTime() - end.getTime()) / (1000 * 60 * 60 * 24));
      return { days: diff, label: `${diff}d atraso` };
    }
    return null;
  };

  const getProfileName = (userId: string | null) => {
    if (!userId) return null;
    const profile = profiles.find(p => p.user_id === userId);
    return profile?.full_name || null;
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("");
  };

  const renderTaskRow = (task: TaskRow, isSubtask = false) => {
    const assigneeName = getProfileName(task.assignee_id);
    const subtasks = getSubtasks(task.id);
    const hasSubtasks = subtasks.length > 0;
    const isExpanded = expandedTasks.has(task.id);
    const delay = getDelayInfo(task);
    const hoursPercent = task.hours_estimated > 0 ? Math.round((task.hours_logged / task.hours_estimated) * 100) : 0;
    const isOverHours = task.hours_logged > task.hours_estimated;

    return (
      <div key={task.id}>
        <div className={`flex items-center gap-2 px-4 py-3 border-b border-border hover:bg-muted/50 transition-colors ${isSubtask ? 'pl-10' : ''} ${task.is_milestone ? 'bg-primary/5' : ''}`}>
          <div className="w-5 flex-shrink-0">
            {hasSubtasks ? (
              <button onClick={() => toggleExpand(task.id)} className="p-0.5 hover:bg-muted rounded">
                {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
              </button>
            ) : task.is_milestone ? (
              <Diamond className="h-3.5 w-3.5 text-primary fill-primary" />
            ) : null}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-sm ${task.is_milestone ? 'font-bold text-primary' : 'font-medium text-card-foreground'} truncate`}>
                {task.title}
              </span>
              {task.is_milestone && task.milestone_label && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary flex-shrink-0">{task.milestone_label}</span>
              )}
            </div>
          </div>

          <div className="w-28 flex-shrink-0">
            {assigneeName && (
              <div className="flex items-center gap-1.5">
                <div className="h-5 w-5 rounded-full bg-primary/10 text-[9px] font-semibold text-primary flex items-center justify-center flex-shrink-0">
                  {getInitials(assigneeName)}
                </div>
                <span className="text-xs text-muted-foreground truncate">{assigneeName.split(" ")[0]}</span>
              </div>
            )}
          </div>

          <div className="w-24 flex-shrink-0"><StatusBadge status={task.status} /></div>
          <div className="w-16 flex-shrink-0"><StatusBadge status={task.priority} /></div>

          <div className="w-20 flex-shrink-0">
            {task.hours_estimated > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <span className={`text-xs ${isOverHours ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
                  {task.hours_logged}/{task.hours_estimated}h
                </span>
              </div>
            )}
          </div>

          <div className="w-28 flex-shrink-0 text-xs text-muted-foreground">
            {task.start_date ? new Date(task.start_date).toLocaleDateString("pt-PT", { day: '2-digit', month: 'short' }) : "—"} — {task.end_date ? new Date(task.end_date).toLocaleDateString("pt-PT", { day: '2-digit', month: 'short' }) : "—"}
          </div>

          <div className="w-24 flex-shrink-0 flex items-center gap-1.5">
            {task.risk_level && task.risk_level !== 'none' && <StatusBadge status={task.risk_level} />}
            {delay && (
              <span className="text-[10px] font-semibold text-destructive flex items-center gap-0.5">
                <AlertTriangle className="h-3 w-3" />{delay.label}
              </span>
            )}
          </div>
        </div>
        {hasSubtasks && isExpanded && subtasks.map(st => renderTaskRow(st, true))}
      </div>
    );
  };

  const totalHoursEstimated = tasks.reduce((s, t) => s + t.hours_estimated, 0);
  const totalHoursLogged = tasks.reduce((s, t) => s + t.hours_logged, 0);
  const milestones = tasks.filter(t => t.is_milestone);
  const tasksWithDelay = parentTasks.filter(t => getDelayInfo(t));
  const highRiskTasks = tasks.filter(t => t.risk_level === 'high');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-3">
        <div className="rounded-lg border border-border bg-card p-3">
          <span className="text-xs text-muted-foreground">Total Tarefas</span>
          <p className="text-lg font-bold text-card-foreground">{parentTasks.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <span className="text-xs text-muted-foreground">Milestones</span>
          <p className="text-lg font-bold text-primary">{milestones.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <span className="text-xs text-muted-foreground">Horas</span>
          <p className="text-lg font-bold text-card-foreground">{totalHoursLogged}<span className="text-sm font-normal text-muted-foreground">/{totalHoursEstimated}h</span></p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <span className="text-xs text-muted-foreground">Com Atraso</span>
          <p className={`text-lg font-bold ${tasksWithDelay.length > 0 ? 'text-destructive' : 'text-success'}`}>{tasksWithDelay.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <span className="text-xs text-muted-foreground">Risco Alto</span>
          <p className={`text-lg font-bold ${highRiskTasks.length > 0 ? 'text-destructive' : 'text-success'}`}>{highRiskTasks.length}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <div className="w-5 flex-shrink-0" />
          <div className="flex-1">Tarefa</div>
          <div className="w-28 flex-shrink-0">Atribuído</div>
          <div className="w-24 flex-shrink-0">Estado</div>
          <div className="w-16 flex-shrink-0">Priorid.</div>
          <div className="w-20 flex-shrink-0">Horas</div>
          <div className="w-28 flex-shrink-0">Período</div>
          <div className="w-24 flex-shrink-0">Risco</div>
        </div>
        {parentTasks.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-muted-foreground">Nenhuma tarefa criada para este projeto</p>
        ) : (
          parentTasks.map(task => renderTaskRow(task))
        )}
      </div>
    </div>
  );
};

export default TaskListView;
