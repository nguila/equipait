import { inventoryItems, departments } from "@/data/mockData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import StatusBadge from "@/components/shared/StatusBadge";
import { AlertTriangle, Package } from "lucide-react";

const InventoryPage = () => {
  const [catFilter, setCatFilter] = useState<string>("all");
  const categories = [...new Set(inventoryItems.map((i) => i.category))];

  const filtered = inventoryItems.filter((i) => {
    if (catFilter !== "all" && i.category !== catFilter) return false;
    return true;
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Inventário & Ativos</h1>
        <p className="text-sm text-muted-foreground">Gestão de equipamentos, licenças e materiais</p>
      </div>

      <div className="flex items-center gap-3">
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-52 h-9 text-sm">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Código</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Item</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Categoria</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Localização</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Departamento</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Disponível</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((item) => {
              const dept = departments.find((d) => d.id === item.departmentId);
              const lowStock = item.availableQty <= 3;
              return (
                <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-mono text-muted-foreground">{item.code}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-card-foreground">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground">{item.category}</td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground">{item.location}</td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground">{dept?.name}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${lowStock ? "text-destructive" : "text-card-foreground"}`}>
                        {item.availableQty}/{item.totalQty}
                      </span>
                      {lowStock && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
                    </div>
                  </td>
                  <td className="px-5 py-3.5"><StatusBadge status={item.status === "ativo" ? "operacional" : "inativo"} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryPage;
