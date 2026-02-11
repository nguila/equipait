import { useState } from "react";
import { resources, departments } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Shield, Users, Settings, Plus, Pencil } from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";

type AppRole = "admin" | "gestor_portfolio" | "gestor_departamento" | "gestor_projeto" | "colaborador" | "leitura";

interface UserAccount {
  id: string;
  resourceId: string;
  name: string;
  email: string;
  role: AppRole;
  departmentId: string;
  isActive: boolean;
}

interface RoleDefinition {
  id: AppRole;
  label: string;
  description: string;
  permissions: string[];
}

const roleDefinitions: RoleDefinition[] = [
  { id: "admin", label: "Administrador Global", description: "Acesso total ao sistema", permissions: ["Gestão de utilizadores", "Todos os projetos", "Orçamentos", "Configurações"] },
  { id: "gestor_portfolio", label: "Gestor de Portefólio", description: "Gestão de todos os projetos", permissions: ["Ver todos os projetos", "Criar projetos", "Gerir recursos", "Ver orçamentos"] },
  { id: "gestor_departamento", label: "Gestor de Departamento", description: "Gestão do seu departamento", permissions: ["Projetos do departamento", "Recursos do departamento", "Inventário departamental"] },
  { id: "gestor_projeto", label: "Gestor de Projeto", description: "Gestão dos seus projetos", permissions: ["Tarefas do projeto", "Equipa do projeto", "Documentos do projeto"] },
  { id: "colaborador", label: "Colaborador", description: "Participação em projetos", permissions: ["Ver tarefas atribuídas", "Registar horas", "Ver documentos"] },
  { id: "leitura", label: "Apenas Leitura", description: "Visualização sem edição", permissions: ["Ver projetos", "Ver relatórios"] },
];

const roleColors: Record<AppRole, string> = {
  admin: "bg-destructive/10 text-destructive",
  gestor_portfolio: "bg-primary/10 text-primary",
  gestor_departamento: "bg-warning/10 text-warning",
  gestor_projeto: "bg-success/10 text-success",
  colaborador: "bg-secondary text-secondary-foreground",
  leitura: "bg-muted text-muted-foreground",
};

const UsersPage = () => {
  const [users, setUsers] = useState<UserAccount[]>(
    resources.map((r, i) => ({
      id: `u${r.id}`,
      resourceId: r.id,
      name: r.name,
      email: r.email,
      role: i === 0 ? "admin" : i < 3 ? "gestor_projeto" : "colaborador",
      departmentId: r.departmentId,
      isActive: r.status === "ativo",
    }))
  );

  const [editUser, setEditUser] = useState<UserAccount | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "colaborador" as AppRole, departmentId: "" });

  const handleRoleChange = (userId: string, role: AppRole) => {
    setUsers(users.map((u) => u.id === userId ? { ...u, role } : u));
  };

  const handleToggleActive = (userId: string) => {
    setUsers(users.map((u) => u.id === userId ? { ...u, isActive: !u.isActive } : u));
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.departmentId) return;
    setUsers([...users, {
      id: `u${Date.now()}`,
      resourceId: "",
      name: newUser.name.trim(),
      email: newUser.email.trim(),
      role: newUser.role,
      departmentId: newUser.departmentId,
      isActive: true,
    }]);
    setNewUser({ name: "", email: "", role: "colaborador", departmentId: "" });
    setAddOpen(false);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Utilizadores & Permissões</h1>
          <p className="text-sm text-muted-foreground">Gestão de acessos e controlo de funções (RBAC)</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" /> Novo Utilizador
        </Button>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" className="gap-1.5"><Users className="h-3.5 w-3.5" /> Utilizadores</TabsTrigger>
          <TabsTrigger value="roles" className="gap-1.5"><Shield className="h-3.5 w-3.5" /> Funções & Permissões</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Utilizador</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Departamento</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Função</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estado</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => {
                  const dept = departments.find((d) => d.id === user.departmentId);
                  const roleDef = roleDefinitions.find((r) => r.id === user.role);
                  return (
                    <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {user.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-card-foreground">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">{dept?.name || "—"}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleColors[user.role]}`}>
                          {roleDef?.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <Switch checked={user.isActive} onCheckedChange={() => handleToggleActive(user.id)} />
                          <span className={`text-xs ${user.isActive ? "text-success" : "text-muted-foreground"}`}>
                            {user.isActive ? "Ativo" : "Inativo"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => setEditUser(user)}>
                          <Pencil className="h-3.5 w-3.5" /> Editar
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="roles">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roleDefinitions.map((role) => {
              const count = users.filter((u) => u.role === role.id).length;
              return (
                <div key={role.id} className="rounded-xl border border-border bg-card p-5 hover-lift">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-bold text-card-foreground">{role.label}</h3>
                    </div>
                    <span className="text-xs text-muted-foreground">{count} utilizador{count !== 1 ? "es" : ""}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{role.description}</p>
                  <div className="space-y-1">
                    {role.permissions.map((p) => (
                      <div key={p} className="flex items-center gap-1.5 text-xs text-card-foreground">
                        <div className="h-1 w-1 rounded-full bg-primary" />
                        {p}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Role Dialog */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar Função - {editUser?.name}</DialogTitle>
          </DialogHeader>
          {editUser && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Função</Label>
                <Select value={editUser.role} onValueChange={(v) => {
                  handleRoleChange(editUser.id, v as AppRole);
                  setEditUser({ ...editUser, role: v as AppRole });
                }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {roleDefinitions.map((r) => <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setEditUser(null)}>Guardar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Novo Utilizador</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nome *</Label>
              <Input value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} maxLength={100} required />
            </div>
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} maxLength={255} required />
            </div>
            <div className="space-y-1.5">
              <Label>Departamento *</Label>
              <Select value={newUser.departmentId} onValueChange={(v) => setNewUser({ ...newUser, departmentId: v })}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Função</Label>
              <Select value={newUser.role} onValueChange={(v) => setNewUser({ ...newUser, role: v as AppRole })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {roleDefinitions.map((r) => <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancelar</Button>
              <Button type="submit">Criar Utilizador</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
