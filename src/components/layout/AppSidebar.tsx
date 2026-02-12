import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Package,
  Truck,
  FileText,
  BarChart3,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { useUserRole } from "@/hooks/useUserRole";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: FolderKanban, label: "Projetos", path: "/projetos" },
  { icon: Users, label: "Recursos", path: "/recursos" },
  { icon: Package, label: "Inventário", path: "/inventario" },
  { icon: Truck, label: "Frota", path: "/frota" },
  { icon: FileText, label: "Documentos", path: "/documentos" },
  { icon: BarChart3, label: "Relatórios", path: "/relatorios" },
  { icon: Shield, label: "Utilizadores", path: "/utilizadores" },
];

const AppSidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { hasAccess } = useUserRole();

  const filteredNavItems = navItems.filter((item) => hasAccess(item.path));

  return (
    <aside
      className={`sidebar-gradient flex flex-col border-r border-sidebar-border transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border/50 px-4 bg-gradient-to-r from-sidebar-primary/20 to-transparent">
         {!collapsed && (
           <div className="flex items-center gap-2">
             <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary shadow-lg">
               <FolderKanban className="h-4 w-4 text-white font-bold" />
             </div>
              <span className="text-sm font-bold text-white tracking-wide">
                ERP Data CoLAB
              </span>
           </div>
         )}
         {collapsed && (
           <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary shadow-lg">
             <FolderKanban className="h-4 w-4 text-white font-bold" />
           </div>
         )}
       </div>

      <nav className="flex-1 space-y-1 p-2">
         {filteredNavItems.map((item) => {
           const isActive =
             location.pathname === item.path ||
             (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
           return (
             <Link
               key={item.path}
               to={item.path}
               className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                 isActive
                   ? "bg-sidebar-primary text-white shadow-md"
                   : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-white"
               } ${collapsed ? "justify-center" : ""}`}
               title={collapsed ? item.label : undefined}
             >
               <item.icon className="h-4 w-4 shrink-0" />
               {!collapsed && <span>{item.label}</span>}
             </Link>
           );
         })}
       </nav>

      <div className="border-t border-sidebar-border/50 p-2 bg-gradient-to-t from-sidebar-accent/20 to-transparent">
         <button
           onClick={() => setCollapsed(!collapsed)}
           className="flex w-full items-center justify-center rounded-md px-3 py-2 text-sm font-semibold text-white transition-all hover:bg-sidebar-accent/80"
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
