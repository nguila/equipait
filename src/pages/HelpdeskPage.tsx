import { useState, useEffect, useMemo } from "react";
import { Plus, Search, CheckCircle, AlertCircle, Clock, MessageSquare, Users, Building2, Trash2, Edit, UserPlus, BarChart3, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import TicketFormDialog from "@/components/helpdesk/TicketFormDialog";
import TicketDetailDialog from "@/components/helpdesk/TicketDetailDialog";
import ReportsTab from "@/components/helpdesk/ReportsTab";
import ImportExportBar from "@/components/shared/ImportExportBar";
import TechnicianProfileDialog from "@/components/helpdesk/TechnicianProfileDialog";
import { toast } from "sonner";


interface Ticket {
  id: string;
  ticket_number: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  category: string | null;
  assigned_to: string | null;
  department_id: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  equipment_type: string | null;
  operating_system: string | null;
  due_date: string | null;
  sla_hours: number | null;
  related_ticket_id: string | null;
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
    case "pendente": return <AlertCircle className="h-4 w-4 text-warning" />;
    case "em_tratamento": return <Clock className="h-4 w-4 text-info" />;
    case "resolvido": return <CheckCircle className="h-4 w-4 text-success" />;
    case "concluido": return <MessageSquare className="h-4 w-4 text-emerald-700" />;
    default: return null;
  }
};

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  em_tratamento: "Em Tratamento",
  resolvido: "Resolvido",
  concluido: "Concluído",
};

const exportColumns = [
  { key: "ticket_number", label: "Nº Ticket" },
  { key: "title", label: "Título" },
  { key: "status", label: "Estado" },
  { key: "priority", label: "Prioridade" },
  { key: "category", label: "Categoria" },
  { key: "equipment_type", label: "Equipamento" },
  { key: "operating_system", label: "Sistema Operativo" },
  { key: "created_at", label: "Data Criação" },
];

