import { Plus, Search, CheckCircle, AlertCircle, Clock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "critical";
  createdAt: string;
  updatedAt: string;
  assignee?: string;
}

const mockTickets: Ticket[] = [
  {
    id: "TKT-001",
    title: "Login issues with 2FA",
    description: "Users unable to complete 2FA authentication",
    status: "in_progress",
    priority: "high",
    createdAt: "2026-02-10",
    updatedAt: "2026-02-12",
    assignee: "João Silva",
  },
  {
    id: "TKT-002",
    title: "Inventory sync error",
    description: "Inventory items not syncing between locations",
    status: "open",
    priority: "critical",
    createdAt: "2026-02-11",
    updatedAt: "2026-02-12",
  },
  {
    id: "TKT-003",
    title: "Report export takes too long",
    description: "PDF export of large reports timing out",
    status: "open",
    priority: "medium",
    createdAt: "2026-02-09",
    updatedAt: "2026-02-11",
  },
  {
    id: "TKT-004",
    title: "Dashboard performance improvement",
    description: "Optimize dashboard loading time",
    status: "resolved",
    priority: "low",
    createdAt: "2026-01-25",
    updatedAt: "2026-02-08",
    assignee: "Maria Santos",
  },
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "critical":
      return "bg-destructive/10 text-destructive border-destructive/30";
    case "high":
      return "bg-orange-500/10 text-orange-700 border-orange-500/30";
    case "medium":
      return "bg-yellow-500/10 text-yellow-700 border-yellow-500/30";
    case "low":
      return "bg-green-500/10 text-green-700 border-green-500/30";
    default:
      return "bg-secondary text-secondary-foreground";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "resolved":
      return <CheckCircle className="h-4 w-4 text-success" />;
    case "in_progress":
      return <Clock className="h-4 w-4 text-info" />;
    case "open":
      return <AlertCircle className="h-4 w-4 text-warning" />;
    case "closed":
      return <MessageSquare className="h-4 w-4 text-muted-foreground" />;
    default:
      return null;
  }
};

const HelpdeskPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Helpdesk</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie tickets de suporte e requisições de ajuda
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Ticket
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tickets Abertos</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <AlertCircle className="h-8 w-8 text-warning opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Progresso</p>
                <p className="text-2xl font-bold">5</p>
              </div>
              <Clock className="h-8 w-8 text-info opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Críticos</p>
                <p className="text-2xl font-bold">2</p>
              </div>
              <AlertCircle className="h-8 w-8 text-destructive opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolvidos</p>
                <p className="text-2xl font-bold">128</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar tickets..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Tickets List */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="open">Abertos</TabsTrigger>
          <TabsTrigger value="in_progress">Em Progresso</TabsTrigger>
          <TabsTrigger value="resolved">Resolvidos</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3">
          {mockTickets.map((ticket) => (
            <Card key={ticket.id} className="hover:bg-accent/50 cursor-pointer transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      {getStatusIcon(ticket.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{ticket.id}</h3>
                        <Badge variant="outline">{ticket.title}</Badge>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                        </Badge>
                        <Badge variant="secondary">
                          {ticket.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{ticket.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        {ticket.assignee && (
                          <span>Atribuído a: {ticket.assignee}</span>
                        )}
                        <span>Criado: {ticket.createdAt}</span>
                        <span>Atualizado: {ticket.updatedAt}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="open" className="space-y-3">
          {mockTickets.filter(t => t.status === "open").map((ticket) => (
            <Card key={ticket.id} className="hover:bg-accent/50 cursor-pointer transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                    {getStatusIcon(ticket.status)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{ticket.id} - {ticket.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{ticket.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="in_progress" className="space-y-3">
          {mockTickets.filter(t => t.status === "in_progress").map((ticket) => (
            <Card key={ticket.id} className="hover:bg-accent/50 cursor-pointer transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                    {getStatusIcon(ticket.status)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{ticket.id} - {ticket.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{ticket.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-3">
          {mockTickets.filter(t => t.status === "resolved").map((ticket) => (
            <Card key={ticket.id} className="hover:bg-accent/50 cursor-pointer transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                    {getStatusIcon(ticket.status)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{ticket.id} - {ticket.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{ticket.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HelpdeskPage;
