import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type AppRole = "admin" | "manager" | "collaborator";

export const ALL_MODULES = [
  "/dashboard",
  "/servicos",
  "/projectos",
  "/inventario",
  "/helpdesk",
  "/documentos",
  "/administracao",
] as const;

export type ModulePath = (typeof ALL_MODULES)[number];

// Default module access by role (used as fallback when no granular permissions exist)
const MODULE_ACCESS: Record<AppRole, string[]> = {
  admin: [...ALL_MODULES],
  manager: ["/dashboard", "/servicos", "/projectos", "/inventario", "/helpdesk", "/documentos"],
  collaborator: ["/dashboard", "/inventario", "/helpdesk", "/documentos"],
};

export interface ModulePermission {
  module: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [permissions, setPermissions] = useState<ModulePermission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setPermissions([]);
      setLoading(false);
      return;
    }

    const fetchRoleAndPermissions = async () => {
      const [roleRes, permRes] = await Promise.all([
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("user_permissions")
          .select("module, can_view, can_create, can_edit, can_delete")
          .eq("user_id", user.id),
      ]);

      if (roleRes.error) {
        console.error("Error fetching user role:", roleRes.error);
        setRole("collaborator");
      } else {
        setRole((roleRes.data?.role as AppRole) ?? "collaborator");
      }

      if (!permRes.error && permRes.data) {
        setPermissions(permRes.data as ModulePermission[]);
      }

      setLoading(false);
    };

    fetchRoleAndPermissions();
  }, [user]);

  const hasAccess = (path: string): boolean => {
    if (!role) return false;
    // Admin always has access
    if (role === "admin") return true;

    // Check granular permissions first
    const perm = permissions.find((p) => p.module === path);
    if (perm) return perm.can_view;

    // Fallback to default matrix
    const allowedPaths = MODULE_ACCESS[role];
    return allowedPaths.some((p) => path === p || (p !== "/dashboard" && path.startsWith(p)));
  };

  const getPermission = (path: string): ModulePermission | null => {
    return permissions.find((p) => p.module === path) || null;
  };

  const canCreate = (path: string): boolean => {
    if (role === "admin") return true;
    const perm = permissions.find((p) => p.module === path);
    return perm?.can_create ?? (role === "manager");
  };

  const canEdit = (path: string): boolean => {
    if (role === "admin") return true;
    const perm = permissions.find((p) => p.module === path);
    return perm?.can_edit ?? (role === "manager");
  };

  const canDelete = (path: string): boolean => {
    if (role === "admin") return true;
    const perm = permissions.find((p) => p.module === path);
    return perm?.can_delete ?? false;
  };

  const isAdmin = role === "admin";
  const isManager = role === "manager";
  const isCollaborator = role === "collaborator";

  return { role, loading, hasAccess, getPermission, canCreate, canEdit, canDelete, isAdmin, isManager, isCollaborator };
};
