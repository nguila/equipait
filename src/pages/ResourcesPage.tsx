import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Users, BarChart3, Zap, Lock, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ResourceFormDialog from "@/components/resources/ResourceFormDialog";
import StatusBadge from "@/components/shared/StatusBadge";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Resource {
  id: string;
  name: string;
  email: string;
  role: string;
  department_id: string | null;
  skills: string[];
  weekly_capacity: number;
  current_allocation: number;
  status: string;
}

interface Department {
  id: string;
  name: string;
}

const ResourcesPage = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState("all");
  const { isCollaborator } = useUserRole();
  const { user } = useAuth();

  const fetchData = async () => {
    const [{ data: r }, { data: d }] = await Promise.all([
      supabase.from("resources").select("*").order("name"),
      supabase.from("departments").select("id, name"),
    ]);
    if (r) setResources(r as Resource[]);
    if (d) setDepartments(d);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = async (form: any) => {
    if (!user) return;
    const { data, error } = await supabase.from("resources").insert({
      name: form.name,
      email: form.email,
      role: form.role,
      department_id: form.department_id || null,
      skills: form.skills || [],
      weekly_capacity: form.weekly_capacity || 40,
      current_allocation: 0,
      status: "ativo",
      created_by: user.id,
    }).select().single();
    if (error) { toast.error("Erro ao criar recurso: " + error.message); return; }
    if (data) { setResources([...resources, data as Resource]); toast.success("Recurso adicionado"); }
  };

  const filtered = resources.filter((r) => {
    if (deptFilter !== "all" && r.department_id !== deptFilter) return false;
    return true;
  });

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-5 animate-fade-in">
      {isCollaborator && (
        <Alert className="border-warning/50 bg-warning/10">
          <Lock className="h-4 w-4 text-warning" />
          <AlertDescription className="text-muted-foreground">
            Modo apenas leitura: Como colaborador, pode visualizar recursos mas não pode criar ou editar.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Recursos & Capacidade</h1>
          <p className="text-sm text-muted-foreground">Gestão de pessoas e carga de trabalho</p>
        </div>
        {!isCollaborator && <ResourceFormDialog departments={departments} onAdd={handleAdd} />}
      </div>

      <div className="flex items-center gap-3">
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-52 h-9 text-sm"><SelectValue placeholder="Departamento" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os departamentos</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="equipa" className="space-y-4">
        <TabsList>
          <TabsTrigger value="equipa" className="gap-1.5"><Users className="h-3.5 w-3.5" />Equipa</TabsTrigger>
        </TabsList>

        <TabsContent value="equipa">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recurso</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Função</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Departamento</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Competências</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Alocação</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((resource) => {
                    const dept = departments.find((d) => d.id === resource.department_id);
                    const isOverloaded = resource.current_allocation > 100;
                    const isHigh = resource.current_allocation > 80;

                    return (
                      <tr key={resource.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                              {resource.name.split(" ").map((n) => n[0]).join("")}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-card-foreground">{resource.name}</p>
                              <p className="text-xs text-muted-foreground">{resource.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-muted-foreground">{resource.role}</td>
                        <td className="px-5 py-3.5 text-sm text-muted-foreground">{dept?.name || "—"}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex flex-wrap gap-1">
                            {(resource.skills || []).map((s) => (
                              <span key={s} className="inline-flex items-center rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">{s}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-20 rounded-full bg-muted overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${isOverloaded ? "bg-destructive" : isHigh ? "bg-warning" : "bg-success"}`}
                                style={{ width: `${Math.min(resource.current_allocation, 100)}%` }}
                              />
                            </div>
                            <span className={`text-xs font-semibold ${isOverloaded ? "text-destructive" : isHigh ? "text-warning" : "text-success"}`}>
                              {resource.current_allocation}%
                            </span>
                            {isOverloaded && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
                          </div>
                        </td>
                        <td className="px-5 py-3.5"><StatusBadge status={resource.status} /></td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-muted-foreground">Nenhum recurso encontrado</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResourcesPage;
