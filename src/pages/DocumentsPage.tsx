import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { FileText, Plus, Upload, Paperclip, Download, Loader2 } from "lucide-react";

interface Doc {
  id: string;
  title: string;
  description: string | null;
  type: string;
  version: string | null;
  status: string;
  tags: string[];
  created_at: string;
}

interface Attachment {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  entity_id: string;
}

const TYPE_LABELS: Record<string, string> = {
  plano: "Plano", relatorio: "Relatório", procedimento: "Procedimento",
  contrato: "Contrato", decisao: "Decisão", template: "Template", outro: "Outro",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Rascunho", pending: "Pendente", approved: "Aprovado", archived: "Arquivado",
};

const DocumentsPage = () => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", type: "outro", department_id: "", tags: "" });

  const fetchData = async () => {
    setLoading(true);
    const [docsRes, attsRes, deptsRes] = await Promise.all([
      supabase.from("documents").select("*").order("created_at", { ascending: false }),
      supabase.from("attachments").select("id, file_name, file_path, file_size, entity_id").eq("entity_type", "document"),
      supabase.from("departments").select("id, name"),
    ]);
    if (docsRes.data) setDocs(docsRes.data as Doc[]);
    if (attsRes.data) setAttachments(attsRes.data);
    if (deptsRes.data) setDepartments(deptsRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = docs.filter((d) => typeFilter === "all" || d.type === typeFilter);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.title) return;
    setSubmitting(true);

    try {
      const { data: doc, error } = await supabase
        .from("documents")
        .insert({
          title: form.title,
          description: form.description || null,
          type: form.type,
          department_id: form.department_id || null,
          created_by: user.id,
          tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        })
        .select("id")
        .single();

      if (error) throw error;

      for (const file of files) {
        const filePath = `${user.id}/${doc.id}/${file.name}`;
        const { error: uploadError } = await supabase.storage.from("attachments").upload(filePath, file);
        if (uploadError) { console.error(uploadError); continue; }
        await supabase.from("attachments").insert({
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          content_type: file.type,
          entity_type: "document",
          entity_id: doc.id,
          uploaded_by: user.id,
        });
      }

      toast.success("Documento criado com sucesso");
      setForm({ title: "", description: "", type: "outro", department_id: "", tags: "" });
      setFiles([]);
      setFormOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error("Erro: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const downloadFile = async (filePath: string, fileName: string) => {
    const { data, error } = await supabase.storage.from("attachments").download(filePath);
    if (error) { toast.error("Erro ao descarregar"); return; }
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Documentos</h1>
          <p className="text-sm text-muted-foreground">Repositório de documentação com anexos</p>
        </div>
        <Button className="gap-2" onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" /> Novo Documento
        </Button>
      </div>

      <Select value={typeFilter} onValueChange={setTypeFilter}>
        <SelectTrigger className="w-44 h-9 text-sm">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os tipos</SelectItem>
          {Object.entries(TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
        </SelectContent>
      </Select>

      {filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Nenhum documento encontrado</CardContent></Card>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Documento</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tipo</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estado</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Anexos</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((doc) => {
                const docAttachments = attachments.filter((a) => a.entity_id === doc.id);
                return (
                  <tr key={doc.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <span className="text-sm font-medium text-card-foreground">{doc.title}</span>
                          {doc.description && <p className="text-xs text-muted-foreground line-clamp-1">{doc.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{TYPE_LABELS[doc.type] || doc.type}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant="secondary">{STATUS_LABELS[doc.status] || doc.status}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      {docAttachments.length > 0 ? (
                        <div className="space-y-1">
                          {docAttachments.map((a) => (
                            <button
                              key={a.id}
                              className="flex items-center gap-1 text-xs text-primary hover:underline"
                              onClick={() => downloadFile(a.file_path, a.file_name)}
                            >
                              <Download className="h-3 w-3" />{a.file_name}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {(doc.tags || []).slice(0, 3).map((t) => (
                          <span key={t} className="bg-secondary px-1.5 py-0.5 rounded text-[10px] font-medium text-secondary-foreground">{t}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Document Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Novo Documento</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Título *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Departamento</Label>
                <Select value={form.department_id} onValueChange={(v) => setForm({ ...form, department_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Tags (separadas por vírgula)</Label>
              <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="ex: financeiro, RH, urgente" />
            </div>
            <div className="space-y-1.5">
              <Label>Anexos</Label>
              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => { if (e.target.files) setFiles((prev) => [...prev, ...Array.from(e.target.files!)]); }} />
              <Button type="button" variant="outline" className="gap-2 w-full" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4" /> Adicionar ficheiros
              </Button>
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm bg-muted rounded px-3 py-1.5">
                  <Paperclip className="h-3 w-3 text-muted-foreground" />
                  <span className="truncate">{f.name}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "A criar..." : "Criar Documento"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentsPage;
