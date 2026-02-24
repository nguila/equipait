import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Users, Building2, Plus, Trash2, Pencil, KeyRound, Loader2, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ALL_MODULES } from "@/hooks/useUserRole";

type AppRole = "admin" | "manager" | "collaborator";

interface UserRow {
  user_id: string;
  full_name: string | null;
  email: string | null;
  is_active: boolean;
  role: AppRole;
  department_name: string | null;
  department_id: string | null;
}

interface PermissionRow {
  module: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Administrador",
  manager: "Gestor",
  collaborator: "Colaborador",
};

const MODULE_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/servicos": "Serviços",
  "/projectos": "Projectos",
  "/inventario": "Inventário",
  "/helpdesk": "Helpdesk",
  "/documentos": "Documentos",
  "/administracao": "Administração",
};

const AdminPage = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Create user
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ email: "", password: "", full_name: "", role: "collaborator" as AppRole });
  const [creating, setCreating] = useState(false);

  // Edit user
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [editForm, setEditForm] = useState({ email: "", full_name: "" });
  const [saving, setSaving] = useState(false);

  // Reset password
  const [resetUser, setResetUser] = useState<UserRow | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetting, setResetting] = useState(false);

  // Permissions
  const [permUser, setPermUser] = useState<UserRow | null>(null);
  const [editPerms, setEditPerms] = useState<PermissionRow[]>([]);
  const [savingPerms, setSavingPerms] = useState(false);

  // Departments
  const [departments, setDepartments] = useState<{ id: string; name: string; description: string | null }[]>([]);
  const [newDeptName, setNewDeptName] = useState("");
  const [deptFormOpen, setDeptFormOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const [profilesRes, rolesRes, deptsRes] = await Promise.all([
      supabase.from("profiles").select("user_id, full_name, email, is_active, department_id"),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("departments").select("id, name, description").order("name"),
    ]);

    if (deptsRes.data) setDepartments(deptsRes.data);

    const roleMap = new Map((rolesRes.data || []).map((r) => [r.user_id, r.role as AppRole]));
    const deptMap = new Map((deptsRes.data || []).map((d) => [d.id, d.name]));
    const merged: UserRow[] = (profilesRes.data || []).map((p) => ({
      user_id: p.user_id,
      full_name: p.full_name,
      email: p.email,
      is_active: p.is_active,
      role: roleMap.get(p.user_id) || "collaborator",
      department_name: p.department_id ? deptMap.get(p.department_id) || null : null,
      department_id: p.department_id,
    }));
    setUsers(merged);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const callAdmin = async (body: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await supabase.functions.invoke("admin-user-management", {
      body,
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    if (res.error) throw new Error(res.error.message);
    if (res.data?.error) throw new Error(res.data.error);
    return res.data;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.email || !createForm.password) return;
    setCreating(true);
    try {
      await callAdmin({ action: "create_user", ...createForm });
      toast.success("Utilizador criado com sucesso");
      setCreateForm({ email: "", password: "", full_name: "", role: "collaborator" });
      setCreateOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setSaving(true);
    try {
      await callAdmin({ action: "update_user", user_id: editUser.user_id, ...editForm });
      toast.success("Utilizador atualizado");
      setEditUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user: UserRow) => {
    if (!confirm(`Eliminar o utilizador ${user.full_name || user.email}? Esta ação é irreversível.`)) return;
    try {
      await callAdmin({ action: "delete_user", user_id: user.user_id });
      toast.success("Utilizador eliminado");
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUser || !newPassword) return;
    setResetting(true);
    try {
      await callAdmin({ action: "reset_password", user_id: resetUser.user_id, new_password: newPassword });
      toast.success("Senha redefinida com sucesso");
      setResetUser(null);
      setNewPassword("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setResetting(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    const { error } = await supabase.from("user_roles").update({ role: newRole }).eq("user_id", userId);
    if (error) { toast.error("Erro ao atualizar função"); return; }
    toast.success("Função atualizada");
    setUsers(users.map((u) => u.user_id === userId ? { ...u, role: newRole } : u));
  };

  const handleToggleActive = async (userId: string, active: boolean) => {
    const { error } = await supabase.from("profiles").update({ is_active: active }).eq("user_id", userId);
    if (error) { toast.error("Erro ao atualizar estado"); return; }
    setUsers(users.map((u) => u.user_id === userId ? { ...u, is_active: active } : u));
  };

  // Permissions
  const openPermissions = async (user: UserRow) => {
    setPermUser(user);
    const { data } = await supabase.from("user_permissions").select("module, can_view, can_create, can_edit, can_delete").eq("user_id", user.user_id);
    const existing = new Map((data || []).map((p) => [p.module, p]));
    const perms: PermissionRow[] = ALL_MODULES.map((m) => ({
      module: m,
      can_view: existing.get(m)?.can_view ?? false,
      can_create: existing.get(m)?.can_create ?? false,
      can_edit: existing.get(m)?.can_edit ?? false,
      can_delete: existing.get(m)?.can_delete ?? false,
    }));
    setEditPerms(perms);
  };

  const handlePermChange = (module: string, field: keyof PermissionRow, value: boolean) => {
    setEditPerms(editPerms.map((p) => p.module === module ? { ...p, [field]: value } : p));
  };

  const savePermissions = async () => {
    if (!permUser) return;
    setSavingPerms(true);
    await supabase.from("user_permissions").delete().eq("user_id", permUser.user_id);
    const rows = editPerms
      .filter((p) => p.can_view || p.can_create || p.can_edit || p.can_delete)
      .map((p) => ({ user_id: permUser.user_id, module: p.module, can_view: p.can_view, can_create: p.can_create, can_edit: p.can_edit, can_delete: p.can_delete }));
    if (rows.length > 0) {
      const { error } = await supabase.from("user_permissions").insert(rows);
      if (error) { toast.error("Erro ao guardar permissões"); setSavingPerms(false); return; }
    }
    toast.success("Permissões guardadas");
    setSavingPerms(false);
    setPermUser(null);
  };

  // Departments
  const addDepartment = async () => {
    if (!newDeptName.trim()) return;
    const { error } = await supabase.from("departments").insert({ name: newDeptName.trim() });
    if (error) { toast.error(error.message); return; }
    toast.success("Departamento criado");
    setNewDeptName("");
    setDeptFormOpen(false);
    fetchUsers();
  };

  const deleteDepartment = async (id: string) => {
    const { error } = await supabase.from("departments").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Departamento eliminado");
    fetchUsers();
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Administração</h1>
        <p className="text-sm text-muted-foreground">
          Gestão de utilizadores, permissões, departamentos e configurações do sistema
        </p>
      </div>

      <Tabs defaultValue="utilizadores" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="utilizadores" className="gap-2">
            <Users className="h-4 w-4" />
            Utilizadores
          </TabsTrigger>
          <TabsTrigger value="permissoes" className="gap-2">
            <Shield className="h-4 w-4" />
            Permissões
          </TabsTrigger>
          <TabsTrigger value="departamentos" className="gap-2">
            <Building2 className="h-4 w-4" />
            Departamentos
          </TabsTrigger>
          <TabsTrigger value="sistema" className="gap-2">
            <Settings className="h-4 w-4" />
            Sistema
          </TabsTrigger>
        </TabsList>

        {/* Utilizadores Tab */}
        <TabsContent value="utilizadores" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Crie, edite e elimine utilizadores do sistema.</p>
            <Button className="gap-2" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> Novo Utilizador
            </Button>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Utilizador</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Departamento</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Função</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estado</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u.user_id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {(u.full_name || "?").split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-card-foreground">{u.full_name || "Sem nome"}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{u.department_name || "—"}</td>
                    <td className="px-5 py-3.5">
                      <Select value={u.role} onValueChange={(v) => handleRoleChange(u.user_id, v as AppRole)}>
                        <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {(["collaborator", "manager", "admin"] as AppRole[]).map((r) => (
                            <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Switch checked={u.is_active} onCheckedChange={(v) => handleToggleActive(u.user_id, v)} />
                        <span className={`text-xs font-semibold ${u.is_active ? "text-emerald-600" : "text-muted-foreground"}`}>
                          {u.is_active ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" title="Editar" onClick={() => { setEditUser(u); setEditForm({ email: u.email || "", full_name: u.full_name || "" }); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Redefinir senha" onClick={() => { setResetUser(u); setNewPassword(""); }}>
                          <KeyRound className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Eliminar" onClick={() => handleDelete(u)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Permissões Tab */}
        <TabsContent value="permissoes" className="mt-6 space-y-4">
          <p className="text-sm text-muted-foreground">Gestão granular de acessos por utilizador e módulo.</p>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Utilizador</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Função</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Permissões</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u.user_id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {(u.full_name || "?").split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-card-foreground">{u.full_name || "Sem nome"}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-medium bg-secondary px-2 py-1 rounded text-secondary-foreground">{ROLE_LABELS[u.role]}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => openPermissions(u)}>
                        <Pencil className="h-3.5 w-3.5" /> Configurar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Role overview cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {(["admin", "manager", "collaborator"] as AppRole[]).map((role) => {
              const count = users.filter((u) => u.role === role).length;
              return (
                <div key={role} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-bold text-card-foreground">{ROLE_LABELS[role]}</h3>
                    </div>
                    <span className="text-xs text-muted-foreground">{count} utilizador{count !== 1 ? "es" : ""}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {role === "admin" && "Acesso total ao sistema, gestão de utilizadores e permissões"}
                    {role === "manager" && "Gestão operacional, acesso a todos os módulos exceto administração"}
                    {role === "collaborator" && "Acesso limitado aos módulos atribuídos pelo administrador"}
                  </p>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* Departamentos Tab */}
        <TabsContent value="departamentos" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Crie e organize os departamentos da organização.</p>
            <Button size="sm" className="gap-1.5" onClick={() => setDeptFormOpen(true)}><Plus className="h-4 w-4" /> Novo Departamento</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {departments.map((d) => (
              <Card key={d.id}>
                <CardContent className="pt-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-card-foreground">{d.name}</p>
                    {d.description && <p className="text-xs text-muted-foreground">{d.description}</p>}
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => deleteDepartment(d.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <Dialog open={deptFormOpen} onOpenChange={setDeptFormOpen}>
            <DialogContent className="max-w-sm">
              <DialogHeader><DialogTitle>Novo Departamento</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Nome do departamento" value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)} />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDeptFormOpen(false)}>Cancelar</Button>
                  <Button onClick={addDepartment}>Criar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Sistema Tab */}
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

      {/* Create User Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Novo Utilizador</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nome Completo</Label>
              <Input value={createForm.full_name} onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })} placeholder="João Silva" />
            </div>
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label>Senha *</Label>
              <Input type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} required minLength={6} />
            </div>
            <div className="space-y-1.5">
              <Label>Função</Label>
              <Select value={createForm.role} onValueChange={(v) => setCreateForm({ ...createForm, role: v as AppRole })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["collaborator", "manager", "admin"] as AppRole[]).map((r) => (
                    <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={creating}>{creating ? "A criar..." : "Criar Utilizador"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Editar Utilizador</DialogTitle></DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nome Completo</Label>
              <Input value={editForm.full_name} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditUser(null)}>Cancelar</Button>
              <Button type="submit" disabled={saving}>{saving ? "A guardar..." : "Guardar"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={!!resetUser} onOpenChange={() => setResetUser(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Redefinir Senha</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Definir nova senha para <strong>{resetUser?.full_name || resetUser?.email}</strong></p>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nova Senha *</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setResetUser(null)}>Cancelar</Button>
              <Button type="submit" disabled={resetting}>{resetting ? "A redefinir..." : "Redefinir Senha"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={!!permUser} onOpenChange={() => setPermUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Permissões — {permUser?.full_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-5 gap-2 text-xs font-semibold text-muted-foreground uppercase border-b border-border pb-2">
              <span className="col-span-1">Módulo</span>
              <span className="text-center">Ver</span>
              <span className="text-center">Criar</span>
              <span className="text-center">Editar</span>
              <span className="text-center">Eliminar</span>
            </div>
            {editPerms.map((perm) => (
              <div key={perm.module} className="grid grid-cols-5 gap-2 items-center">
                <span className="text-sm font-medium">{MODULE_LABELS[perm.module] || perm.module}</span>
                {(["can_view", "can_create", "can_edit", "can_delete"] as const).map((field) => (
                  <div key={field} className="flex justify-center">
                    <Checkbox checked={perm[field]} onCheckedChange={(v) => handlePermChange(perm.module, field, !!v)} />
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <Button variant="outline" onClick={() => setPermUser(null)}>Cancelar</Button>
            <Button onClick={savePermissions} disabled={savingPerms}>
              {savingPerms ? "A guardar..." : "Guardar Permissões"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;
