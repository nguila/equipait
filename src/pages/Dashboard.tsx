import {
  Headphones,
  FileText,
  Settings,
  Shield,
  TicketCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Users,
  Monitor,
  Wrench,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  critical: number;
}

const quickLinks = [
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
    description: "Base de conhecimento e manuais",
    path: "/documentos",
    color: "from-cyan-500/20 to-cyan-600/10",
    iconColor: "text-cyan-500",
  },
  {
    icon: Wrench,
    label: "Serviços",
    description: "Serviços técnicos e manutenções",
    path: "/servicos",
    color: "from-blue-500/20 to-blue-600/10",
    iconColor: "text-blue-500",
  },
  {
    icon: Shield,
    label: "Utilizadores",
    description: "Gestão de acessos e permissões",
    path: "/utilizadores",
    color: "from-orange-500/20 to-orange-600/10",
    iconColor: "text-orange-500",
  },
  {
    icon: Settings,
    label: "Administração",
    description: "Configurações do sistema",
    path: "/administracao",
    color: "from-slate-500/20 to-slate-600/10",
    iconColor: "text-slate-500",
  },
];

const Dashboard = () => {
  const { hasAccess } = useUserRole();
  const [stats, setStats] = useState<TicketStats>({ total: 0, open: 0, inProgress: 0, resolved: 0, critical: 0 });
  const [recentTickets, setRecentTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: tickets } = await supabase
        .from("tickets")
        .select("id, title, status, priority, created_at, ticket_number")
        .order("created_at", { ascending: false })
        .limit(50);

      if (tickets) {
        setStats({
          total: tickets.length,
          open: tickets.filter((t) => t.status === "open").length,
          inProgress: tickets.filter((t) => t.status === "in_progress").length,
          resolved: tickets.filter((t) => t.status === "resolved" || t.status === "closed").length,
          critical: tickets.filter((t) => t.priority === "critical" || t.priority === "high").length,
        });
        setRecentTickets(tickets.slice(0, 8));
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  const visibleLinks = quickLinks.filter((card) => hasAccess(card.path));

  const statCards = [
    { label: "Total Tickets", value: stats.total, icon: TicketCheck, color: "text-primary" },
    { label: "Em Aberto", value: stats.open, icon: Clock, color: "text-amber-500" },
    { label: "Em Progresso", value: stats.inProgress, icon: Monitor, color: "text-blue-500" },
    { label: "Resolvidos", value: stats.resolved, icon: CheckCircle2, color: "text-emerald-500" },
    { label: "Prioridade Alta", value: stats.critical, icon: AlertTriangle, color: "text-destructive" },
  ];

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Departamento TI Data CoLAB
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Painel de suporte técnico —{" "}
          {new Date().toLocaleDateString("pt-PT", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {statCards.map((s) => (
          <Card key={s.label} className="border-border">
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-muted ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">{s.value}</p>
                <p className="text-[11px] text-muted-foreground leading-tight">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Tickets */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Tickets Recentes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentTickets.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-muted-foreground">Nenhum ticket encontrado</p>
          ) : (
            <div className="divide-y divide-border">
              {recentTickets.map((t) => (
                <div key={t.id} className="flex items-center justify-between px-6 py-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-muted-foreground">#{t.ticket_number}</span>
                    <span className="text-sm font-medium text-card-foreground">{t.title}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                      t.priority === "critical" || t.priority === "high"
                        ? "bg-destructive/10 text-destructive"
                        : t.priority === "medium"
                        ? "bg-amber-500/10 text-amber-600"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {t.priority}
                    </span>
                    <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                      t.status === "open"
                        ? "bg-amber-500/10 text-amber-600"
                        : t.status === "in_progress"
                        ? "bg-blue-500/10 text-blue-600"
                        : "bg-emerald-500/10 text-emerald-600"
                    }`}>
                      {t.status === "open" ? "Aberto" : t.status === "in_progress" ? "Em Prog." : "Resolvido"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Acesso Rápido</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {visibleLinks.map((card) => (
            <Link
              key={card.path}
              to={card.path}
              className="group relative flex flex-col items-center rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/30"
            >
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.color} transition-transform duration-300 group-hover:scale-110`}
              >
                <card.icon className={`h-6 w-6 ${card.iconColor}`} />
              </div>
              <h3 className="text-sm font-semibold text-card-foreground">{card.label}</h3>
              <p className="mt-1 text-center text-[11px] text-muted-foreground leading-relaxed">{card.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
