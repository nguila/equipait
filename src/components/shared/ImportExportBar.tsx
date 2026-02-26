import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, Upload, FileDown, Database } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { toast } from "sonner";
import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_ROWS = 10000;
const MAX_FIELD_LENGTH = 500;

interface Column {
  key: string;
  label: string;
}

interface ImportExportBarProps {
  data: Record<string, any>[];
  columns: Column[];
  moduleName: string;
  onImport?: (rows: Record<string, any>[]) => void;
}

const ImportExportBar = ({ data, columns, moduleName, onImport }: ImportExportBarProps) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const exportToExcel = () => {
    const rows = data.map((item) =>
      Object.fromEntries(columns.map((c) => [c.label, item[c.key] ?? ""]))
    );
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, moduleName);
    XLSX.writeFile(wb, `${moduleName.toLowerCase().replace(/\s/g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success("Ficheiro Excel exportado.");
  };

  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: data.length > 0 && columns.length > 5 ? "landscape" : "portrait" });
    doc.setFontSize(16);
    doc.text(moduleName, 14, 20);
    doc.setFontSize(9);
    doc.text(`Exportado em ${new Date().toLocaleDateString("pt-PT")}`, 14, 28);

    const headers = columns.map((c) => c.label);
    const body = data.map((item) => columns.map((c) => String(item[c.key] ?? "")));

    (doc as any).autoTable({
      head: [headers],
      body,
      startY: 34,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save(`${moduleName.toLowerCase().replace(/\s/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success("Ficheiro PDF exportado.");
  };

  const exportToPowerBI = () => {
    // Export as CSV (Power BI compatible format)
    const headers = columns.map((c) => c.label).join(",");
    const rows = data.map((item) =>
      columns.map((c) => {
        const val = String(item[c.key] ?? "").replace(/"/g, '""');
        return `"${val}"`;
      }).join(",")
    );
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${moduleName.toLowerCase().replace(/\s/g, "_")}_powerbi_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Ficheiro CSV para Power BI exportado.");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImport) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Ficheiro demasiado grande. Máximo: 5MB.");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target?.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, any>>(ws);

        if (rows.length > MAX_ROWS) {
          toast.error(`Ficheiro excede o limite de ${MAX_ROWS} linhas.`);
          return;
        }

        // Build a dynamic zod schema from column definitions
        const fieldSchemas: Record<string, z.ZodTypeAny> = {};
        for (const col of columns) {
          fieldSchemas[col.key] = z.union([
            z.string().max(MAX_FIELD_LENGTH),
            z.number(),
          ]).optional();
        }
        const RowSchema = z.object(fieldSchemas);

        const validRows: Record<string, any>[] = [];
        let skipped = 0;

        rows.forEach((row) => {
          const rawMapped: Record<string, any> = {};
          for (const col of columns) {
            if (row[col.label] !== undefined) {
              const val = row[col.label];
              rawMapped[col.key] = typeof val === "string" ? val.slice(0, MAX_FIELD_LENGTH) : val;
            }
          }
          const parsed = RowSchema.safeParse(rawMapped);
          if (parsed.success) {
            validRows.push(parsed.data);
          } else {
            skipped++;
          }
        });

        if (validRows.length === 0) {
          toast.error("Nenhum registo válido encontrado no ficheiro.");
          return;
        }

        onImport(validRows);
        const msg = skipped > 0
          ? `${validRows.length} registos importados. ${skipped} linhas ignoradas por dados inválidos.`
          : `${validRows.length} registos importados.`;
        toast.success(msg);
      } catch {
        toast.error("Erro ao ler ficheiro. Verifique o formato.");
      }
    };
    reader.readAsBinaryString(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="outline" className="gap-1.5" onClick={exportToExcel}>
        <Download className="h-4 w-4" /> Excel
      </Button>
      <Button size="sm" variant="outline" className="gap-1.5" onClick={exportToPDF}>
        <FileDown className="h-4 w-4" /> PDF
      </Button>
      <Button size="sm" variant="outline" className="gap-1.5" onClick={exportToPowerBI}>
        <Database className="h-4 w-4" /> Power BI
      </Button>
      {onImport && (
        <>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" /> Importar
          </Button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImport} />
        </>
      )}
    </div>
  );
};

export default ImportExportBar;
