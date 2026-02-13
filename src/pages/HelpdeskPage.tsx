import { useState, useEffect } from "react";
import { Plus, Search, CheckCircle, AlertCircle, Clock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import TicketFormDialog from "@/components/helpdesk/TicketFormDialog";

interface Ticket {
  id: string;
  ticket_number: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  category: string | null;
  assigned_to: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "critical": return "bg-destructive/10 text-destructive border-destructive/30";
    case "high": return "bg-orange-500/10 text-orange-700 border-orange-500/30";
    case "medium": return "bg-yellow-500/10 text-yellow-700 border-yellow-500/30";
    case "low": return "bg-green-500/10 text-green-700 border-green-500/30";
    default: return "bg-secondary text-secondary-foreground";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "resolved": return <CheckCircle className="h-4 w-4 text-success" />;
    case "in_progress": return <Clock className="h-4 w-4 text-info" />;
    case "open": return <AlertCircle className="h-4 w-4 text-warning" />;
    case "closed": return <MessageSquare className="h-4 w-4 text-muted-foreground" />;
    case "waiting": return <Clock className="h-4 w-4 text-muted-foreground" />;
    default: return null;
  }
};

const statusLabels: Record<string, string> = {
  open: "Aberto",
  in_progress: "Em Progresso",
  waiting: "Em Espera",
  resolved: "Resolvido",
  closed: "Fechado",
};

const HelpdeskPage = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [profiles, setProfiles] = useState<{ user_id: string; full_name: string | null }[]>([]);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const [ticketsRes, deptsRes, profilesRes] = await Promise.all([
      supabase.from("tickets").select("*").order("created_at", { ascending: false }),
      supabase.from("departments").select("id, name"),
      supabase.from("profiles").select("user_id, full_name"),
    ]);
    if (ticketsRes.data) setTickets(ticketsRes.data as Ticket[]);
    if (deptsRes.data) setDepartments(deptsRes.data);
    if (profilesRes.data) setProfiles(profilesRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = tickets.filter((t) =>
    !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.ticket_number.toString().includes(search)
  );

  const stats = {
    open: tickets.filter((t) => t.status === "open").length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
    critical: tickets.filter((t) => t.priority === "critical").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
  };

  const renderTickets = (list: Ticket[]) =>
    list.length === 0 ? (
      <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhum ticket encontrado</CardContent></Card>
    ) : (
      list.map((ticket) => (
        <Card key={ticket.id} className="hover:bg-accent/50 cursor-pointer transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                {getStatusIcon(ticket.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-foreground">#{ticket.ticket_number}</h3>
                  <span className="text-sm font-medium text-foreground">{ticket.title}</span>
                  <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                  <Badge variant="secondary">{statusLabels[ticket.status] || ticket.status}</Badge>
                  {ticket.category && <Badge variant="outline">{ticket.category}</Badge>}
                </div>
                {ticket.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{ticket.description}</p>}
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>Criado: {new Date(ticket.created_at).toLocaleDateString("pt-PT")}</span>
                  {ticket.tags?.length > 0 && (
                    <div className="flex gap-1">
                      {ticket.tags.map((tag) => (
                        <span key={tag} className="bg-secondary px-1.5 py-0.5 rounded text-[10px]">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))
    );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Helpdesk</h1>
          <p className="text-sm text-muted-foreground">Gestão de tickets de suporte</p>
        </div>
        <Button className="gap-2" onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
          Novo Ticket
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Abertos", value: stats.open, icon: AlertCircle, color: "text-warning" },
          { label: "Em Progresso", value: stats.in_progress, icon: Clock, color: "text-info" },
          { label: "Críticos", value: stats.critical, icon: AlertCircle, color: "text-destructive" },
          { label: "Resolvidos", value: stats.resolved, icon: CheckCircle, color: "text-success" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold">{s.value}</p>
                </div>
                <s.icon className={`h-8 w-8 ${s.color} opacity-50`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Pesquisar tickets..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="open">Abertos</TabsTrigger>
          <TabsTrigger value="in_progress">Em Progresso</TabsTrigger>
          <TabsTrigger value="resolved">Resolvidos</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-3">{renderTickets(filtered)}</TabsContent>
        <TabsContent value="open" className="space-y-3">{renderTickets(filtered.filter((t) => t.status === "open"))}</TabsContent>
        <TabsContent value="in_progress" className="space-y-3">{renderTickets(filtered.filter((t) => t.status === "in_progress"))}</TabsContent>
        <TabsContent value="resolved" className="space-y-3">{renderTickets(filtered.filter((t) => t.status === "resolved"))}</TabsContent>
      </Tabs>

      <TicketFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onCreated={fetchData}
        departments={departments}
        profiles={profiles}
        tickets={tickets.map((t) => ({ id: t.id, ticket_number: t.ticket_number, title: t.title }))}
      />
    </div>
  );
};

export default HelpdeskPage;
