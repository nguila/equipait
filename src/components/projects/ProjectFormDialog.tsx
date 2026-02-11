import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { departments, resources, type Project, type ProjectStatus, type StrategicCategory, type Priority } from "@/data/mockData";

interface ProjectFormDialogProps {
  onAdd: (project: Project) => void;
}

const ProjectFormDialog = ({ onAdd }: ProjectFormDialogProps) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    departmentId: "",
    sponsorDepartmentId: "",
    category: "" as StrategicCategory | "",
    priority: "" as Priority | "",
    status: "planeado" as ProjectStatus,
    startDate: "",
    endDate: "",
    managerId: "",
    budget: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.code || !form.departmentId || !form.category || !form.priority || !form.startDate || !form.endDate || !form.managerId) return;

    const newProject: Project = {
      id: `p${Date.now()}`,
      name: form.name.trim(),
      code: form.code.trim(),
      description: form.description.trim(),
      departmentId: form.departmentId,
      sponsorDepartmentId: form.sponsorDepartmentId || form.departmentId,
      category: form.category as StrategicCategory,
      priority: form.priority as Priority,
      status: form.status,
      startDate: form.startDate,
      endDate: form.endDate,
      managerId: form.managerId,
      budget: form.budget ? Number(form.budget) : undefined,
      progress: 0,
      taskCount: 0,
      teamSize: 1,
    };

    onAdd(newProject);
    setForm({ name: "", code: "", description: "", departmentId: "", sponsorDepartmentId: "", category: "", priority: "", status: "planeado", startDate: "", endDate: "", managerId: "", budget: "" });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" /> Novo Projeto
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Projeto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="proj-name">Nome *</Label>
              <Input id="proj-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="proj-code">Código *</Label>
              <Input id="proj-code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="PRJ-007" maxLength={20} required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="proj-desc">Descrição</Label>
            <Textarea id="proj-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={500} rows={2} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Departamento *</Label>
              <Select value={form.departmentId} onValueChange={(v) => setForm({ ...form, departmentId: v })}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Sponsor</Label>
              <Select value={form.sponsorDepartmentId} onValueChange={(v) => setForm({ ...form, sponsorDepartmentId: v })}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Categoria *</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as StrategicCategory })}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="regulatorio">Regulatório</SelectItem>
                  <SelectItem value="operacional">Operacional</SelectItem>
                  <SelectItem value="inovacao">Inovação</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Prioridade *</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as Priority })}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="critica">Crítica</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Estado</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as ProjectStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="planeado">Planeado</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="em_pausa">Em Pausa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="proj-start">Data Início *</Label>
              <Input id="proj-start" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="proj-end">Data Fim *</Label>
              <Input id="proj-end" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Gestor *</Label>
              <Select value={form.managerId} onValueChange={(v) => setForm({ ...form, managerId: v })}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  {resources.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="proj-budget">Orçamento (€)</Label>
              <Input id="proj-budget" type="number" min={0} value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="0" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit">Criar Projeto</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectFormDialog;
