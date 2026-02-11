import { useState } from "react";
import { inventoryItems as initialItems, departments, stockRequests as initialRequests, type InventoryItem, type StockRequest } from "@/data/mockData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatusBadge from "@/components/shared/StatusBadge";
import { AlertTriangle, Package, Box, ClipboardList, MapPin, BarChart3 } from "lucide-react";
import ProductFormDialog from "@/components/inventory/ProductFormDialog";
import StockRequestFormDialog from "@/components/inventory/StockRequestFormDialog";
import WarehouseManager from "@/components/inventory/WarehouseManager";
import OrdersTable from "@/components/inventory/OrdersTable";
import StockStatusCards from "@/components/inventory/StockStatusCards";
import ExcelImportExport from "@/components/inventory/ExcelImportExport";

const InventoryPage = () => {
  const [products, setProducts] = useState<InventoryItem[]>(initialItems);
  const [requests, setRequests] = useState<StockRequest[]>(initialRequests);
  const [catFilter, setCatFilter] = useState<string>("all");
  const [orderFilter, setOrderFilter] = useState<string>("all");

  const categories = [...new Set(products.map((i) => i.category))];
  const filtered = products.filter((i) => catFilter === "all" || i.category === catFilter);
  const filteredRequests = requests.filter(r => orderFilter === "all" || r.status === orderFilter);

  const handleAddProduct = (item: InventoryItem) => setProducts(prev => [...prev, item]);
  const handleImportProducts = (items: InventoryItem[]) => setProducts(prev => [...prev, ...items]);
  const handleAddRequest = (req: StockRequest) => setRequests(prev => [...prev, req]);
  const handleStatusChange = (id: string, status: StockRequest["status"]) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Inventário & Ativos</h1>
        <p className="text-sm text-muted-foreground">Gestão de produtos, stock, armazéns e pedidos de material</p>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList className="bg-muted/60 p-1">
          <TabsTrigger value="products" className="gap-1.5 text-xs"><Package className="h-4 w-4" />Produtos</TabsTrigger>
          <TabsTrigger value="stock" className="gap-1.5 text-xs"><BarChart3 className="h-4 w-4" />Estado Stock</TabsTrigger>
          <TabsTrigger value="warehouses" className="gap-1.5 text-xs"><MapPin className="h-4 w-4" />Armazéns</TabsTrigger>
          <TabsTrigger value="requests" className="gap-1.5 text-xs"><ClipboardList className="h-4 w-4" />Pedidos</TabsTrigger>
          <TabsTrigger value="orders" className="gap-1.5 text-xs"><Box className="h-4 w-4" />Gestão Pedidos</TabsTrigger>
        </TabsList>

        {/* PRODUTOS */}
        <TabsContent value="products" className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <Select value={catFilter} onValueChange={setCatFilter}>
                <SelectTrigger className="w-52 h-9 text-sm">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <ExcelImportExport products={products} onImport={handleImportProducts} />
              <ProductFormDialog onAdd={handleAddProduct} />
            </div>
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
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stock</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((item) => {
                  const dept = departments.find((d) => d.id === item.departmentId);
                  const lowStock = item.availableQty <= item.minStock;
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
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-muted-foreground">mín: {item.minStock} / máx: {item.maxStock}</span>
                      </td>
                      <td className="px-5 py-3.5"><StatusBadge status={item.status === "ativo" ? "operacional" : "inativo"} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* ESTADO DO STOCK */}
        <TabsContent value="stock">
          <StockStatusCards products={products} />
        </TabsContent>

        {/* ARMAZÉNS & LOCALIZAÇÕES */}
        <TabsContent value="warehouses">
          <WarehouseManager />
        </TabsContent>

        {/* NOVO PEDIDO */}
        <TabsContent value="requests" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Crie novos pedidos de material com todos os detalhes necessários.</p>
            <StockRequestFormDialog onAdd={handleAddRequest} products={products} />
          </div>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-muted/50">
              <h3 className="text-sm font-semibold text-card-foreground">Pedidos Recentes</h3>
            </div>
            <div className="divide-y divide-border">
              {requests.slice(-5).reverse().map(req => (
                <div key={req.id} className="px-5 py-3.5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-muted-foreground">{req.code}</span>
                      <span className="text-sm font-medium text-card-foreground">{req.productName}</span>
                      <StatusBadge status={req.eventType} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{req.requesterName} · {req.date} · Qtd: {req.quantity}</p>
                  </div>
                  <StatusBadge status={req.status} />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* GESTÃO DE PEDIDOS */}
        <TabsContent value="orders" className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <Select value={orderFilter} onValueChange={setOrderFilter}>
              <SelectTrigger className="w-52 h-9 text-sm">
                <SelectValue placeholder="Filtrar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os estados</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="aprovado">Aprovado</SelectItem>
                <SelectItem value="em_preparacao">Em Preparação</SelectItem>
                <SelectItem value="entregue">Entregue</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <OrdersTable requests={filteredRequests} onStatusChange={handleStatusChange} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryPage;
