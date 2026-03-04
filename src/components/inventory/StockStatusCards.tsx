import { type InventoryItem } from "@/data/mockData";
import { Package, User } from "lucide-react";

interface Props {
  products: InventoryItem[];
}

const StockStatusCards = ({ products }: Props) => {
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === "ativo");
  const inactiveProducts = products.filter(p => p.status === "inativo");

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Package className="h-5 w-5" />
            <span className="text-sm font-medium">Total Produtos</span>
          </div>
          <p className="text-3xl font-bold text-card-foreground">{totalProducts}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 space-y-2">
          <div className="flex items-center gap-2 text-success">
            <Package className="h-5 w-5" />
            <span className="text-sm font-medium">Ativos</span>
          </div>
          <p className="text-3xl font-bold text-success">{activeProducts.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Package className="h-5 w-5" />
            <span className="text-sm font-medium">Inativos</span>
          </div>
          <p className="text-3xl font-bold text-muted-foreground">{inactiveProducts.length}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-muted/50">
          <h3 className="text-sm font-semibold text-card-foreground">Produtos por Utilizador</h3>
        </div>
        <div className="divide-y divide-border">
          {products.map(p => (
            <div key={p.id} className="px-5 py-3.5 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-card-foreground">{p.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">{p.code} · {p.category}</p>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm text-card-foreground">{p.userName || "—"}</span>
              </div>
              <div className="text-right w-20">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.status === "ativo" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                  {p.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StockStatusCards;
