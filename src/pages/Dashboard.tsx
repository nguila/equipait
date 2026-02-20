import {
  Wrench,
  FolderKanban,
  Package,
  ShoppingCart,
  Headphones,
  FileText,
  Shield,
  Settings,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";

const menuCards = [
  {
    icon: Wrench,
    label: "Serviços",
    description: "Gestão de serviços e manutenções",
    path: "/servicos",
    color: "from-blue-500/20 to-blue-600/10",
    iconColor: "text-blue-500",
  },
  {
    icon: FolderKanban,
    label: "Projectos",
    description: "Planeamento e acompanhamento de projetos",
    path: "/projectos",
    color: "from-violet-500/20 to-violet-600/10",
    iconColor: "text-violet-500",
  },
  {
    icon: Package,
    label: "Inventário",
    description: "Controlo de stock e armazéns",
    path: "/inventario",
    color: "from-amber-500/20 to-amber-600/10",
    iconColor: "text-amber-500",
  },
  {
    icon: ShoppingCart,
    label: "Economato",
    description: "Gestão de compras e fornecimentos",
    path: "/economato",
    color: "from-emerald-500/20 to-emerald-600/10",
    iconColor: "text-emerald-500",
  },
  {
    icon: Headphones,
    label: "Helpdesk",
    description: "Tickets de suporte e assistência",
    path: "/helpdesk",
    color: "from-rose-500/20 to-rose-600/10",
    iconColor: "text-rose-500",
  },
  {
    icon: FileText,
    label: "Documentos",
    description: "Repositório documental centralizado",
    path: "/documentos",
    color: "from-cyan-500/20 to-cyan-600/10",
    iconColor: "text-cyan-500",
  },
  {
    icon: Shield,
    label: "Utilizadores",
    description: "Gestão de contas e permissões",
    path: "/utilizadores",
    color: "from-orange-500/20 to-orange-600/10",
    iconColor: "text-orange-500",
  },
  {
    icon: Settings,
    label: "Administração",
    description: "Configurações e gestão do sistema",
    path: "/administracao",
    color: "from-slate-500/20 to-slate-600/10",
    iconColor: "text-slate-500",
  },
];

const Dashboard = () => {
  const { hasAccess } = useUserRole();

  const visibleCards = menuCards.filter((card) => hasAccess(card.path));

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Departamento IT Data CoLAB
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Selecione um módulo para começar —{" "}
          {new Date().toLocaleDateString("pt-PT", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visibleCards.map((card) => (
          <Link
            key={card.path}
            to={card.path}
            className="group relative flex flex-col items-center rounded-2xl border border-border bg-card p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/30"
          >
            <div
              className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${card.color} transition-transform duration-300 group-hover:scale-110`}
            >
              <card.icon className={`h-8 w-8 ${card.iconColor}`} />
            </div>
            <h2 className="text-lg font-semibold text-card-foreground">
              {card.label}
            </h2>
            <p className="mt-1.5 text-center text-xs text-muted-foreground leading-relaxed">
              {card.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
