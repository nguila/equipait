import { CheckCircle2, AlertTriangle, XCircle, Lightbulb, FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type FieldStatus = "ok" | "warning" | "missing";

export interface PreviewField {
  key: string;
  label: string;
  raw: unknown;
  value: string | number | null;
  status: FieldStatus;
  message?: string;
  suggestion?: string;
}

interface Props {
  fields: PreviewField[];
  globalSuggestions: string[];
  duplicate: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const StatusIcon = ({ status }: { status: FieldStatus }) => {
  if (status === "ok") return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  if (status === "warning") return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  return <XCircle className="h-4 w-4 text-destructive" />;
};

const formatValue = (v: PreviewField["value"]) => {
  if (v == null || v === "") return "—";
  if (typeof v === "number") return v.toFixed(2);
  return String(v);
};

const ExtractedInvoicePreview = ({
  fields,
  globalSuggestions,
  duplicate,
  onConfirm,
  onCancel,
}: Props) => {
  const okCount = fields.filter((f) => f.status === "ok").length;
  const warnCount = fields.filter((f) => f.status === "warning").length;
  const missCount = fields.filter((f) => f.status === "missing").length;

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <FileSearch className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Pré-visualização da Fatura Extraída</h3>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="gap-1 border-green-500/40 text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-3 w-3" /> {okCount} válidos
          </Badge>
          {warnCount > 0 && (
            <Badge variant="outline" className="gap-1 border-yellow-500/40 text-yellow-600 dark:text-yellow-400">
              <AlertTriangle className="h-3 w-3" /> {warnCount} avisos
            </Badge>
          )}
          {missCount > 0 && (
            <Badge variant="outline" className="gap-1 border-destructive/40 text-destructive">
              <XCircle className="h-3 w-3" /> {missCount} em falta
            </Badge>
          )}
        </div>
      </div>

      {duplicate && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
          <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-destructive">Possível duplicado detetado</p>
            <p className="text-muted-foreground">
              Já existe uma fatura com o mesmo nº para este fornecedor. Confirme antes de gravar.
            </p>
          </div>
        </div>
      )}

      {globalSuggestions.length > 0 && (
        <div className="rounded-md border border-yellow-500/30 bg-yellow-500/5 p-3 text-sm space-y-1">
          <div className="flex items-center gap-2 font-medium text-yellow-600 dark:text-yellow-400">
            <Lightbulb className="h-4 w-4" /> Sugestões
          </div>
          <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
            {globalSuggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {fields.map((f) => (
          <div
            key={f.key}
            className={`rounded-md border p-3 text-sm space-y-1 ${
              f.status === "ok"
                ? "border-border bg-background"
                : f.status === "warning"
                ? "border-yellow-500/40 bg-yellow-500/5"
                : "border-destructive/40 bg-destructive/5"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-muted-foreground">{f.label}</span>
              <StatusIcon status={f.status} />
            </div>
            <div className="font-mono text-foreground break-all">{formatValue(f.value)}</div>
            {f.raw != null && String(f.raw) !== String(f.value ?? "") && (
              <div className="text-xs text-muted-foreground">
                Original: <span className="font-mono">{String(f.raw)}</span>
              </div>
            )}
            {f.message && (
              <div className="text-xs text-yellow-600 dark:text-yellow-400 flex items-start gap-1">
                <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                {f.message}
              </div>
            )}
            {f.suggestion && (
              <div className="text-xs text-primary flex items-start gap-1">
                <Lightbulb className="h-3 w-3 mt-0.5 shrink-0" />
                {f.suggestion}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={onConfirm}>
          Confirmar e Editar
        </Button>
      </div>
    </div>
  );
};

export default ExtractedInvoicePreview;