const HelpdeskPage = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string; description: string | null }[]>([]);
  const [profiles, setProfiles] = useState<{ user_id: string; full_name: string | null; email: string | null; department_id: string | null }[]>([]);
  const [search, setSearch] = useState("");
  const [filterEquipment, setFilterEquipment] = useState("all");
  const [filterOS, setFilterOS] = useState("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [detailTicket, setDetailTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainTab, setMainTab] = useState("tickets");

  // Department form
  const [deptDialogOpen, setDeptDialogOpen] = useState(false);
  const [deptForm, setDeptForm] = useState({ name: "", description: "" });
  const [editingDept, setEditingDept] = useState<string | null>(null);

  // Technician form
  const [techDialogOpen, setTechDialogOpen] = useState(false);
  const [techForm, setTechForm] = useState({ user_id: "", department_id: "" });
  const [selectedTech, setSelectedTech] = useState<typeof profiles[0] | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const [ticketsRes, deptsRes, profilesRes] = await Promise.all([
      supabase.from("tickets").select("*").order("created_at", { ascending: false }),
      supabase.from("departments").select("id, name, description"),
      supabase.from("profiles").select("user_id, full_name, email, department_id"),
    ]);
    if (ticketsRes.data) setTickets(ticketsRes.data as Ticket[]);
    if (deptsRes.data) setDepartments(deptsRes.data);
    if (profilesRes.data) setProfiles(profilesRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const uniqueEquipments = useMemo(() => [...new Set(tickets.map(t => t.equipment_type).filter(Boolean))], [tickets]);
  const uniqueOS = useMemo(() => [...new Set(tickets.map(t => t.operating_system).filter(Boolean))], [tickets]);

  const filtered = tickets.filter((t) => {
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.ticket_number.toString().includes(search);
    const matchEquip = filterEquipment === "all" || t.equipment_type === filterEquipment;
    const matchOS = filterOS === "all" || t.operating_system === filterOS;
    return matchSearch && matchEquip && matchOS;
  });

  const stats = {
    pendente: tickets.filter((t) => t.status === "pendente").length,
    em_tratamento: tickets.filter((t) => t.status === "em_tratamento").length,
    resolvido: tickets.filter((t) => t.status === "resolvido").length,
    concluido: tickets.filter((t) => t.status === "concluido").length,
  };

  // Technicians: profiles that have tickets assigned to them or are in a department
  const technicians = profiles.filter((p) =>
    tickets.some((t) => t.assigned_to === p.user_id) || p.department_id
  );

  // Department CRUD
  const handleSaveDept = async () => {
    if (!deptForm.name.trim()) return;
    try {
      if (editingDept) {
        const { error } = await supabase.from("departments").update({ name: deptForm.name, description: deptForm.description || null }).eq("id", editingDept);
        if (error) throw error;
        toast.success("Departamento atualizado");
      } else {
        const { error } = await supabase.from("departments").insert({ name: deptForm.name, description: deptForm.description || null });
        if (error) throw error;
        toast.success("Departamento criado");
      }
      setDeptDialogOpen(false);
      setDeptForm({ name: "", description: "" });
      setEditingDept(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteDept = async (id: string) => {
    if (!confirm("Eliminar departamento?")) return;
    const { error } = await supabase.from("departments").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Departamento eliminado"); fetchData(); }
  };

  // Assign technician to department
  const handleAssignTech = async () => {
    if (!techForm.user_id || !techForm.department_id) return;
    const { error } = await supabase.from("profiles").update({ department_id: techForm.department_id }).eq("user_id", techForm.user_id);
    if (error) toast.error(error.message);
    else { toast.success("Técnico associado ao departamento"); setTechDialogOpen(false); setTechForm({ user_id: "", department_id: "" }); fetchData(); }
  };

  // Remove technician from department
  const handleRemoveTech = async (userId: string) => {
    if (!confirm("Remover técnico do departamento?")) return;
    const { error } = await supabase.from("profiles").update({ department_id: null }).eq("user_id", userId);
    if (error) toast.error(error.message);
    else { toast.success("Técnico removido do departamento"); fetchData(); }
  };

  const renderTickets = (list: Ticket[]) =>
    list.length === 0 ? (
      <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhum ticket encontrado</CardContent></Card>
    ) : (
      list.map((ticket) => (
        <Card key={ticket.id} className="hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => setDetailTicket(ticket)}>
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
                  {ticket.equipment_type && <Badge variant="outline" className="gap-1">🖥️ {ticket.equipment_type}</Badge>}
                  {ticket.operating_system && <Badge variant="outline" className="gap-1">💻 {ticket.operating_system}</Badge>}
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
              <div className="flex gap-1 shrink-0">
                <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); setEditingTicket(ticket); setFormOpen(true); }}>
                  <Edit className="h-4 w-4" />
                </Button>
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
        <div className="flex items-center gap-2">
          <ImportExportBar data={filtered} columns={exportColumns} moduleName="Helpdesk" />
          <Button className="gap-2" onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" />
            Novo Ticket
          </Button>
        </div>
      </div>

      {/* Main Tabs: Tickets | Técnicos | Departamentos */}
      <Tabs value={mainTab} onValueChange={setMainTab} className="w-full">
        <TabsList>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="tecnicos" className="gap-1"><Users className="h-3.5 w-3.5" />Técnicos</TabsTrigger>
          <TabsTrigger value="departamentos" className="gap-1"><Building2 className="h-3.5 w-3.5" />Departamentos</TabsTrigger>
          <TabsTrigger value="relatorios" className="gap-1"><BarChart3 className="h-3.5 w-3.5" />Relatórios</TabsTrigger>
        </TabsList>

        {/* ---- TICKETS TAB ---- */}
        <TabsContent value="tickets" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: "Pendentes", value: stats.pendente, icon: AlertCircle, color: "text-warning" },
              { label: "Em Tratamento", value: stats.em_tratamento, icon: Clock, color: "text-info" },
              { label: "Resolvidos", value: stats.resolvido, icon: CheckCircle, color: "text-success" },
              { label: "Concluídos", value: stats.concluido, icon: CheckCircle, color: "text-emerald-700" },
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

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Pesquisar tickets..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={filterEquipment} onValueChange={setFilterEquipment}>
              <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Equipamento" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Equipamentos</SelectItem>
                {uniqueEquipments.map((eq) => <SelectItem key={eq} value={eq!}>{eq}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterOS} onValueChange={setFilterOS}>
              <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Sist. Operativo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos SO</SelectItem>
                {uniqueOS.map((os) => <SelectItem key={os} value={os!}>{os}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="pendente">Pendentes</TabsTrigger>
              <TabsTrigger value="em_tratamento">Em Tratamento</TabsTrigger>
              <TabsTrigger value="resolvido">Resolvidos</TabsTrigger>
              <TabsTrigger value="concluido">Concluídos</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="space-y-3">{renderTickets(filtered)}</TabsContent>
            <TabsContent value="pendente" className="space-y-3">{renderTickets(filtered.filter((t) => t.status === "pendente"))}</TabsContent>
            <TabsContent value="em_tratamento" className="space-y-3">{renderTickets(filtered.filter((t) => t.status === "em_tratamento"))}</TabsContent>
            <TabsContent value="resolvido" className="space-y-3">{renderTickets(filtered.filter((t) => t.status === "resolvido"))}</TabsContent>
            <TabsContent value="concluido" className="space-y-3">{renderTickets(filtered.filter((t) => t.status === "concluido"))}</TabsContent>
          </Tabs>
        </TabsContent>

        {/* ---- TÉCNICOS TAB ---- */}
        <TabsContent value="tecnicos" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Gestão de Técnicos</h2>
            <div className="flex gap-2">
              <Button size="sm" className="gap-1" onClick={() => setTechDialogOpen(true)}>
                <UserPlus className="h-4 w-4" />
                Associar Técnico
              </Button>
            </div>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead className="text-right">Tickets</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {technicians.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhum técnico encontrado</TableCell></TableRow>
                  ) : (
                    technicians.map((tech) => {
                      const dept = departments.find((d) => d.id === tech.department_id);
                      const assignedCount = tickets.filter((t) => t.assigned_to === tech.user_id).length;
                      return (
                        <TableRow key={tech.user_id} className="cursor-pointer hover:bg-accent/50" onClick={() => setSelectedTech(tech)}>
                          <TableCell className="font-medium">{tech.full_name || "Sem nome"}</TableCell>
                          <TableCell className="text-muted-foreground">{tech.email}</TableCell>
                          <TableCell>{dept ? <Badge variant="outline">{dept.name}</Badge> : <span className="text-muted-foreground text-xs">—</span>}</TableCell>
                          <TableCell className="text-right">{assignedCount}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); setTechForm({ user_id: tech.user_id, department_id: tech.department_id || "" }); setTechDialogOpen(true); }}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleRemoveTech(tech.user_id); }}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Assign Technician Dialog */}
          <Dialog open={techDialogOpen} onOpenChange={setTechDialogOpen}>
            <DialogContent>
              <DialogHeader><DialogTitle>Associar Técnico a Departamento</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Técnico</Label>
                  <Select value={techForm.user_id} onValueChange={(v) => setTechForm({ ...techForm, user_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecionar utilizador" /></SelectTrigger>
                    <SelectContent>
                      {profiles.map((p) => <SelectItem key={p.user_id} value={p.user_id}>{p.full_name || p.email || "Sem nome"}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Departamento</Label>
                  <Select value={techForm.department_id} onValueChange={(v) => setTechForm({ ...techForm, department_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecionar departamento" /></SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setTechDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleAssignTech}>Associar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>


          <TechnicianProfileDialog
            open={!!selectedTech}
            onOpenChange={(open) => !open && setSelectedTech(null)}
            technician={selectedTech}
            tickets={tickets}
            departments={departments}
          />
        </TabsContent>

        {/* ---- DEPARTAMENTOS TAB ---- */}
        <TabsContent value="departamentos" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Gestão de Departamentos</h2>
            <Button size="sm" className="gap-1" onClick={() => { setEditingDept(null); setDeptForm({ name: "", description: "" }); setDeptDialogOpen(true); }}>
              <Plus className="h-4 w-4" />
              Novo Departamento
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.length === 0 ? (
                    <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">Nenhum departamento encontrado</TableCell></TableRow>
                  ) : (
                    departments.map((dept) => (
                      <TableRow key={dept.id}>
                        <TableCell className="font-medium">{dept.name}</TableCell>
                        <TableCell className="text-muted-foreground">{dept.description || "—"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="icon" variant="ghost" onClick={() => { setEditingDept(dept.id); setDeptForm({ name: dept.name, description: dept.description || "" }); setDeptDialogOpen(true); }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDeleteDept(dept.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Department Dialog */}
          <Dialog open={deptDialogOpen} onOpenChange={setDeptDialogOpen}>
            <DialogContent>
              <DialogHeader><DialogTitle>{editingDept ? "Editar Departamento" : "Novo Departamento"}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Nome *</Label>
                  <Input value={deptForm.name} onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Descrição</Label>
                  <Input value={deptForm.description} onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDeptDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleSaveDept}>{editingDept ? "Guardar" : "Criar"}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ---- RELATÓRIOS TAB ---- */}
        <TabsContent value="relatorios" className="space-y-6">
          <ReportsTab tickets={tickets} profiles={profiles} departments={departments} />
        </TabsContent>
      </Tabs>

      <TicketFormDialog
        open={formOpen}
        onOpenChange={(open) => { setFormOpen(open); if (!open) setEditingTicket(null); }}
        onCreated={fetchData}
        departments={departments}
        profiles={profiles}
        tickets={tickets.map((t) => ({ id: t.id, ticket_number: t.ticket_number, title: t.title }))}
        editingTicket={editingTicket}
      />

      <TicketDetailDialog
        open={!!detailTicket}
        onOpenChange={(open) => !open && setDetailTicket(null)}
        ticket={detailTicket}
        profiles={profiles}
      />
    </div>
  );
};

export default HelpdeskPage;
