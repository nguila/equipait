import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Paperclip, X, Upload } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface TicketFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
  departments: { id: string; name: string }[];
  profiles: { user_id: string; full_name: string | null }[];
  tickets: { id: string; ticket_number: number; title: string }[];
}

const CATEGORIES = [
  "Hardware", "Software", "Rede", "Email", "Impressoras",
  "Acessos", "Telefonia", "Outro",
];

const EQUIPMENT_TYPES = [
  "Servidor", "Portátil", "Desktop", "Impressora", "Quadro Interativo", "Smart TV", "Outro",
];

const OS_OPTIONS = [
  "Windows", "Linux", "macOS", "Outro",
];

const TicketFormDialog = ({ open, onOpenChange, onCreated, departments, profiles, tickets }: TicketFormDialogProps) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    category: "",
    department_id: "",
    assigned_to: "",
    due_date: "",
    due_time: "",
    sla_hours: "",
    tags: [] as string[],
    related_ticket_id: "",
    equipment_type: "",
    operating_system: "",
  });

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      setForm({ ...form, tags: [...form.tags, tag] });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setForm({ ...form, tags: form.tags.filter((t) => t !== tag) });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.title) return;
    setSubmitting(true);

    try {
      const extraTags: string[] = [...form.tags];

      // Combine date and time for due_date
      let dueDate: string | null = null;
      if (form.due_date) {
        dueDate = form.due_time ? `${form.due_date}T${form.due_time}` : form.due_date;
      }

      const { data: ticket, error } = await supabase
        .from("tickets")
        .insert({
          title: form.title,
          description: form.description || null,
          priority: form.priority,
          category: form.category || null,
          department_id: form.department_id || null,
          created_by: user.id,
          assigned_to: form.assigned_to || null,
          due_date: dueDate,
          sla_hours: form.sla_hours ? parseInt(form.sla_hours) : null,
          tags: extraTags,
          related_ticket_id: form.related_ticket_id || null,
          equipment_type: form.equipment_type || null,
          operating_system: form.operating_system || null,
        } as any)
        .select("id")
        .single();

      if (error) throw error;

      for (const file of files) {
        const filePath = `${user.id}/${ticket.id}/${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("attachments")
          .upload(filePath, file);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          continue;
        }

        await supabase.from("attachments").insert({
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          content_type: file.type,
          entity_type: "ticket",
          entity_id: ticket.id,
          uploaded_by: user.id,
        });
      }

      toast.success("Ticket criado com sucesso");
      setForm({ title: "", description: "", priority: "medium", category: "", department_id: "", assigned_to: "", due_date: "", due_time: "", sla_hours: "", tags: [], related_ticket_id: "", equipment_type: "", operating_system: "" });
      setFiles([]);
      onCreated();
      onOpenChange(false);
    } catch (err: any) {
      toast.error("Erro ao criar ticket: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Ticket</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <Label>Assunto *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={200} />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label>Descrição</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} />
            </div>

            <div className="space-y-1.5">
              <Label>Prioridade *</Label>
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

            <div className="space-y-1.5">
              <Label>Categoria</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Equipment & OS Section */}
            <Separator className="md:col-span-2" />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider md:col-span-2">Equipamento</p>

            <div className="space-y-1.5">
              <Label>Tipo de Equipamento</Label>
              <Select value={form.equipment_type} onValueChange={(v) => setForm({ ...form, equipment_type: v })}>
                <SelectTrigger><SelectValue placeholder="Selecionar equipamento" /></SelectTrigger>
                <SelectContent>
                  {EQUIPMENT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Sistema Operativo</Label>
              <Select value={form.operating_system} onValueChange={(v) => setForm({ ...form, operating_system: v })}>
                <SelectTrigger><SelectValue placeholder="Selecionar SO" /></SelectTrigger>
                <SelectContent>
                  {OS_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <Separator className="md:col-span-2" />

            <div className="space-y-1.5">
              <Label>Departamento</Label>
              <Select value={form.department_id} onValueChange={(v) => setForm({ ...form, department_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Atribuir a</Label>
              <Select value={form.assigned_to} onValueChange={(v) => setForm({ ...form, assigned_to: v })}>
                <SelectTrigger><SelectValue placeholder="Selecionar técnico" /></SelectTrigger>
                <SelectContent>
                  {profiles.map((p) => <SelectItem key={p.user_id} value={p.user_id}>{p.full_name || "Sem nome"}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Data Limite</Label>
              <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
            </div>

            <div className="space-y-1.5">
              <Label>Hora Limite</Label>
              <Input type="time" value={form.due_time} onChange={(e) => setForm({ ...form, due_time: e.target.value })} />
            </div>

            <div className="space-y-1.5">
              <Label>SLA (horas)</Label>
              <Input type="number" min="1" value={form.sla_hours} onChange={(e) => setForm({ ...form, sla_hours: e.target.value })} placeholder="Ex: 24" />
            </div>

            <div className="space-y-1.5">
              <Label>Ticket Relacionado</Label>
              <Select value={form.related_ticket_id} onValueChange={(v) => setForm({ ...form, related_ticket_id: v })}>
                <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
                <SelectContent>
                  {tickets.map((t) => <SelectItem key={t.id} value={t.id}>#{t.ticket_number} - {t.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Adicionar tag..."
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(); } }}
                />
                <Button type="button" variant="outline" size="sm" onClick={handleAddTag}>Adicionar</Button>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {form.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label>Anexos</Label>
              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} />
              <Button type="button" variant="outline" className="gap-2 w-full" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4" />
                Adicionar ficheiros
              </Button>
              {files.length > 0 && (
                <div className="space-y-1 mt-2">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center justify-between text-sm bg-muted rounded px-3 py-1.5">
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-3 w-3 text-muted-foreground" />
                        <span className="truncate max-w-[300px]">{f.name}</span>
                        <span className="text-muted-foreground">({(f.size / 1024).toFixed(0)} KB)</span>
                      </div>
                      <X className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-destructive" onClick={() => setFiles(files.filter((_, j) => j !== i))} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "A criar..." : "Criar Ticket"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TicketFormDialog;
