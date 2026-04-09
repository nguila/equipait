import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Wrench,
  FolderKanban,
  Package,
  Headphones,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Truck,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useUserRole } from "@/hooks/useUserRole";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Package, label: "Inventário", path: "/inventario" },
  { icon: Headphones, label: "Helpdesk", path: "/helpdesk" },
  { icon: FileText, label: "Documentos", path: "/documentos" },
  { icon: Settings, label: "Administração", path: "/administracao" },
];

const secondaryNavItems = [
  { icon: Truck, label: "Fornecedores", path: "/fornecedores" },
];

const AppSidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { hasAccess } = useUserRole();

  const filteredNavItems = navItems.filter((item) => hasAccess(item.path));
  const filteredSecondaryItems = secondaryNavItems.filter((item) => hasAccess(item.path));

  return (
    <aside
      className={`sidebar-gradient flex flex-col border-r border-sidebar-border/40 transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border/30 px-4">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg animate-glow-pulse">
              <Package className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-sidebar-foreground tracking-wide">
                TI Data CoLAB
              </span>
              <span className="text-[10px] font-medium text-sidebar-muted font-mono-tech">
                SERVICE DESK
              </span>
            </div>
          </div>
        ) : (
          <div className="mx-auto relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg animate-glow-pulse">
            <Package className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 p-3">
        <p className={`mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-muted ${collapsed ? "hidden" : ""}`}>
          Navegação
        </p>
        {filteredNavItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-primary/20 to-accent/10 text-primary-foreground shadow-sm border border-primary/20"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
              } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 rounded-r-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.6)]" />
              )}
              <item.icon className={`h-[18px] w-[18px] shrink-0 transition-colors ${isActive ? "text-primary" : "group-hover:text-primary"}`} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}

        {/* Separator */}
        {filteredSecondaryItems.length > 0 && (
          <>
            <div className={`my-3 mx-3 border-t border-sidebar-border/30`} />
            <p className={`mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-muted ${collapsed ? "hidden" : ""}`}>
              Gestão
            </p>
            {filteredSecondaryItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-primary/20 to-accent/10 text-primary-foreground shadow-sm border border-primary/20"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
                  } ${collapsed ? "justify-center" : ""}`}
                  title={collapsed ? item.label : undefined}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 rounded-r-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.6)]" />
                  )}
                  <item.icon className={`h-[18px] w-[18px] shrink-0 transition-colors ${isActive ? "text-primary" : "group-hover:text-primary"}`} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Collapse Button */}
      <div className="border-t border-sidebar-border/30 p-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-muted transition-all hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span>Recolher</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
