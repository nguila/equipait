import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Users, Pencil, Loader2 } from "lucide-react";
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
}

interface PermissionRow {
  module: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

const MODULE_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/servicos": "Serviços",
  "/projectos": "Projectos",
  "/inventario": "Inventário",
  "/economato": "Economato",
  "/helpdesk": "Helpdesk",
  "/documentos": "Documentos",
  "/utilizadores": "Utilizadores",
};

const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Administrador",
  manager: "Gestor",
  collaborator: "Colaborador",
};

const UsersPage = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [editPerms, setEditPerms] = useState<PermissionRow[]>([]);
  const [savingPerms, setSavingPerms] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, email, is_active, department_id");

    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id, role");

    const { data: depts } = await supabase
      .from("departments")
      .select("id, name");

    const roleMap = new Map((roles || []).map((r) => [r.user_id, r.role as AppRole]));
    const deptMap = new Map((depts || []).map((d) => [d.id, d.name]));

    const merged: UserRow[] = (profiles || []).map((p) => ({
      user_id: p.user_id,
      full_name: p.full_name,
      email: p.email,
      is_active: p.is_active,
      role: roleMap.get(p.user_id) || "collaborator",
      department_name: p.department_id ? deptMap.get(p.department_id) || null : null,
    }));

    setUsers(merged);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    const { error } = await supabase
      .from("user_roles")
      .update({ role: newRole })
      .eq("user_id", userId);

    if (error) {
      toast.error("Erro ao atualizar função");
    } else {
      toast.success("Função atualizada");
      setUsers(users.map((u) => u.user_id === userId ? { ...u, role: newRole } : u));
    }
  };

  const handleToggleActive = async (userId: string, active: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_active: active })
      .eq("user_id", userId);

    if (error) {
      toast.error("Erro ao atualizar estado");
    } else {
      setUsers(users.map((u) => u.user_id === userId ? { ...u, is_active: active } : u));
    }
  };

  const openPermissions = async (user: UserRow) => {
    setEditUser(user);
    const { data } = await supabase
      .from("user_permissions")
      .select("module, can_view, can_create, can_edit, can_delete")
      .eq("user_id", user.user_id);

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
    setEditPerms(editPerms.map((p) =>
      p.module === module ? { ...p, [field]: value } : p
    ));
  };

  const savePermissions = async () => {
    if (!editUser) return;
    setSavingPerms(true);

    // Delete existing and re-insert
    await supabase.from("user_permissions").delete().eq("user_id", editUser.user_id);

    const rows = editPerms
      .filter((p) => p.can_view || p.can_create || p.can_edit || p.can_delete)
      .map((p) => ({
        user_id: editUser.user_id,
        module: p.module,
        can_view: p.can_view,
        can_create: p.can_create,
        can_edit: p.can_edit,
        can_delete: p.can_delete,
      }));

    if (rows.length > 0) {
      const { error } = await supabase.from("user_permissions").insert(rows);
      if (error) {
        toast.error("Erro ao guardar permissões");
        setSavingPerms(false);
        return;
      }
    }

    toast.success("Permissões guardadas");
    setSavingPerms(false);
    setEditUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Utilizadores & Permissões</h1>
        <p className="text-sm text-muted-foreground">Gestão granular de acessos por utilizador e módulo</p>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" className="gap-1.5"><Users className="h-3.5 w-3.5" /> Utilizadores</TabsTrigger>
          <TabsTrigger value="roles" className="gap-1.5"><Shield className="h-3.5 w-3.5" /> Funções</TabsTrigger>
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
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Permissões</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user.user_id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {(user.full_name || "?").split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-card-foreground">{user.full_name || "Sem nome"}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{user.department_name || "—"}</td>
                    <td className="px-5 py-3.5">
                      <Select value={user.role} onValueChange={(v) => handleRoleChange(user.user_id, v as AppRole)}>
                        <SelectTrigger className="w-36 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(["admin", "manager", "collaborator"] as AppRole[]).map((r) => (
                            <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Switch checked={user.is_active} onCheckedChange={(v) => handleToggleActive(user.user_id, v)} />
                        <span className={`text-xs ${user.is_active ? "text-success" : "text-muted-foreground"}`}>
                          {user.is_active ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => openPermissions(user)}>
                        <Pencil className="h-3.5 w-3.5" /> Configurar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="roles">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(["admin", "manager", "collaborator"] as AppRole[]).map((role) => {
              const count = users.filter((u) => u.role === role).length;
              return (
                <div key={role} className="rounded-xl border border-border bg-card p-5 hover-lift">
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
      </Tabs>

      {/* Permissions Dialog */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Permissões — {editUser?.full_name}</DialogTitle>
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
                    <Checkbox
                      checked={perm[field]}
                      onCheckedChange={(v) => handlePermChange(perm.module, field, !!v)}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <Button variant="outline" onClick={() => setEditUser(null)}>Cancelar</Button>
            <Button onClick={savePermissions} disabled={savingPerms}>
              {savingPerms ? "A guardar..." : "Guardar Permissões"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
