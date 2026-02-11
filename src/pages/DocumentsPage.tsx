import { documents, departments, projects, resources } from "@/data/mockData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import StatusBadge from "@/components/shared/StatusBadge";
import { FileText, ExternalLink } from "lucide-react";

const typeLabels: Record<string, string> = {
  plano: "Plano",
  relatorio: "Relatório",
  procedimento: "Procedimento",
  contrato: "Contrato",
  decisao: "Decisão",
  template: "Template",
  outro: "Outro",
};

const DocumentsPage = () => {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");

  const filtered = documents.filter((d) => {
    if (typeFilter !== "all" && d.type !== typeFilter) return false;
    if (deptFilter !== "all" && d.departmentId !== deptFilter) return false;
    return true;
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Documentos</h1>
        <p className="text-sm text-muted-foreground">Repositório de documentação e conhecimento</p>
      </div>

      <div className="flex items-center gap-3">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-44 h-9 text-sm">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {Object.entries(typeLabels).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-52 h-9 text-sm">
            <SelectValue placeholder="Departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os departamentos</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Documento</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tipo</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Projeto</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Proprietário</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Versão</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estado</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tags</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((doc) => {
              const project = doc.projectId ? projects.find((p) => p.id === doc.projectId) : null;
              const owner = resources.find((r) => r.id === doc.ownerId);
              return (
                <tr key={doc.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium text-card-foreground">{doc.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground">{typeLabels[doc.type]}</td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground">{project?.name || "—"}</td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground">{owner?.name || "—"}</td>
                  <td className="px-5 py-3.5 text-sm font-mono text-muted-foreground">v{doc.version}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={doc.approvalStatus} /></td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {doc.tags.slice(0, 3).map((t) => (
                        <span key={t} className="inline-flex items-center rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-3.5">
                    <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentsPage;
