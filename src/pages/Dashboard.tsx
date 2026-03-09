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
  Monitor,
  Wrench,
  Search,
  Filter,
  Bell,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, parseISO } from "date-fns";
import { pt } from "date-fns/locale";

interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  critical: number;
  resolutionRate: number;
  avgResponseHours: number;
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
  const [stats, setStats] = useState<TicketStats>({ total: 0, open: 0, inProgress: 0, resolved: 0, critical: 0, resolutionRate: 0, avgResponseHours: 0 });
  const [allTickets, setAllTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const processTickets = useCallback((tickets: any[]) => {
    const resolved = tickets.filter((t) => t.status === "resolvido" || t.status === "concluido").length;
    const resolutionRate = tickets.length > 0 ? Math.round((resolved / tickets.length) * 100 * 10) / 10 : 0;

    // Calculate avg response time in hours from created_at to updated_at for resolved tickets
    const resolvedTickets = tickets.filter((t) => (t.status === "resolvido" || t.status === "concluido") && t.created_at && t.updated_at);
    let avgResponseHours = 0;
    if (resolvedTickets.length > 0) {
      const totalHours = resolvedTickets.reduce((sum, t) => {
        const created = new Date(t.created_at).getTime();
        const updated = new Date(t.updated_at).getTime();
        return sum + (updated - created) / (1000 * 60 * 60);
      }, 0);
      avgResponseHours = Math.round((totalHours / resolvedTickets.length) * 10) / 10;
    }

    setStats({
      total: tickets.length,
      open: tickets.filter((t) => t.status === "pendente").length,
      inProgress: tickets.filter((t) => t.status === "em_tratamento").length,
      resolved,
      critical: tickets.filter((t) => t.priority === "critical" || t.priority === "high").length,
      resolutionRate,
      avgResponseHours,
    });
    setAllTickets(tickets);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: tickets } = await supabase
        .from("tickets")
        .select("id, title, status, priority, created_at, updated_at, ticket_number")
        .order("created_at", { ascending: false })
        .limit(50);

      if (tickets) processTickets(tickets);
      setLoading(false);
    };
    fetchStats();

    // Real-time subscription
    const channel = supabase
      .channel("dashboard-tickets")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tickets" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newTicket = payload.new as any;
            toast.info(`Novo ticket criado: ${newTicket.title}`, {
              icon: <Bell className="h-4 w-4" />,
              duration: 5000,
            });
            setAllTickets((prev) => {
              const updated = [newTicket, ...prev].slice(0, 50);
              processTickets(updated);
              return updated;
            });
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as any;
            toast.info(`Ticket #${updated.ticket_number} atualizado`, {
              icon: <Bell className="h-4 w-4" />,
              duration: 4000,
            });
            setAllTickets((prev) => {
              const newList = prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t));
              processTickets(newList);
              return newList;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [processTickets]);

  // Filtered tickets
  const filteredTickets = allTickets.filter((t) => {
    const matchesSearch =
      !searchQuery ||
      t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(t.ticket_number).includes(searchQuery);
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  }).slice(0, 10);

  const visibleLinks = quickLinks.filter((card) => hasAccess(card.path));

  const statCards = [
    { label: "Total Tickets", value: stats.total, icon: TicketCheck, color: "text-primary" },
    { label: "Pendentes", value: stats.open, icon: Clock, color: "text-amber-500" },
    { label: "Em Tratamento", value: stats.inProgress, icon: Monitor, color: "text-blue-500" },
    { label: "Resolvidos / Concluídos", value: stats.resolved, icon: CheckCircle2, color: "text-emerald-500" },
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

      {/* Service Metrics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="text-center py-4">
          <p className="text-2xl font-bold text-primary">{stats.resolutionRate}%</p>
          <p className="text-xs text-muted-foreground mt-1">Taxa de Resolução</p>
        </div>
        <div className="text-center py-4">
          <p className="text-2xl font-bold text-primary">{stats.avgResponseHours > 0 ? `${stats.avgResponseHours}h` : "—"}</p>
          <p className="text-xs text-muted-foreground mt-1">Tempo Médio Resposta</p>
        </div>
        <div className="text-center py-4">
          <p className="text-2xl font-bold text-primary">{stats.total}</p>
          <p className="text-xs text-muted-foreground mt-1">Total de Tickets</p>
        </div>
        <div className="text-center py-4">
          <p className="text-2xl font-bold text-primary">{stats.open + stats.inProgress}</p>
          <p className="text-xs text-muted-foreground mt-1">Tickets em Aberto</p>
        </div>
      </div>

      {/* Helpdesk Evolution Chart */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Evolução Helpdesk</CardTitle>
          <p className="text-xs text-muted-foreground">Distribuição de tickets por estado ao longo do tempo</p>
        </CardHeader>
        <CardContent>
          <HelpdeskChart tickets={allTickets} />
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base font-semibold">Tickets Recentes</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 w-48 pl-8 text-xs bg-secondary/60"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 w-[130px] text-xs">
                  <Filter className="mr-1 h-3 w-3" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em_tratamento">Em Tratamento</SelectItem>
                  <SelectItem value="resolvido">Resolvido</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="h-8 w-[130px] text-xs">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredTickets.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-muted-foreground">Nenhum ticket encontrado</p>
          ) : (
            <div className="divide-y divide-border">
              {filteredTickets.map((t) => (
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
                      t.status === "pendente"
                        ? "bg-amber-500/10 text-amber-600"
                        : t.status === "em_tratamento"
                        ? "bg-blue-500/10 text-blue-600"
                        : t.status === "resolvido"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-emerald-700/10 text-emerald-700"
                    }`}>
                      {t.status === "pendente" ? "Pendente" : t.status === "em_tratamento" ? "Em Trat." : t.status === "resolvido" ? "Resolvido" : "Concluído"}
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
