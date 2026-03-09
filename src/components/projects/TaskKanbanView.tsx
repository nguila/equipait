import StatusBadge from "@/components/shared/StatusBadge";
import { AlertTriangle, Clock, Diamond } from "lucide-react";

interface TaskRow {
  id: string;
  parent_task_id: string | null;
  title: string;
  assignee_id: string | null;
  status: string;
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
  tasks: TaskRow[];
  profiles: ProfileRow[];
}

const kanbanColumns = [
  { key: "por_iniciar", label: "Por Iniciar", color: "border-muted-foreground/30" },
  { key: "em_execucao", label: "Em Execução", color: "border-primary/50" },
  { key: "em_revisao", label: "Em Revisão", color: "border-warning/50" },
  { key: "concluida", label: "Concluída", color: "border-success/50" },
];

const TaskKanbanView = ({ tasks, profiles }: Props) => {
  const parentTasks = tasks.filter(t => !t.parent_task_id);

  const getProfileName = (userId: string | null) => {
    if (!userId) return null;
    const profile = profiles.find(p => p.user_id === userId);
    return profile?.full_name || null;
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("");
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      {kanbanColumns.map(col => {
        const colTasks = parentTasks.filter(t => t.status === col.key);
        return (
          <div key={col.key} className={`rounded-xl bg-muted/30 border-t-2 ${col.color}`}>
            <div className="flex items-center justify-between px-3 py-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{col.label}</h3>
              <span className="text-xs font-bold text-muted-foreground bg-muted rounded-full h-5 w-5 flex items-center justify-center">{colTasks.length}</span>
            </div>
            <div className="px-2 pb-2 space-y-2">
              {colTasks.map(task => {
                const assigneeName = getProfileName(task.assignee_id);
                const isOverHours = task.hours_logged > task.hours_estimated;
                const hasDelay = task.delay_days && task.delay_days > 0;

                return (
                  <div key={task.id} className={`rounded-lg border border-border bg-card p-3 hover:shadow-sm transition-shadow ${task.is_milestone ? 'ring-1 ring-primary/30' : ''}`}>
                    <div className="flex items-start gap-1.5 mb-2">
                      {task.is_milestone && <Diamond className="h-3.5 w-3.5 text-primary fill-primary flex-shrink-0 mt-0.5" />}
                      <p className={`text-sm ${task.is_milestone ? 'font-bold text-primary' : 'font-medium text-card-foreground'} leading-tight`}>{task.title}</p>
                    </div>
                    {task.is_milestone && task.milestone_label && (
                      <span className="inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary mb-2">{task.milestone_label}</span>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={task.priority} />
                        {task.risk_level && task.risk_level !== 'none' && <StatusBadge status={task.risk_level} />}
                      </div>
                      {hasDelay && (
                        <span className="text-[10px] font-semibold text-destructive flex items-center gap-0.5">
                          <AlertTriangle className="h-3 w-3" />{task.delay_days}d
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                      {assigneeName && (
                        <div className="flex items-center gap-1.5">
                          <div className="h-5 w-5 rounded-full bg-primary/10 text-[9px] font-semibold text-primary flex items-center justify-center">
                            {getInitials(assigneeName)}
                          </div>
                          <span className="text-[11px] text-muted-foreground">{assigneeName.split(" ")[0]}</span>
                        </div>
                      )}
                      {task.hours_estimated > 0 && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className={`text-[11px] ${isOverHours ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
                            {task.hours_logged}/{task.hours_estimated}h
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {colTasks.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-6">Sem tarefas</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskKanbanView;
