import { Wrench, Plus, CalendarIcon } from "lucide-react";
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

const ServicosPage = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", type: "manutencao", priority: "medium",
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
    setForm({ title: "", description: "", type: "manutencao", priority: "medium", responsible: "", technician: "" });
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const handleSubmit = () => {
    if (!form.title.trim()) {
      toast.error("O título é obrigatório");
      return;
    }
    toast.success("Serviço criado com sucesso");
    resetForm();
    setDialogOpen(false);
  };

  const getUserLabel = (u: UserOption) => u.full_name || u.email || "Sem nome";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Serviços</h1>
          <p className="text-sm text-muted-foreground">Gestão de serviços e manutenção</p>
        </div>
        <div className="flex items-center gap-2">
          <ImportExportBar data={[]} columns={[]} moduleName="Servicos" />
          <Button className="gap-2" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Novo Serviço
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Wrench className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold text-foreground">Módulo de Serviços</h3>
          <p className="text-sm text-muted-foreground mt-1">Registe e acompanhe os serviços prestados</p>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Serviço</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Nome do serviço" />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descrição do serviço" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manutencao">Manutenção</SelectItem>
                    <SelectItem value="instalacao">Instalação</SelectItem>
                    <SelectItem value="configuracao">Configuração</SelectItem>
                    <SelectItem value="suporte">Suporte</SelectItem>
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
            <Button onClick={handleSubmit}>Criar Serviço</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServicosPage;
