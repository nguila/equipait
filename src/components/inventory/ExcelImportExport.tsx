import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { type InventoryItem } from "@/data/mockData";
import { toast } from "sonner";
import { useRef } from "react";

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
      Localização: p.location,
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
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target?.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json<Record<string, string | number>>(ws);
        const items: InventoryItem[] = data.map((row, idx) => ({
          id: `imp_${Date.now()}_${idx}`,
          code: String(row["Código"] || ""),
          name: String(row["Nome"] || ""),
          category: String(row["Categoria"] || ""),
          location: String(row["Localização"] || ""),
          warehouseId: "",
          locationId: "",
          departmentId: "",
          totalQty: Number(row["Qtd. Total"]) || 0,
          availableQty: Number(row["Qtd. Disponível"]) || 0,
          minStock: Number(row["Stock Mín."]) || 0,
          maxStock: Number(row["Stock Máx."]) || 0,
          unit: String(row["Unidade"] || "un"),
          status: "ativo" as const,
        }));
        onImport(items);
        toast.success(`${items.length} produtos importados.`);
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
