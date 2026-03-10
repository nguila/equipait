import { Users, AlertTriangle, UserCheck, Zap } from "lucide-react";
import StatCard from "@/components/shared/StatCard";

interface Resource {
  id: string;
  name: string;
  current_allocation: number;
  weekly_capacity: number;
  status: string;
}

interface Task {
  id: string;
  assignee_id: string | null;
  team_ids: string[] | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  hours_estimated: number;
  is_milestone: boolean;
  title: string;
  project_id: string;
}

interface ResourceCapacityCardsProps {
  resources: Resource[];
  tasks?: Task[];
}

const ResourceCapacityCards = ({ resources, tasks = [] }: ResourceCapacityCardsProps) => {
  const activeResources = resources.filter((r) => r.status === "ativo");
  const overloaded = activeResources.filter((r) => r.current_allocation > 100);
  const available = activeResources.filter((r) => r.current_allocation < 60);
  const conflicts = detectConflicts(resources, tasks);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Recursos Ativos" value={activeResources.length} icon={Users} subtitle="Colaboradores disponíveis" />
      <StatCard title="Sobrecarregados" value={overloaded.length} icon={AlertTriangle} subtitle=">100% alocação" />
      <StatCard title="Disponíveis" value={available.length} icon={UserCheck} subtitle="<60% alocação" />
      <StatCard title="Conflitos Ativos" value={conflicts.length} icon={Zap} subtitle="Sobreposições detetadas" />
    </div>
  );
};

export interface Conflict {
  resourceId: string;
  resourceName: string;
  task1Title: string;
  task1Project: string;
  task2Title: string;
  task2Project: string;
  overlapStart: string;
  overlapEnd: string;
  totalHours: number;
  capacityHours: number;
}

export function detectConflicts(resources: Resource[], tasks: Task[]): Conflict[] {
  const activeTasks = tasks.filter(
    (t) => t.status !== "concluida" && t.status !== "cancelada" && !t.is_milestone
  );
  const conflicts: Conflict[] = [];

  resources.forEach((resource) => {
    const myTasks = activeTasks.filter(
      (t) => t.assignee_id === resource.id || t.team_ids?.includes(resource.id)
    );

    for (let i = 0; i < myTasks.length; i++) {
      for (let j = i + 1; j < myTasks.length; j++) {
        const t1 = myTasks[i];
        const t2 = myTasks[j];
        if (!t1.start_date || !t1.end_date || !t2.start_date || !t2.end_date) continue;
        const start1 = new Date(t1.start_date);
        const end1 = new Date(t1.end_date);
        const start2 = new Date(t2.start_date);
        const end2 = new Date(t2.end_date);

        if (start1 <= end2 && start2 <= end1) {
          const overlapStart = new Date(Math.max(start1.getTime(), start2.getTime()));
          const overlapEnd = new Date(Math.min(end1.getTime(), end2.getTime()));
          const totalHours = t1.hours_estimated + t2.hours_estimated;

          if (totalHours > resource.weekly_capacity) {
            conflicts.push({
              resourceId: resource.id,
              resourceName: resource.name,
              task1Title: t1.title,
              task1Project: t1.project_id,
              task2Title: t2.title,
              task2Project: t2.project_id,
              overlapStart: overlapStart.toISOString().split("T")[0],
              overlapEnd: overlapEnd.toISOString().split("T")[0],
              totalHours,
              capacityHours: resource.weekly_capacity,
            });
          }
        }
      }
    }
  });

  return conflicts;
}

export default ResourceCapacityCards;
