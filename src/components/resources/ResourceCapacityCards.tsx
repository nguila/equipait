import { resources, tasks } from "@/data/mockData";
import { Users, AlertTriangle, UserCheck, Zap } from "lucide-react";
import StatCard from "@/components/shared/StatCard";

const ResourceCapacityCards = () => {
  const activeResources = resources.filter((r) => r.status === "ativo");
  const overloaded = activeResources.filter((r) => r.currentAllocation > 100);
  const available = activeResources.filter((r) => r.currentAllocation < 60);

  // Detect conflicts: same person assigned to overlapping tasks
  const conflicts = detectConflicts();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Recursos Ativos"
        value={activeResources.length}
        icon={Users}
        subtitle="Colaboradores disponíveis"
      />
      <StatCard
        title="Sobrecarregados"
        value={overloaded.length}
        icon={AlertTriangle}
        subtitle=">100% alocação"
      />
      <StatCard
        title="Disponíveis"
        value={available.length}
        icon={UserCheck}
        subtitle="<60% alocação"
      />
      <StatCard
        title="Conflitos Ativos"
        value={conflicts.length}
        icon={Zap}
        subtitle="Sobreposições detetadas"
      />
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

export function detectConflicts(): Conflict[] {
  const activeTasks = tasks.filter(
    (t) => t.status !== "concluida" && t.status !== "cancelada" && !t.isMilestone
  );
  const conflicts: Conflict[] = [];

  resources.forEach((resource) => {
    const myTasks = activeTasks.filter(
      (t) => t.assigneeId === resource.id || t.teamIds?.includes(resource.id)
    );

    for (let i = 0; i < myTasks.length; i++) {
      for (let j = i + 1; j < myTasks.length; j++) {
        const t1 = myTasks[i];
        const t2 = myTasks[j];
        const start1 = new Date(t1.startDate);
        const end1 = new Date(t1.endDate);
        const start2 = new Date(t2.startDate);
        const end2 = new Date(t2.endDate);

        if (start1 <= end2 && start2 <= end1) {
          const overlapStart = new Date(Math.max(start1.getTime(), start2.getTime()));
          const overlapEnd = new Date(Math.min(end1.getTime(), end2.getTime()));
          const totalHours = t1.hoursEstimated + t2.hoursEstimated;

          if (totalHours > resource.weeklyCapacity) {
            conflicts.push({
              resourceId: resource.id,
              resourceName: resource.name,
              task1Title: t1.title,
              task1Project: t1.projectId,
              task2Title: t2.title,
              task2Project: t2.projectId,
              overlapStart: overlapStart.toISOString().split("T")[0],
              overlapEnd: overlapEnd.toISOString().split("T")[0],
              totalHours,
              capacityHours: resource.weeklyCapacity,
            });
          }
        }
      }
    }
  });

  return conflicts;
}

export default ResourceCapacityCards;
