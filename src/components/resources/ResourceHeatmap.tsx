import { resources, departments, tasks, projects } from "@/data/mockData";
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  deptFilter: string;
}

const ResourceHeatmap = ({ deptFilter }: Props) => {
  const filtered = resources
    .filter((r) => r.status === "ativo")
    .filter((r) => deptFilter === "all" || r.departmentId === deptFilter)
    .sort((a, b) => b.currentAllocation - a.currentAllocation);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Mapa de Capacidade</h3>
      <div className="grid gap-3">
        {filtered.map((resource) => {
          const dept = departments.find((d) => d.id === resource.departmentId);
          const allocation = resource.currentAllocation;
          const isOverloaded = allocation > 100;
          const isHigh = allocation > 80;
          const isLow = allocation < 40;

          const activeTasks = tasks.filter(
            (t) =>
              (t.assigneeId === resource.id || t.teamIds?.includes(resource.id)) &&
              t.status !== "concluida" &&
              t.status !== "cancelada"
          );
          const projectIds = [...new Set(activeTasks.map((t) => t.projectId))];
          const totalHoursEstimated = activeTasks.reduce((sum, t) => sum + t.hoursEstimated, 0);
          const totalHoursLogged = activeTasks.reduce((sum, t) => sum + t.hoursLogged, 0);

          return (
            <div
              key={resource.id}
              className={`rounded-lg border p-4 transition-all ${
                isOverloaded
                  ? "border-destructive/30 bg-destructive/5"
                  : isHigh
                  ? "border-warning/30 bg-warning/5"
                  : "border-border bg-card"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      isOverloaded
                        ? "bg-destructive/15 text-destructive"
                        : isHigh
                        ? "bg-warning/15 text-warning"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {resource.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-card-foreground truncate">
                        {resource.name}
                      </p>
                      {isOverloaded && (
                        <Tooltip>
                          <TooltipTrigger>
                            <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
                          </TooltipTrigger>
                          <TooltipContent>Recurso sobrecarregado!</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {resource.role} · {dept?.code}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1">
                    {isOverloaded ? (
                      <TrendingUp className="h-3.5 w-3.5 text-destructive" />
                    ) : isLow ? (
                      <TrendingDown className="h-3.5 w-3.5 text-success" />
                    ) : null}
                    <span
                      className={`text-lg font-bold ${
                        isOverloaded
                          ? "text-destructive"
                          : isHigh
                          ? "text-warning"
                          : "text-success"
                      }`}
                    >
                      {allocation}%
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {totalHoursLogged}h / {totalHoursEstimated}h estimadas
                  </p>
                </div>
              </div>

              <div className="mt-3">
                <Progress
                  value={Math.min(allocation, 100)}
                  className={`h-2 ${
                    isOverloaded
                      ? "[&>div]:bg-destructive"
                      : isHigh
                      ? "[&>div]:bg-warning"
                      : "[&>div]:bg-success"
                  }`}
                />
              </div>

              {projectIds.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {projectIds.map((pId) => {
                    const proj = projects.find((p) => p.id === pId);
                    return proj ? (
                      <span
                        key={pId}
                        className="inline-flex items-center rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground"
                      >
                        {proj.code}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResourceHeatmap;
