import { Settings, Users, Building2, Tags } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminPage = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Administração</h1>
        <p className="text-sm text-muted-foreground">
          Configurações globais do sistema, departamentos e categorias
        </p>
      </div>

      <Tabs defaultValue="departamentos" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="departamentos" className="gap-2">
            <Building2 className="h-4 w-4" />
            Departamentos
          </TabsTrigger>
          <TabsTrigger value="categorias" className="gap-2">
            <Tags className="h-4 w-4" />
            Categorias
          </TabsTrigger>
          <TabsTrigger value="sistema" className="gap-2">
            <Settings className="h-4 w-4" />
            Sistema
          </TabsTrigger>
        </TabsList>

        <TabsContent value="departamentos" className="mt-6">
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold text-card-foreground">Gestão de Departamentos</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Crie, edite e organize os departamentos da organização.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="categorias" className="mt-6">
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <Tags className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold text-card-foreground">Categorias do Sistema</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Configure categorias para tickets, documentos e outros módulos.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="sistema" className="mt-6">
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <Settings className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold text-card-foreground">Configurações do Sistema</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Parâmetros gerais, preferências e definições avançadas.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
