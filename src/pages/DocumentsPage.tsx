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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { FileText, Plus, Upload, Paperclip, Download, Loader2, Trash2, BookOpen, Tags, Pencil } from "lucide-react";
import ImportExportBar from "@/components/shared/ImportExportBar";

interface Doc {
  id: string;
  title: string;
  description: string | null;
  type: string;
  version: string | null;
  status: string;
  tags: string[];
  created_at: string;
  knowledge_area_id: string | null;
  technician_id: string | null;
}

interface Attachment {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  entity_id: string;
}

interface DocType {
  id: string;
  name: string;
  description: string | null;
}

interface KnowledgeArea {
  id: string;
  name: string;
  description: string | null;
}

interface Profile {
  user_id: string;
  full_name: string | null;
  email: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Rascunho", pending: "Pendente", approved: "Aprovado", archived: "Arquivado",
};

const DocumentsPage = () => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [docTypes, setDocTypes] = useState<DocType[]>([]);
  const [knowledgeAreas, setKnowledgeAreas] = useState<KnowledgeArea[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Doc | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [technicianFilter, setTechnicianFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", type: "", department_id: "", tags: "", knowledge_area_id: "", technician_id: "", status: "draft" });
  const [customFields, setCustomFields] = useState<{ name: string; value: string }[]>([]);

  // Type/Area management
  const [typeFormOpen, setTypeFormOpen] = useState(false);
  const [areaFormOpen, setAreaFormOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [newAreaName, setNewAreaName] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const [docsRes, attsRes, deptsRes, typesRes, areasRes, profilesRes] = await Promise.all([
      supabase.from("documents").select("*").order("created_at", { ascending: false }),
      supabase.from("attachments").select("id, file_name, file_path, file_size, entity_id").eq("entity_type", "document"),
      supabase.from("departments").select("id, name"),
      supabase.from("document_types").select("*").order("name"),
      supabase.from("knowledge_areas").select("*").order("name"),
      supabase.from("profiles").select("user_id, full_name, email"),
    ]);
    if (docsRes.data) setDocs(docsRes.data as Doc[]);
    if (attsRes.data) setAttachments(attsRes.data);
    if (deptsRes.data) setDepartments(deptsRes.data);
    if (typesRes.data) setDocTypes(typesRes.data);
    if (areasRes.data) setKnowledgeAreas(areasRes.data);
    if (profilesRes.data) setProfiles(profilesRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const getTechnicianName = (techId: string | null) => {
    if (!techId) return "—";
    const p = profiles.find((pr) => pr.user_id === techId);
    return p?.full_name || p?.email || "—";
  };

  const filtered = docs.filter((d) => {
    if (typeFilter !== "all" && d.type !== typeFilter) return false;
    if (statusFilter !== "all" && d.status !== statusFilter) return false;
    if (technicianFilter !== "all" && d.technician_id !== technicianFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const techName = getTechnicianName(d.technician_id).toLowerCase();
      if (!d.title.toLowerCase().includes(q) && !(d.description || "").toLowerCase().includes(q) && !techName.includes(q) && !(d.tags || []).some(t => t.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  const resetForm = () => {
    setForm({ title: "", description: "", type: "", department_id: "", tags: "", knowledge_area_id: "", technician_id: "", status: "draft" });
    setFiles([]);
    setCustomFields([]);
    setEditingDoc(null);
  };

  const openCreate = () => {
    resetForm();
    setFormOpen(true);
  };

  const openEdit = async (doc: Doc) => {
    setEditingDoc(doc);
    setForm({
      title: doc.title,
      description: doc.description || "",
      type: doc.type,
      department_id: "",
      tags: (doc.tags || []).join(", "),
      knowledge_area_id: doc.knowledge_area_id || "",
      technician_id: doc.technician_id || "",
      status: doc.status,
    });
    // Load custom fields
    const { data } = await supabase.from("document_custom_fields").select("*").eq("document_id", doc.id);
    setCustomFields((data || []).map((f: any) => ({ name: f.field_name, value: f.field_value || "" })));
    setFiles([]);
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.title) return;
    setSubmitting(true);

    try {
      const payload = {
        title: form.title,
        description: form.description || null,
        type: form.type || "outro",
        department_id: form.department_id || null,
        knowledge_area_id: form.knowledge_area_id || null,
        technician_id: form.technician_id || null,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        status: form.status || "draft",
      };

      let docId: string;

      if (editingDoc) {
        const { error } = await supabase.from("documents").update(payload).eq("id", editingDoc.id);
        if (error) throw error;
        docId = editingDoc.id;

        // Update custom fields: delete old, insert new
        await supabase.from("document_custom_fields").delete().eq("document_id", docId);
      } else {
        const { data: doc, error } = await supabase
          .from("documents")
          .insert({ ...payload, created_by: user.id })
          .select("id")
          .single();
        if (error) throw error;
        docId = doc.id;
      }

      // Save custom fields
      if (customFields.length > 0) {
        const fieldsToInsert = customFields
          .filter((f) => f.name.trim())
          .map((f) => ({ document_id: docId, field_name: f.name, field_value: f.value }));
        if (fieldsToInsert.length > 0) {
          await supabase.from("document_custom_fields").insert(fieldsToInsert);
        }
      }

      // Upload files
      for (const file of files) {
        const filePath = `${user.id}/${docId}/${file.name}`;
        const { error: uploadError } = await supabase.storage.from("attachments").upload(filePath, file);
        if (uploadError) { console.error(uploadError); continue; }
        await supabase.from("attachments").insert({
          file_name: file.name, file_path: filePath, file_size: file.size,
          content_type: file.type, entity_type: "document", entity_id: docId, uploaded_by: user.id,
        });
      }

      toast.success(editingDoc ? "Documento atualizado com sucesso" : "Documento criado com sucesso");
      resetForm();
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
    a.href = url; a.download = fileName; a.click();
    URL.revokeObjectURL(url);
  };

  const addDocType = async () => {
    if (!newTypeName.trim()) return;
    const { error } = await supabase.from("document_types").insert({ name: newTypeName.trim() });
    if (error) { toast.error(error.message); return; }
    toast.success("Tipo adicionado");
    setNewTypeName("");
    setTypeFormOpen(false);
    fetchData();
  };

  const deleteDocType = async (id: string) => {
    const { error } = await supabase.from("document_types").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Tipo eliminado");
    fetchData();
  };

  const addKnowledgeArea = async () => {
    if (!newAreaName.trim()) return;
    const { error } = await supabase.from("knowledge_areas").insert({ name: newAreaName.trim() });
    if (error) { toast.error(error.message); return; }
    toast.success("Área adicionada");
    setNewAreaName("");
    setAreaFormOpen(false);
    fetchData();
  };

  const deleteKnowledgeArea = async (id: string) => {
    const { error } = await supabase.from("knowledge_areas").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Área eliminada");
    fetchData();
  };

  const deleteDocument = async (id: string) => {
    if (!confirm("Eliminar documento?")) return;
    const docAtts = attachments.filter(a => a.entity_id === id);
    for (const att of docAtts) {
      await supabase.storage.from("attachments").remove([att.file_path]);
      await supabase.from("attachments").delete().eq("id", att.id);
    }
    await supabase.from("document_custom_fields").delete().eq("document_id", id);
    const { error } = await supabase.from("documents").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Documento eliminado");
    fetchData();
  };

  const getTechnicianName = (techId: string | null) => {
    if (!techId) return "—";
    const p = profiles.find((pr) => pr.user_id === techId);
    return p?.full_name || p?.email || "—";
  };

  const exportColumns = [
    { key: "title", label: "Título" },
    { key: "type", label: "Tipo" },
    { key: "status", label: "Estado" },
    { key: "version", label: "Versão" },
    { key: "created_at", label: "Data Criação" },
  ];

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            Documentos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Repositório de documentação com anexos e numeração automática</p>
        </div>
        <div className="flex items-center gap-2">
          <ImportExportBar data={filtered} columns={exportColumns} moduleName="Documentos" />
          <Button className="gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Novo Documento
          </Button>
        </div>
      </div>

      <Tabs defaultValue="documentos" className="w-full">
        <TabsList>
          <TabsTrigger value="documentos" className="gap-1.5"><FileText className="h-4 w-4" /> Documentos</TabsTrigger>
          <TabsTrigger value="tipos" className="gap-1.5"><Tags className="h-4 w-4" /> Tipos</TabsTrigger>
          <TabsTrigger value="areas" className="gap-1.5"><BookOpen className="h-4 w-4" /> Áreas de Conhecimento</TabsTrigger>
        </TabsList>

        <TabsContent value="documentos" className="space-y-4 mt-4">
          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="Pesquisar documentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 h-9 text-sm"
            />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-44 h-9 text-sm">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {docTypes.map((t) => <SelectItem key={t.id} value={t.name.toLowerCase()}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44 h-9 text-sm">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os estados</SelectItem>
                {Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={technicianFilter} onValueChange={setTechnicianFilter}>
              <SelectTrigger className="w-48 h-9 text-sm">
                <SelectValue placeholder="Técnico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os técnicos</SelectItem>
                {profiles.map((p) => <SelectItem key={p.user_id} value={p.user_id}>{p.full_name || p.email || p.user_id}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">Nenhum documento encontrado</CardContent></Card>
          ) : (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Documento</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tipo</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Área</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Técnico</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estado</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Anexos</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tags</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((doc) => {
                    const docAttachments = attachments.filter((a) => a.entity_id === doc.id);
                    const area = knowledgeAreas.find((a) => a.id === doc.knowledge_area_id);
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
                        <td className="px-5 py-3.5 text-sm text-muted-foreground capitalize">{doc.type}</td>
                        <td className="px-5 py-3.5 text-sm text-muted-foreground">{area?.name || "—"}</td>
                        <td className="px-5 py-3.5 text-sm text-muted-foreground">{getTechnicianName(doc.technician_id)}</td>
                        <td className="px-5 py-3.5">
                          <Badge variant="secondary">{STATUS_LABELS[doc.status] || doc.status}</Badge>
                        </td>
                        <td className="px-5 py-3.5">
                          {docAttachments.length > 0 ? (
                            <div className="space-y-1">
                              {docAttachments.map((a) => (
                                <button key={a.id} className="flex items-center gap-1 text-xs text-primary hover:underline"
                                  onClick={() => downloadFile(a.file_path, a.file_name)}>
                                  <Download className="h-3 w-3" />{a.file_name}
                                </button>
                              ))}
                            </div>
                          ) : <span className="text-xs text-muted-foreground">—</span>}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex flex-wrap gap-1">
                            {(doc.tags || []).slice(0, 3).map((t) => (
                              <span key={t} className="bg-secondary px-1.5 py-0.5 rounded text-[10px] font-medium text-secondary-foreground">{t}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1">
                            <Button size="icon" variant="ghost" onClick={() => openEdit(doc)}>
                              <Pencil className="h-4 w-4 text-muted-foreground" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => deleteDocument(doc.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        {/* Tipos de Documento */}
        <TabsContent value="tipos" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Defina os tipos de documento disponíveis no sistema.</p>
            <Button size="sm" className="gap-1.5" onClick={() => setTypeFormOpen(true)}><Plus className="h-4 w-4" /> Novo Tipo</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {docTypes.map((t) => (
              <Card key={t.id}>
                <CardContent className="pt-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-card-foreground">{t.name}</p>
                    {t.description && <p className="text-xs text-muted-foreground">{t.description}</p>}
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => deleteDocType(t.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <Dialog open={typeFormOpen} onOpenChange={setTypeFormOpen}>
            <DialogContent className="max-w-sm">
              <DialogHeader><DialogTitle>Novo Tipo de Documento</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Nome do tipo" value={newTypeName} onChange={(e) => setNewTypeName(e.target.value)} />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setTypeFormOpen(false)}>Cancelar</Button>
                  <Button onClick={addDocType}>Criar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Áreas de Conhecimento */}
        <TabsContent value="areas" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Organize documentos por áreas de conhecimento.</p>
            <Button size="sm" className="gap-1.5" onClick={() => setAreaFormOpen(true)}><Plus className="h-4 w-4" /> Nova Área</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {knowledgeAreas.map((a) => (
              <Card key={a.id}>
                <CardContent className="pt-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-card-foreground">{a.name}</p>
                    {a.description && <p className="text-xs text-muted-foreground">{a.description}</p>}
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => deleteKnowledgeArea(a.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <Dialog open={areaFormOpen} onOpenChange={setAreaFormOpen}>
            <DialogContent className="max-w-sm">
              <DialogHeader><DialogTitle>Nova Área de Conhecimento</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Nome da área" value={newAreaName} onChange={(e) => setNewAreaName(e.target.value)} />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setAreaFormOpen(false)}>Cancelar</Button>
                  <Button onClick={addKnowledgeArea}>Criar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Document Dialog */}
      <Dialog open={formOpen} onOpenChange={(open) => { if (!open) resetForm(); setFormOpen(open); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingDoc ? "Editar Documento" : "Novo Documento"}</DialogTitle></DialogHeader>
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
                  <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent>
                    {docTypes.map((t) => <SelectItem key={t.id} value={t.name.toLowerCase()}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Estado</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="approved">Aprovado</SelectItem>
                    <SelectItem value="archived">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Área de Conhecimento</Label>
              <Select value={form.knowledge_area_id} onValueChange={(v) => setForm({ ...form, knowledge_area_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  {knowledgeAreas.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Técnico que elaborou</Label>
              <Select value={form.technician_id} onValueChange={(v) => setForm({ ...form, technician_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecionar técnico" /></SelectTrigger>
                <SelectContent>
                  {profiles.map((p) => (
                    <SelectItem key={p.user_id} value={p.user_id}>{p.full_name || p.email || p.user_id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Tags (separadas por vírgula)</Label>
              <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="ex: financeiro, RH, urgente" />
            </div>

            {/* Custom Fields */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Campos Personalizados</Label>
                <Button type="button" size="sm" variant="outline" onClick={() => setCustomFields([...customFields, { name: "", value: "" }])}>
                  <Plus className="h-3 w-3 mr-1" /> Campo
                </Button>
              </div>
              {customFields.map((f, i) => (
                <div key={i} className="grid grid-cols-5 gap-2">
                  <Input className="col-span-2" placeholder="Nome" value={f.name}
                    onChange={(e) => { const cf = [...customFields]; cf[i].name = e.target.value; setCustomFields(cf); }} />
                  <Input className="col-span-2" placeholder="Valor" value={f.value}
                    onChange={(e) => { const cf = [...customFields]; cf[i].value = e.target.value; setCustomFields(cf); }} />
                  <Button type="button" size="icon" variant="ghost" onClick={() => setCustomFields(customFields.filter((_, j) => j !== i))}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
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
              <Button type="button" variant="outline" onClick={() => { resetForm(); setFormOpen(false); }}>Cancelar</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (editingDoc ? "A guardar..." : "A criar...") : (editingDoc ? "Guardar Alterações" : "Criar Documento")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentsPage;
