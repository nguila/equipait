import { type InventoryItem } from "@/data/mockData";
import { AlertTriangle, CheckCircle, Package, TrendingDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Props {
  products: InventoryItem[];
}

const StockStatusCards = ({ products }: Props) => {
  const totalProducts = products.length;
  const lowStock = products.filter(p => p.availableQty <= p.minStock);
  const healthyStock = products.filter(p => p.availableQty > p.minStock);
  const outOfStock = products.filter(p => p.availableQty === 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5 space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Package className="h-5 w-5" />
            <span className="text-sm font-medium">Total Produtos</span>
          </div>
          <p className="text-3xl font-bold text-card-foreground">{totalProducts}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 space-y-2">
          <div className="flex items-center gap-2 text-success">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Stock Saudável</span>
          </div>
          <p className="text-3xl font-bold text-success">{healthyStock.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 space-y-2">
          <div className="flex items-center gap-2 text-warning">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm font-medium">Stock Baixo</span>
          </div>
          <p className="text-3xl font-bold text-warning">{lowStock.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 space-y-2">
          <div className="flex items-center gap-2 text-destructive">
            <TrendingDown className="h-5 w-5" />
            <span className="text-sm font-medium">Sem Stock</span>
          </div>
          <p className="text-3xl font-bold text-destructive">{outOfStock.length}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-muted/50">
          <h3 className="text-sm font-semibold text-card-foreground">Estado do Stock por Produto</h3>
        </div>
        <div className="divide-y divide-border">
          {products.map(p => {
            const pct = p.maxStock > 0 ? Math.round((p.availableQty / p.maxStock) * 100) : 0;
            const isLow = p.availableQty <= p.minStock;
            const isEmpty = p.availableQty === 0;
            return (
              <div key={p.id} className="px-5 py-3.5 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-card-foreground">{p.name}</span>
                    {isLow && <AlertTriangle className="h-3.5 w-3.5 text-warning" />}
                    {isEmpty && <span className="text-xs text-destructive font-medium">ESGOTADO</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">{p.code} · {p.category}</p>
                </div>
                <div className="w-40 flex items-center gap-2">
                  <Progress value={pct} className={`h-2 flex-1 ${isEmpty ? "[&>div]:bg-destructive" : isLow ? "[&>div]:bg-warning" : ""}`} />
                  <span className="text-xs font-medium text-muted-foreground w-10 text-right">{pct}%</span>
                </div>
                <div className="text-right w-24">
                  <span className={`text-sm font-semibold ${isEmpty ? "text-destructive" : isLow ? "text-warning" : "text-card-foreground"}`}>
                    {p.availableQty}/{p.maxStock}
                  </span>
                  <p className="text-xs text-muted-foreground">mín: {p.minStock}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StockStatusCards;
