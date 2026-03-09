import { CheckCircle2 } from "lucide-react";

const ConflictDetector = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 mb-4">
        <CheckCircle2 className="h-8 w-8 text-success" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">Sem conflitos</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
        A deteção de conflitos será ativada quando existirem tarefas e recursos associados.
      </p>
    </div>
  );
};

export default ConflictDetector;
