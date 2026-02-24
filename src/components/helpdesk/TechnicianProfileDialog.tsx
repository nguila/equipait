import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle, Clock, AlertCircle, User, Mail, Building2, Wrench } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface TechnicianProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  technician: {
    user_id: string;
    full_name: string | null;
    email: string | null;
    department_id: string | null;
  } | null;
  tickets: {
    id: string;
    ticket_number: number;
    title: string;
    status: string;
    priority: string;
    category: string | null;
    created_at: string;
    updated_at: string;
    assigned_to: string | null;
    tags: string[];
  }[];
  departments: { id: string; name: string; description: string | null }[];
}

const statusLabels: Record<string, string> = {
  open: "Aberto",
  in_progress: "Em Progresso",
  waiting: "Em Espera",
  resolved: "Resolvido",
  closed: "Fechado",
};

const priorityLabels: Record<string, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  critical: "Crítica",
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "critical": return "bg-destructive/10 text-destructive border-destructive/30";
    case "high": return "bg-orange-500/10 text-orange-700 border-orange-500/30";
    case "medium": return "bg-yellow-500/10 text-yellow-700 border-yellow-500/30";
    case "low": return "bg-green-500/10 text-green-700 border-green-500/30";
    default: return "bg-secondary text-secondary-foreground";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "resolved":
    case "closed": return "bg-green-500/10 text-green-700 border-green-500/30";
    case "in_progress": return "bg-blue-500/10 text-blue-700 border-blue-500/30";
    case "open": return "bg-yellow-500/10 text-yellow-700 border-yellow-500/30";
    case "waiting": return "bg-muted text-muted-foreground";
    default: return "bg-secondary text-secondary-foreground";
  }
};

const TechnicianProfileDialog = ({ open, onOpenChange, technician, tickets, departments }: TechnicianProfileDialogProps) => {
  if (!technician) return null;

  const assignedTickets = tickets.filter((t) => t.assigned_to === technician.user_id);
  const dept = departments.find((d) => d.id === technician.department_id);

  const stats = {
    total: assignedTickets.length,
    open: assignedTickets.filter((t) => t.status === "open").length,
    in_progress: assignedTickets.filter((t) => t.status === "in_progress").length,
    resolved: assignedTickets.filter((t) => ["resolved", "closed"].includes(t.status)).length,
  };

  const resolutionRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;

  // Average resolution time
  const resolvedTickets = assignedTickets.filter((t) => ["resolved", "closed"].includes(t.status));
  const avgHours = resolvedTickets.length > 0
    ? Math.round(resolvedTickets.reduce((sum, t) => {
        const diff = new Date(t.updated_at).getTime() - new Date(t.created_at).getTime();
        return sum + diff / (1000 * 60 * 60);
      }, 0) / resolvedTickets.length)
    : 0;

  const initials = (technician.full_name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Perfil do Técnico</DialogTitle>
        </DialogHeader>

        {/* Header */}
        <div className="flex items-center gap-4 pb-4 border-b border-border">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">{technician.full_name || "Sem nome"}</h2>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{technician.email}</span>
              {dept && <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{dept.name}</span>}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <Wrench className="h-5 w-5 mx-auto text-primary opacity-60" />
              <p className="text-2xl font-bold mt-1">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <AlertCircle className="h-5 w-5 mx-auto text-warning opacity-60" />
              <p className="text-2xl font-bold mt-1">{stats.open}</p>
              <p className="text-xs text-muted-foreground">Abertos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <Clock className="h-5 w-5 mx-auto text-info opacity-60" />
              <p className="text-2xl font-bold mt-1">{stats.in_progress}</p>
              <p className="text-xs text-muted-foreground">Em Progresso</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <CheckCircle className="h-5 w-5 mx-auto text-success opacity-60" />
              <p className="text-2xl font-bold mt-1">{stats.resolved}</p>
              <p className="text-xs text-muted-foreground">Resolvidos</p>
            </CardContent>
          </Card>
        </div>

        {/* Performance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Taxa de Resolução</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Progress value={resolutionRate} className="flex-1" />
                <span className="text-sm font-semibold">{resolutionRate}%</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Tempo Médio de Resolução</CardTitle></CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{avgHours}h</p>
              <p className="text-xs text-muted-foreground">baseado em {resolvedTickets.length} ticket(s)</p>
            </CardContent>
          </Card>
        </div>

        {/* Tickets Table */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Tickets Atribuídos</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignedTickets.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">Nenhum ticket atribuído</TableCell></TableRow>
                ) : (
                  assignedTickets.slice(0, 10).map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono text-sm">#{t.ticket_number}</TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">{t.title}</TableCell>
                      <TableCell><Badge className={getStatusColor(t.status)}>{statusLabels[t.status] || t.status}</Badge></TableCell>
                      <TableCell><Badge className={getPriorityColor(t.priority)}>{priorityLabels[t.priority] || t.priority}</Badge></TableCell>
                      <TableCell className="text-muted-foreground text-sm">{new Date(t.created_at).toLocaleDateString("pt-PT")}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {assignedTickets.length > 10 && (
              <p className="text-xs text-muted-foreground text-center py-2">A mostrar 10 de {assignedTickets.length} tickets</p>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default TechnicianProfileDialog;
