import { resources, tasks, projects, departments } from "@/data/mockData";
import { Progress } from "@/components/ui/progress";

const ProjectAllocationView = () => {
  const activeProjects = projects.filter(
    (p) => p.status === "ativo" || p.status === "planeado"
  );

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Alocação por Projeto</h3>
      <div className="grid gap-4">
        {activeProjects.map((project) => {
          const projectTasks = tasks.filter(
            (t) =>
              t.projectId === project.id &&
              t.status !== "concluida" &&
              t.status !== "cancelada"
          );
          const assigneeIds = [
            ...new Set(
              projectTasks.flatMap((t) => [t.assigneeId, ...(t.teamIds || [])])
            ),
          ];
          const teamMembers = resources.filter((r) => assigneeIds.includes(r.id));
          const totalEstimated = projectTasks.reduce((s, t) => s + t.hoursEstimated, 0);
          const totalLogged = projectTasks.reduce((s, t) => s + t.hoursLogged, 0);
          const dept = departments.find((d) => d.id === project.departmentId);

          return (
            <div key={project.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-card-foreground">{project.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {project.code} · {dept?.code}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{totalLogged}h</p>
                  <p className="text-[10px] text-muted-foreground">de {totalEstimated}h estimadas</p>
                </div>
              </div>

              <Progress
                value={totalEstimated > 0 ? Math.min((totalLogged / totalEstimated) * 100, 100) : 0}
                className="h-1.5 mb-3"
              />

              <div className="flex flex-wrap gap-2">
                {teamMembers.map((member) => {
                  const memberTasks = projectTasks.filter(
                    (t) => t.assigneeId === member.id || t.teamIds?.includes(member.id)
                  );
                  const hours = memberTasks.reduce((s, t) => s + t.hoursEstimated, 0);
                  const isOverloaded = member.currentAllocation > 100;

                  return (
                    <div
                      key={member.id}
                      className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 ${
                        isOverloaded
                          ? "border-destructive/30 bg-destructive/5"
                          : "border-border bg-muted/50"
                      }`}
                    >
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold ${
                          isOverloaded
                            ? "bg-destructive/15 text-destructive"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {member.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-card-foreground leading-tight">
                          {member.name.split(" ")[0]}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{hours}h · {member.currentAllocation}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectAllocationView;
