import { type Task, type Project, resources } from "@/data/mockData";
import StatusBadge from "@/components/shared/StatusBadge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Clock, Flag, ChevronRight, ChevronDown, Diamond } from "lucide-react";
import { useState } from "react";

interface Props {
  project: Project;
  tasks: Task[];
}

const TaskListView = ({ project, tasks }: Props) => {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const parentTasks = tasks.filter(t => !t.parentTaskId);
  const getSubtasks = (parentId: string) => tasks.filter(t => t.parentTaskId === parentId);

  const toggleExpand = (id: string) => {
    setExpandedTasks(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const today = new Date();

  const getDelayInfo = (task: Task) => {
    const end = new Date(task.endDate);
    const doneStatuses: string[] = ['concluida', 'cancelada'];
    if (doneStatuses.includes(task.status)) return null;
    if (task.delayDays && task.delayDays > 0) return { days: task.delayDays, label: `${task.delayDays}d atraso` };
    if (end < today && !doneStatuses.includes(task.status)) {
      const diff = Math.ceil((today.getTime() - end.getTime()) / (1000 * 60 * 60 * 24));
      return { days: diff, label: `${diff}d atraso` };
    }
    return null;
  };

  const renderTaskRow = (task: Task, isSubtask = false) => {
    const assignee = resources.find(r => r.id === task.assigneeId);
    const subtasks = getSubtasks(task.id);
    const hasSubtasks = subtasks.length > 0;
    const isExpanded = expandedTasks.has(task.id);
    const delay = getDelayInfo(task);
    const hoursPercent = task.hoursEstimated > 0 ? Math.round((task.hoursLogged / task.hoursEstimated) * 100) : 0;
    const isOverHours = task.hoursLogged > task.hoursEstimated;

    return (
      <div key={task.id}>
        <div 
          className={`flex items-center gap-2 px-4 py-3 border-b border-border hover:bg-muted/50 transition-colors ${isSubtask ? 'pl-10' : ''} ${task.isMilestone ? 'bg-primary/5' : ''}`}
        >
          {/* Expand/Collapse */}
          <div className="w-5 flex-shrink-0">
            {hasSubtasks ? (
              <button onClick={() => toggleExpand(task.id)} className="p-0.5 hover:bg-muted rounded">
                {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
              </button>
            ) : task.isMilestone ? (
              <Diamond className="h-3.5 w-3.5 text-primary fill-primary" />
            ) : null}
          </div>

          {/* Title */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-sm ${task.isMilestone ? 'font-bold text-primary' : 'font-medium text-card-foreground'} truncate`}>
                {task.title}
              </span>
              {task.isMilestone && task.milestoneLabel && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary flex-shrink-0">
                  {task.milestoneLabel}
                </span>
              )}
            </div>
          </div>

          {/* Assignee */}
          <div className="w-28 flex-shrink-0">
            {assignee && (
              <div className="flex items-center gap-1.5">
                <div className="h-5 w-5 rounded-full bg-primary/10 text-[9px] font-semibold text-primary flex items-center justify-center flex-shrink-0">
                  {assignee.name.split(" ").map(n => n[0]).join("")}
                </div>
                <span className="text-xs text-muted-foreground truncate">{assignee.name.split(" ")[0]}</span>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="w-24 flex-shrink-0">
            <StatusBadge status={task.status} />
          </div>

          {/* Priority */}
          <div className="w-16 flex-shrink-0">
            <StatusBadge status={task.priority} />
          </div>

          {/* Hours */}
          <div className="w-20 flex-shrink-0">
            {task.hoursEstimated > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <span className={`text-xs ${isOverHours ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
                  {task.hoursLogged}/{task.hoursEstimated}h
                </span>
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="w-28 flex-shrink-0 text-xs text-muted-foreground">
            {new Date(task.startDate).toLocaleDateString("pt-PT", { day: '2-digit', month: 'short' })} — {new Date(task.endDate).toLocaleDateString("pt-PT", { day: '2-digit', month: 'short' })}
          </div>

          {/* Risk & Delay */}
          <div className="w-24 flex-shrink-0 flex items-center gap-1.5">
            {task.riskLevel && task.riskLevel !== 'none' && (
              <StatusBadge status={task.riskLevel} />
            )}
            {delay && (
              <span className="text-[10px] font-semibold text-destructive flex items-center gap-0.5">
                <AlertTriangle className="h-3 w-3" />
                {delay.label}
              </span>
            )}
          </div>
        </div>

        {/* Subtasks */}
        {hasSubtasks && isExpanded && subtasks.map(st => renderTaskRow(st, true))}
      </div>
    );
  };

  // Summary stats
  const totalHoursEstimated = tasks.reduce((s, t) => s + t.hoursEstimated, 0);
  const totalHoursLogged = tasks.reduce((s, t) => s + t.hoursLogged, 0);
  const milestones = tasks.filter(t => t.isMilestone);
  const tasksWithDelay = parentTasks.filter(t => getDelayInfo(t));
  const highRiskTasks = tasks.filter(t => t.riskLevel === 'high');

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
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

      {/* Task Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Header */}
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
        {/* Rows */}
        {parentTasks.map(task => renderTaskRow(task))}
      </div>
    </div>
  );
};

export default TaskListView;
