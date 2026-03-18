import { Truck } from "lucide-react";

const FornecedoresPage = () => {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Truck className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fornecedores</h1>
          <p className="text-sm text-muted-foreground">Gestão de fornecedores e parceiros</p>
        </div>
      </div>

      <div className="flex items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 p-16">
        <p className="text-muted-foreground">Módulo de fornecedores em desenvolvimento</p>
      </div>
    </div>
  );
};

export default FornecedoresPage;
