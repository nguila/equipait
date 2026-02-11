import { detectConflicts } from "./ResourceCapacityCards";
import { projects } from "@/data/mockData";
import { AlertTriangle, Calendar, Clock, CheckCircle2 } from "lucide-react";

const ConflictDetector = () => {
  const conflicts = detectConflicts();

  if (conflicts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 mb-4">
          <CheckCircle2 className="h-8 w-8 text-success" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Sem conflitos</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Não foram detetadas sobreposições de tarefas que excedam a capacidade dos recursos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-warning" />
        <h3 className="text-sm font-semibold text-foreground">
          {conflicts.length} Conflito{conflicts.length !== 1 ? "s" : ""} Detetado{conflicts.length !== 1 ? "s" : ""}
        </h3>
      </div>

      <div className="grid gap-3">
        {conflicts.map((conflict, idx) => {
          const proj1 = projects.find((p) => p.id === conflict.task1Project);
          const proj2 = projects.find((p) => p.id === conflict.task2Project);

          return (
            <div
              key={idx}
              className="rounded-lg border border-warning/30 bg-warning/5 p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-warning/15 text-xs font-bold text-warning">
                    {conflict.resourceName.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">{conflict.resourceName}</p>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {conflict.totalHours}h necessárias vs {conflict.capacityHours}h/semana
                    </div>
                  </div>
                </div>
                <span className="rounded bg-warning/20 px-2 py-0.5 text-[10px] font-semibold text-warning">
                  CONFLITO
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="rounded border border-border bg-card p-2.5">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Tarefa 1</p>
                  <p className="text-xs font-medium text-card-foreground">{conflict.task1Title}</p>
                  <p className="text-[10px] text-muted-foreground">{proj1?.code} - {proj1?.name}</p>
                </div>
                <div className="rounded border border-border bg-card p-2.5">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Tarefa 2</p>
                  <p className="text-xs font-medium text-card-foreground">{conflict.task2Title}</p>
                  <p className="text-[10px] text-muted-foreground">{proj2?.code} - {proj2?.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                Sobreposição: {conflict.overlapStart} → {conflict.overlapEnd}
              </div>

              <div className="rounded border border-info/20 bg-info/5 p-2.5">
                <p className="text-[10px] font-semibold text-info uppercase tracking-wider mb-0.5">💡 Sugestão</p>
                <p className="text-xs text-muted-foreground">
                  Considere redistribuir uma das tarefas para um recurso com disponibilidade ou ajustar as datas para eliminar a sobreposição.
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConflictDetector;
