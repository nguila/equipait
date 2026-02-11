import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { departments, type Resource } from "@/data/mockData";

interface ResourceFormDialogProps {
  onAdd: (resource: Resource) => void;
}

const ResourceFormDialog = ({ onAdd }: ResourceFormDialogProps) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
    departmentId: "",
    weeklyCapacity: "40",
    skillInput: "",
  });
  const [skills, setSkills] = useState<string[]>([]);

  const addSkill = () => {
    const s = form.skillInput.trim();
    if (s && !skills.includes(s)) {
      setSkills([...skills, s]);
      setForm({ ...form, skillInput: "" });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.role || !form.departmentId) return;

    const newResource: Resource = {
      id: `r${Date.now()}`,
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role.trim(),
      departmentId: form.departmentId,
      skills,
      weeklyCapacity: Number(form.weeklyCapacity) || 40,
      currentAllocation: 0,
      status: "ativo",
    };

    onAdd(newResource);
    setForm({ name: "", email: "", role: "", departmentId: "", weeklyCapacity: "40", skillInput: "" });
    setSkills([]);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" /> Novo Recurso
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Recurso</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="r-name">Nome *</Label>
              <Input id="r-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="r-email">Email *</Label>
              <Input id="r-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={255} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="r-role">Função *</Label>
              <Input id="r-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Ex: Engenheiro Full-Stack" maxLength={100} required />
            </div>
            <div className="space-y-1.5">
              <Label>Departamento *</Label>
              <Select value={form.departmentId} onValueChange={(v) => setForm({ ...form, departmentId: v })}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="r-cap">Capacidade Semanal (h)</Label>
            <Input id="r-cap" type="number" min={1} max={80} value={form.weeklyCapacity} onChange={(e) => setForm({ ...form, weeklyCapacity: e.target.value })} />
          </div>

          <div className="space-y-1.5">
            <Label>Competências</Label>
            <div className="flex gap-2">
              <Input
                value={form.skillInput}
                onChange={(e) => setForm({ ...form, skillInput: e.target.value })}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                placeholder="Ex: React"
                maxLength={30}
              />
              <Button type="button" variant="outline" size="sm" onClick={addSkill}>+</Button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {skills.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                    {s}
                    <button type="button" onClick={() => setSkills(skills.filter((sk) => sk !== s))}><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit">Adicionar Recurso</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ResourceFormDialog;
