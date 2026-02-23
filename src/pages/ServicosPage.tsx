import { Wrench, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ImportExportBar from "@/components/shared/ImportExportBar";

const ServicosPage = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Serviços</h1>
          <p className="text-sm text-muted-foreground">Gestão de serviços e manutenção</p>
        </div>
        <div className="flex items-center gap-2">
          <ImportExportBar data={[]} columns={[]} moduleName="Servicos" />
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Serviço
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Wrench className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold text-foreground">Módulo de Serviços</h3>
          <p className="text-sm text-muted-foreground mt-1">Registe e acompanhe os serviços prestados</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServicosPage;
