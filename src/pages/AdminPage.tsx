import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Users, Building2, Tags, Plus, Trash2, Pencil, KeyRound, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

type AppRole = "admin" | "manager" | "collaborator";

interface UserRow {
  user_id: string;
  full_name: string | null;
  email: string | null;
  is_active: boolean;
  role: AppRole;
}

const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Administrador",
  manager: "Gestor",
  collaborator: "Colaborador",
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

  // Departments & Categories (existing tabs)
  const [departments, setDepartments] = useState<{ id: string; name: string; description: string | null }[]>([]);
  const [newDeptName, setNewDeptName] = useState("");
  const [deptFormOpen, setDeptFormOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const [profilesRes, rolesRes] = await Promise.all([
      supabase.from("profiles").select("user_id, full_name, email, is_active"),
      supabase.from("user_roles").select("user_id, role"),
    ]);

    const roleMap = new Map((rolesRes.data || []).map((r) => [r.user_id, r.role as AppRole]));
    const merged: UserRow[] = (profilesRes.data || []).map((p) => ({
      user_id: p.user_id,
      full_name: p.full_name,
      email: p.email,
      is_active: p.is_active,
      role: roleMap.get(p.user_id) || "collaborator",
    }));
    setUsers(merged);
    setLoading(false);
  };

  const fetchDepartments = async () => {
    const { data } = await supabase.from("departments").select("*").order("name");
    if (data) setDepartments(data);
  };

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

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

  const addDepartment = async () => {
    if (!newDeptName.trim()) return;
    const { error } = await supabase.from("departments").insert({ name: newDeptName.trim() });
    if (error) { toast.error(error.message); return; }
    toast.success("Departamento criado");
    setNewDeptName("");
    setDeptFormOpen(false);
    fetchDepartments();
  };

  const deleteDepartment = async (id: string) => {
    const { error } = await supabase.from("departments").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Departamento eliminado");
    fetchDepartments();
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Administração</h1>
        <p className="text-sm text-muted-foreground">
          Gestão de utilizadores, departamentos e configurações do sistema
        </p>
      </div>

      <Tabs defaultValue="utilizadores" className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="utilizadores" className="gap-2">
            <Users className="h-4 w-4" />
            Utilizadores
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
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-medium bg-secondary px-2 py-1 rounded text-secondary-foreground">{ROLE_LABELS[u.role]}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-semibold ${u.is_active ? "text-emerald-600" : "text-muted-foreground"}`}>
                        {u.is_active ? "Ativo" : "Inativo"}
                      </span>
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
    </div>
  );
};

export default AdminPage;
