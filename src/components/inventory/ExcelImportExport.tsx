import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { type InventoryItem } from "@/data/mockData";
import { toast } from "sonner";
import { useRef } from "react";
import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_ROWS = 10000;

const InventoryRowSchema = z.object({
  code: z.string().trim().min(1, "Código obrigatório").max(50, "Código demasiado longo"),
  name: z.string().trim().min(1, "Nome obrigatório").max(200, "Nome demasiado longo"),
  category: z.string().trim().max(100).default(""),
  warehouse: z.string().trim().max(200).default(""),
  department: z.string().trim().max(200).default(""),
  totalQty: z.number().int().min(0).max(1_000_000).default(0),
  availableQty: z.number().int().min(0).max(1_000_000).default(0),
  minStock: z.number().int().min(0).max(1_000_000).default(0),
  maxStock: z.number().int().min(0).max(1_000_000).default(0),
  unit: z.string().trim().min(1).max(20).default("un"),
});

interface Props {
  products: InventoryItem[];
  onImport: (items: InventoryItem[]) => void;
}

const ExcelImportExport = ({ products, onImport }: Props) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const exportToExcel = () => {
    const data = products.map(p => ({
      Código: p.code,
      Nome: p.name,
      Categoria: p.category,
      Armazém: p.location || "",
      Departamento: "",
      "Qtd. Total": p.totalQty,
      "Qtd. Disponível": p.availableQty,
      "Stock Mín.": p.minStock,
      "Stock Máx.": p.maxStock,
      Unidade: p.unit,
      Estado: p.status,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventário");
    XLSX.writeFile(wb, `inventario_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success("Ficheiro Excel exportado.");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
        const data = XLSX.utils.sheet_to_json<Record<string, string | number>>(ws);

        if (data.length > MAX_ROWS) {
          toast.error(`Ficheiro excede o limite de ${MAX_ROWS} linhas.`);
          return;
        }

        const validItems: InventoryItem[] = [];
        let skipped = 0;

        data.forEach((row, idx) => {
          const parsed = InventoryRowSchema.safeParse({
            code: row["Código"] != null ? String(row["Código"]) : "",
            name: row["Nome"] != null ? String(row["Nome"]) : "",
            category: row["Categoria"] != null ? String(row["Categoria"]) : "",
            warehouse: row["Armazém"] != null ? String(row["Armazém"]) : "",
            department: row["Departamento"] != null ? String(row["Departamento"]) : "",
            totalQty: Number(row["Qtd. Total"]) || 0,
            availableQty: Number(row["Qtd. Disponível"]) || 0,
            minStock: Number(row["Stock Mín."]) || 0,
            maxStock: Number(row["Stock Máx."]) || 0,
            unit: row["Unidade"] != null ? String(row["Unidade"]) : "un",
          });

          if (parsed.success) {
            validItems.push({
              id: `imp_${Date.now()}_${idx}`,
              code: parsed.data.code,
              name: parsed.data.name,
              category: parsed.data.category,
              location: parsed.data.warehouse,
              warehouseId: "",
              locationId: "",
              departmentId: "",
              totalQty: parsed.data.totalQty,
              availableQty: parsed.data.availableQty,
              minStock: parsed.data.minStock,
              maxStock: parsed.data.maxStock,
              unit: parsed.data.unit,
              status: "ativo" as const,
            });
          } else {
            skipped++;
          }
        });

        if (validItems.length === 0) {
          toast.error("Nenhum registo válido encontrado no ficheiro.");
          return;
        }

        onImport(validItems);
        const msg = skipped > 0
          ? `${validItems.length} produtos importados. ${skipped} linhas ignoradas por dados inválidos.`
          : `${validItems.length} produtos importados.`;
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
        <Download className="h-4 w-4" /> Exportar Excel
      </Button>
      <Button size="sm" variant="outline" className="gap-1.5" onClick={() => fileRef.current?.click()}>
        <Upload className="h-4 w-4" /> Importar Excel
      </Button>
      <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImport} />
    </div>
  );
};

export default ExcelImportExport;
