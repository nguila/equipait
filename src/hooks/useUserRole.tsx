import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type AppRole = "admin" | "manager" | "collaborator";

// Module access matrix per role
const MODULE_ACCESS: Record<AppRole, string[]> = {
  admin: ["/dashboard", "/inventario", "/helpdesk", "/frota", "/documentos", "/relatorios", "/utilizadores"],
  manager: ["/dashboard", "/inventario", "/helpdesk", "/frota", "/documentos", "/relatorios"],
  collaborator: ["/dashboard", "/inventario", "/helpdesk"],
};

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    const fetchRole = async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user role:", error);
        setRole("collaborator"); // fallback
      } else {
        setRole((data?.role as AppRole) ?? "collaborator");
      }
      setLoading(false);
    };

    fetchRole();
  }, [user]);

  const hasAccess = (path: string): boolean => {
    if (!role) return false;
    const allowedPaths = MODULE_ACCESS[role];
    return allowedPaths.some((p) => path === p || (p !== "/dashboard" && path.startsWith(p)));
  };

  const isAdmin = role === "admin";
  const isManager = role === "manager";
  const isCollaborator = role === "collaborator";

  return { role, loading, hasAccess, isAdmin, isManager, isCollaborator };
};
