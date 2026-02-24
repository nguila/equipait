import { FolderKanban, Plus, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import ImportExportBar from "@/components/shared/ImportExportBar";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface UserOption {
  user_id: string;
  full_name: string | null;
  email: string | null;
}

const ProjectosPage = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", status: "planning", priority: "medium",
    responsible: "", technician: "",
  });
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [users, setUsers] = useState<UserOption[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase.from("profiles").select("user_id, full_name, email").eq("is_active", true).order("full_name");
      if (data) setUsers(data);
    };
    fetchUsers();
  }, []);

  const resetForm = () => {
    setForm({ title: "", description: "", status: "planning", priority: "medium", responsible: "", technician: "" });
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const handleSubmit = () => {
    if (!form.title.trim()) {
      toast.error("O título é obrigatório");
      return;
    }
    toast.success("Projecto criado com sucesso");
    resetForm();
    setDialogOpen(false);
  };

  const getUserLabel = (u: UserOption) => u.full_name || u.email || "Sem nome";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projectos</h1>
          <p className="text-sm text-muted-foreground">Gestão de projectos e tarefas</p>
        </div>
        <div className="flex items-center gap-2">
          <ImportExportBar data={[]} columns={[]} moduleName="Projectos" />
          <Button className="gap-2" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Novo Projecto
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <FolderKanban className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold text-foreground">Módulo de Projectos</h3>
          <p className="text-sm text-muted-foreground mt-1">Crie e gerencie os projectos da organização</p>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Projecto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Nome do projecto" />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descrição do projecto" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planeamento</SelectItem>
                    <SelectItem value="in_progress">Em Curso</SelectItem>
                    <SelectItem value="on_hold">Suspenso</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de Início</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "dd/MM/yyyy", { locale: pt }) : "Selecionar data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus className={cn("p-3 pointer-events-auto")} />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Data de Fim</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "dd/MM/yyyy", { locale: pt }) : "Selecionar data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} disabled={(date) => startDate ? date < startDate : false} initialFocus className={cn("p-3 pointer-events-auto")} />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Responsável</Label>
                <Select value={form.responsible} onValueChange={(v) => setForm({ ...form, responsible: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecionar responsável" /></SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.user_id} value={u.user_id}>{getUserLabel(u)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Técnico Atribuído</Label>
                <Select value={form.technician} onValueChange={(v) => setForm({ ...form, technician: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecionar técnico" /></SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.user_id} value={u.user_id}>{getUserLabel(u)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit}>Criar Projecto</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectosPage;
