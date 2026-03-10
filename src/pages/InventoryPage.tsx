import { useState, useEffect } from "react";
// Local types - no longer using mockData
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "@/components/shared/StatusBadge";
import { Package, Box, ClipboardList, MapPin, BarChart3, Trash2, Download, Plus, RefreshCw, FolderOpen, Building2, Warehouse as WarehouseIcon, Edit2, Search, User, ImageIcon } from "lucide-react";
import ImageAttachments from "@/components/shared/ImageAttachments";
import ProductFormDialog from "@/components/inventory/ProductFormDialog";
import StockRequestFormDialog from "@/components/inventory/StockRequestFormDialog";
import OrdersTable from "@/components/inventory/OrdersTable";
import ImportExportBar from "@/components/shared/ImportExportBar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface InventoryCategory {
  id: string;
  name: string;
  description: string | null;
}

interface InventoryItem {
  id: string;
  code: string;
  name: string;
  serialNumber?: string;
  category: string;
  location: string;
  warehouseId: string;
  locationId: string;
  departmentId: string;
  userId: string;
  userName: string;
  status: "ativo" | "inativo";
}

interface StockRequest {
  id: string;
  code: string;
  requesterName: string;
  productName: string;
  quantity: number;
  eventType: string;
  warehouseName: string;
  destination: string;
  expectedPickupDate: string;
  pickupPersonName: string;
  date: string;
  status: string;
  notes?: string;
}

interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
  locations: string[];
}

interface WarehouseLocation {
  id: string;
  name: string;
  warehouseId?: string;
  zone?: string;
  capacity?: number;
  currentOccupancy?: number;
}

const InventoryPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<InventoryItem[]>([]);
  const [requests, setRequests] = useState<StockRequest[]>([]);
  const [catFilter, setCatFilter] = useState<string>("all");
  const [orderFilter, setOrderFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string; description: string | null }[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [locations, setLocations] = useState<WarehouseLocation[]>([]);

  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [catForm, setCatForm] = useState({ name: "", description: "" });
  const [editingCatId, setEditingCatId] = useState<string | null>(null);

  const [deptDialogOpen, setDeptDialogOpen] = useState(false);
  const [deptForm, setDeptForm] = useState({ name: "", description: "" });
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);

  const [whDialogOpen, setWhDialogOpen] = useState(false);
  const [whForm, setWhForm] = useState({ name: "", code: "", address: "" });
  const [editingWhId, setEditingWhId] = useState<string | null>(null);

  const [deleteWhId, setDeleteWhId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [locDialogOpen, setLocDialogOpen] = useState(false);
  const [locForm, setLocForm] = useState({ name: "" });
  const [deleteLocId, setDeleteLocId] = useState<string | null>(null);
  const [imageItemId, setImageItemId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const [catsRes, deptsRes, itemsRes, whRes, locsRes] = await Promise.all([
      supabase.from("inventory_categories").select("*").order("name"),
      supabase.from("departments").select("id, name, description").order("name"),
      supabase.from("inventory_items").select("*").order("code"),
      supabase.from("warehouses").select("*").order("name"),
      supabase.from("inventory_locations").select("*").order("name"),
    ]);
    if (catsRes.data) setCategories(catsRes.data as InventoryCategory[]);
    if (deptsRes.data) setDepartments(deptsRes.data);
    if (whRes.data) setWarehouses(whRes.data.map((w: any) => ({ id: w.id, name: w.name, code: w.code, address: w.address || "", locations: [] })));
    if (locsRes.data) setLocations(locsRes.data.map((l: any) => ({ id: l.id, name: l.name })));
    if (itemsRes.data) {
      setProducts(itemsRes.data.map((row: any) => ({
        id: row.id,
        code: row.code,
        name: row.name,
        serialNumber: row.serial_number || undefined,
        category: row.category,
        location: row.location || "",
        warehouseId: row.warehouse_id || "",
        locationId: row.location_id || "",
        departmentId: row.department_id || "",
        userId: row.created_by || "",
        userName: row.user_name || "",
        status: row.status as "ativo" | "inativo",
      })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const categoryNames = categories.map(c => c.name);
  const filtered = products.filter((i) => {
    const matchCat = catFilter === "all" || i.category === catFilter;
    const matchSearch = !searchQuery || i.name.toLowerCase().includes(searchQuery.toLowerCase()) || i.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });
  const filteredRequests = requests.filter(r => orderFilter === "all" || r.status === orderFilter);

  const getNextProductCode = () => {
    const nums = products.map(p => {
      const m = p.code.match(/INV-(\d+)/);
      return m ? parseInt(m[1], 10) : 0;
    });
    const max = nums.length > 0 ? Math.max(...nums) : 0;
    return `INV-${String(max + 1).padStart(3, "0")}`;
  };

  const handleAddProduct = async (item: InventoryItem) => {
    const autoCode = getNextProductCode();
    if (!user) { toast.error("Necessário autenticação."); return; }
    const { error } = await supabase.from("inventory_items").insert({
      code: autoCode,
      name: item.name,
      serial_number: item.serialNumber || null,
      category: item.category,
      location: item.location,
      warehouse_id: item.warehouseId,
      location_id: item.locationId,
      department_id: item.departmentId || null,
      user_name: item.userName || "",
      status: item.status || "ativo",
      created_by: user.id,
    });
    if (error) { toast.error("Erro ao guardar: " + error.message); return; }
    toast.success("Produto adicionado com sucesso.");
    fetchData();
  };

  const handleEditProduct = async (item: InventoryItem) => {
    const { error } = await supabase.from("inventory_items").update({
      name: item.name,
      serial_number: item.serialNumber || null,
      category: item.category,
      location: item.location,
      warehouse_id: item.warehouseId,
      location_id: item.locationId,
      department_id: item.departmentId || null,
      user_name: item.userName || "",
      status: item.status,
    }).eq("id", item.id);
    if (error) { toast.error("Erro ao atualizar: " + error.message); return; }
    toast.success("Produto atualizado com sucesso.");
    fetchData();
  };

  const handleImportProducts = async (items: InventoryItem[]) => {
    if (!user) { toast.error("Necessário autenticação."); return; }
    let codeNum = (() => {
      const nums = products.map(p => { const m = p.code.match(/INV-(\d+)/); return m ? parseInt(m[1], 10) : 0; });
      return nums.length > 0 ? Math.max(...nums) : 0;
    })();
    const rows = items.map((item) => {
      codeNum++;
      return {
        code: item.code || `INV-${String(codeNum).padStart(3, "0")}`,
        name: item.name,
        serial_number: item.serialNumber || null,
        category: item.category,
        location: item.location,
        warehouse_id: item.warehouseId,
        location_id: item.locationId,
        department_id: item.departmentId || null,
        user_name: item.userName || "",
        status: "ativo",
        created_by: user.id,
      };
    });
    const { error } = await supabase.from("inventory_items").insert(rows);
    if (error) { toast.error("Erro na importação: " + error.message); return; }
    toast.success(`${rows.length} produtos importados.`);
    fetchData();
  };

  const handleDeleteProduct = async (id: string) => {
    const { error } = await supabase.from("inventory_items").delete().eq("id", id);
    if (error) { toast.error("Erro ao eliminar: " + error.message); return; }
    setDeleteId(null);
    toast.success("Produto eliminado com sucesso.");
    fetchData();
  };

  const handleAddRequest = (req: StockRequest) => setRequests(prev => [...prev, req]);
  const handleStatusChange = (id: string, status: StockRequest["status"]) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  // Category CRUD
  const handleSaveCategory = async () => {
    if (!catForm.name.trim()) return;
    try {
      if (editingCatId) {
        const { error } = await supabase.from("inventory_categories").update({ name: catForm.name, description: catForm.description || null }).eq("id", editingCatId);
        if (error) throw error;
        toast.success("Categoria atualizada");
      } else {
        const { error } = await supabase.from("inventory_categories").insert({ name: catForm.name, description: catForm.description || null });
        if (error) throw error;
        toast.success("Categoria criada");
      }
      setCatDialogOpen(false);
      setCatForm({ name: "", description: "" });
      setEditingCatId(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Eliminar categoria?")) return;
    const { error } = await supabase.from("inventory_categories").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Categoria eliminada"); fetchData(); }
  };

  // Department CRUD
  const handleSaveDept = async () => {
    if (!deptForm.name.trim()) return;
    try {
      if (editingDeptId) {
        const { error } = await supabase.from("departments").update({ name: deptForm.name, description: deptForm.description || null }).eq("id", editingDeptId);
        if (error) throw error;
        toast.success("Departamento atualizado");
      } else {
        const { error } = await supabase.from("departments").insert({ name: deptForm.name, description: deptForm.description || null });
        if (error) throw error;
        toast.success("Departamento criado");
      }
      setDeptDialogOpen(false);
      setDeptForm({ name: "", description: "" });
      setEditingDeptId(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteDept = async (id: string) => {
    if (!confirm("Eliminar departamento?")) return;
    const { error } = await supabase.from("departments").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Departamento eliminado"); fetchData(); }
  };

  // Warehouse CRUD
  const handleSaveWarehouse = async () => {
    if (!whForm.name || !whForm.code) { toast.error("Preencha nome e código."); return; }
    try {
      if (editingWhId) {
        const { error } = await supabase.from("warehouses").update({ name: whForm.name, code: whForm.code, address: whForm.address }).eq("id", editingWhId);
        if (error) throw error;
        toast.success("Armazém atualizado.");
      } else {
        const { error } = await supabase.from("warehouses").insert({ name: whForm.name, code: whForm.code, address: whForm.address });
        if (error) throw error;
        toast.success("Armazém criado.");
      }
      setWhDialogOpen(false);
      setWhForm({ name: "", code: "", address: "" });
      setEditingWhId(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const deleteWarehouse = async (id: string) => {
    const { error } = await supabase.from("warehouses").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setDeleteWhId(null);
    toast.success("Armazém eliminado.");
    fetchData();
  };

  const downloadTemplate = () => {
    const templateData = [
      { "Código": "INV-001", "Nome": "Exemplo Produto", "Nº Série": "SN-12345", "Categoria": "Informática", "Armazém": "Armazém Principal", "Localização": "Sala 1", "Departamento": "TI", "Utilizador": "João Silva", "Estado": "ativo" },
      { "Código": "INV-002", "Nome": "", "Nº Série": "", "Categoria": "", "Armazém": "", "Localização": "", "Departamento": "", "Utilizador": "", "Estado": "ativo" },
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    ws["!cols"] = [
      { wch: 12 }, { wch: 25 }, { wch: 18 }, { wch: 18 }, { wch: 22 }, { wch: 15 }, { wch: 18 }, { wch: 20 }, { wch: 10 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Inventário");
    XLSX.writeFile(wb, "template_inventario.xlsx");
    toast.success("Template Excel descarregado.");
  };

  const totalProducts = products.length;

  const handleRefresh = () => {
    fetchData();
    toast.success("Dados atualizados");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            Inventário & Ativos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Gestão de produtos, armazéns, categorias e pedidos de material</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover-lift">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Produtos</p>
                <p className="text-2xl font-bold mt-1">{totalProducts}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-lift">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Utilizadores Associados</p>
                <p className="text-2xl font-bold mt-1">{new Set(products.map(p => p.userName).filter(Boolean)).size}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10">
                <User className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList className="bg-muted/60 p-1 flex-wrap">
          <TabsTrigger value="products" className="gap-1.5 text-xs"><Package className="h-4 w-4" />Produtos</TabsTrigger>
          <TabsTrigger value="stock" className="gap-1.5 text-xs"><BarChart3 className="h-4 w-4" />Resumo</TabsTrigger>
          <TabsTrigger value="categories" className="gap-1.5 text-xs"><FolderOpen className="h-4 w-4" />Categorias</TabsTrigger>
          <TabsTrigger value="departments" className="gap-1.5 text-xs"><Building2 className="h-4 w-4" />Departamentos</TabsTrigger>
          <TabsTrigger value="warehouses" className="gap-1.5 text-xs"><MapPin className="h-4 w-4" />Armazéns</TabsTrigger>
          <TabsTrigger value="locations" className="gap-1.5 text-xs"><MapPin className="h-4 w-4" />Localizações</TabsTrigger>
          <TabsTrigger value="requests" className="gap-1.5 text-xs"><ClipboardList className="h-4 w-4" />Pedidos</TabsTrigger>
          <TabsTrigger value="orders" className="gap-1.5 text-xs"><Box className="h-4 w-4" />Gestão Pedidos</TabsTrigger>
        </TabsList>

        {/* PRODUTOS */}
        <TabsContent value="products" className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Pesquisar produtos..." className="pl-10 w-64 h-9" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
              <Select value={catFilter} onValueChange={setCatFilter}>
                <SelectTrigger className="w-52 h-9 text-sm">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categoryNames.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <ImportExportBar
                data={filtered.map(item => ({
                  ...item,
                  warehouseName: warehouses.find(w => w.id === item.warehouseId)?.name || item.location || "",
                  departmentName: departments.find(d => d.id === item.departmentId)?.name || "",
                }))}
                columns={[
                  { key: "code", label: "Código" },
                  { key: "name", label: "Nome" },
                  { key: "serialNumber", label: "Nº Série" },
                  { key: "category", label: "Categoria" },
                  { key: "warehouseName", label: "Armazém" },
                  { key: "departmentName", label: "Departamento" },
                  { key: "userName", label: "Utilizador" },
                  { key: "status", label: "Estado" },
                ]}
                moduleName="Inventário"
                onImport={(rows) => {
                  const items: InventoryItem[] = rows.map((row, idx) => {
                    const whName = String(row.warehouseName || row["Armazém"] || "");
                    const deptName = String(row.departmentName || row["Departamento"] || "");
                    const wh = warehouses.find(w => w.name.toLowerCase() === whName.toLowerCase());
                    const dept = departments.find(d => d.name.toLowerCase() === deptName.toLowerCase());
                    return {
                      id: `imp_${Date.now()}_${idx}`,
                      code: String(row.code || row["Código"] || ""),
                      name: String(row.name || row["Nome"] || ""),
                      serialNumber: String(row.serialNumber || row["Nº Série"] || ""),
                      category: String(row.category || row["Categoria"] || ""),
                      location: whName,
                      warehouseId: wh?.id || "",
                      locationId: "",
                      departmentId: dept?.id || "",
                      userId: "",
                      userName: String(row.userName || row["Utilizador"] || ""),
                      status: "ativo" as const,
                    };
                  });
                  handleImportProducts(items);
                }}
              />
              <Button size="sm" variant="outline" className="gap-1.5" onClick={downloadTemplate}>
                <Download className="h-4 w-4" /> Template
              </Button>
              <ProductFormDialog onAdd={handleAddProduct} categories={categoryNames} departments={departments} />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Código</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Item</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nº Série</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Categoria</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Localização</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Departamento</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Utilizador</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estado</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} className="px-5 py-12 text-center text-muted-foreground">Nenhum produto encontrado</td></tr>
                ) : filtered.map((item) => {
                  const dept = departments.find((d) => d.id === item.departmentId);
                  return (
                    <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <Badge variant="outline" className="font-mono text-xs">{item.code}</Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                            <Package className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm font-medium text-card-foreground">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-muted-foreground font-mono">{item.serialNumber || "—"}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant="secondary" className="text-xs">{item.category}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">{item.location}</td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">{dept?.name || "—"}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm text-card-foreground">{item.userName || "—"}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5"><StatusBadge status={item.status === "ativo" ? "operacional" : "inativo"} /></td>
                      <td className="px-5 py-3.5 flex items-center gap-1">
                        <ProductFormDialog editItem={item} onEdit={handleEditProduct} categories={categoryNames} departments={departments} />
                        <button
                          onClick={() => setDeleteId(item.id)}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* RESUMO */}
        <TabsContent value="stock">
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
              <div className="px-5 py-3 border-b border-border bg-muted/50">
                <h3 className="text-sm font-semibold text-card-foreground">Produtos por Utilizador</h3>
              </div>
              <div className="divide-y divide-border">
                {products.map(p => (
                  <div key={p.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-muted/30 transition-colors">
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
        </TabsContent>

        {/* CATEGORIAS */}
        <TabsContent value="categories" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Categorias de Inventário</h2>
              <p className="text-sm text-muted-foreground">Gerir categorias para classificar os produtos do inventário</p>
            </div>
            <Button size="sm" className="gap-1.5" onClick={() => { setCatForm({ name: "", description: "" }); setEditingCatId(null); setCatDialogOpen(true); }}>
              <Plus className="h-4 w-4" /> Nova Categoria
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((c) => (
              <Card key={c.id} className="hover-lift">
                <CardContent className="pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <FolderOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{c.name}</p>
                      {c.description && <p className="text-xs text-muted-foreground">{c.description}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => { setCatForm({ name: c.name, description: c.description || "" }); setEditingCatId(c.id); setCatDialogOpen(true); }}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDeleteCategory(c.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
            <DialogContent className="max-w-sm">
              <DialogHeader><DialogTitle>{editingCatId ? "Editar Categoria" : "Nova Categoria"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Nome *</Label>
                  <Input value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} placeholder="Nome da categoria" />
                </div>
                <div className="space-y-1.5">
                  <Label>Descrição</Label>
                  <Input value={catForm.description} onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))} placeholder="Descrição opcional" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setCatDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleSaveCategory}>{editingCatId ? "Atualizar" : "Criar"}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* DEPARTAMENTOS */}
        <TabsContent value="departments" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Departamentos</h2>
              <p className="text-sm text-muted-foreground">Gerir departamentos associados ao inventário</p>
            </div>
            <Button size="sm" className="gap-1.5" onClick={() => { setDeptForm({ name: "", description: "" }); setEditingDeptId(null); setDeptDialogOpen(true); }}>
              <Plus className="h-4 w-4" /> Novo Departamento
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {departments.map((d) => (
              <Card key={d.id} className="hover-lift">
                <CardContent className="pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{d.name}</p>
                      {d.description && <p className="text-xs text-muted-foreground">{d.description}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => { setDeptForm({ name: d.name, description: d.description || "" }); setEditingDeptId(d.id); setDeptDialogOpen(true); }}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDeleteDept(d.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Dialog open={deptDialogOpen} onOpenChange={setDeptDialogOpen}>
            <DialogContent className="max-w-sm">
              <DialogHeader><DialogTitle>{editingDeptId ? "Editar Departamento" : "Novo Departamento"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Nome *</Label>
                  <Input value={deptForm.name} onChange={e => setDeptForm(f => ({ ...f, name: e.target.value }))} placeholder="Nome do departamento" />
                </div>
                <div className="space-y-1.5">
                  <Label>Descrição</Label>
                  <Input value={deptForm.description} onChange={e => setDeptForm(f => ({ ...f, description: e.target.value }))} placeholder="Descrição opcional" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDeptDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleSaveDept}>{editingDeptId ? "Atualizar" : "Criar"}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ARMAZÉNS */}
        <TabsContent value="warehouses" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Armazéns & Localizações</h2>
              <p className="text-sm text-muted-foreground">Gerir armazéns e as suas localizações internas</p>
            </div>
            <Button size="sm" className="gap-1.5" onClick={() => { setWhForm({ name: "", code: "", address: "" }); setEditingWhId(null); setWhDialogOpen(true); }}>
              <Plus className="h-4 w-4" />Novo Armazém
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {warehouses.map(wh => {
              const locs = locations.filter(l => l.warehouseId === wh.id);
              return (
                <Card key={wh.id} className="hover-lift">
                  <CardContent className="pt-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <WarehouseIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-card-foreground">{wh.name}</h3>
                          <p className="text-xs text-muted-foreground">{wh.code} · {wh.address}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => { setWhForm({ name: wh.name, code: wh.code, address: wh.address }); setEditingWhId(wh.id); setWhDialogOpen(true); }}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setDeleteWhId(wh.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {locs.length === 0 && <p className="text-xs text-muted-foreground italic">Sem localizações definidas</p>}
                      {locs.map(loc => {
                        const pct = loc.capacity > 0 ? Math.round((loc.currentOccupancy / loc.capacity) * 100) : 0;
                        return (
                          <div key={loc.id} className="rounded-lg bg-muted/50 p-3 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-card-foreground">{loc.name}</span>
                              <Badge variant="outline" className="text-[10px]">{loc.zone}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{loc.currentOccupancy}/{loc.capacity} ocupados</p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Warehouse Dialog */}
          <Dialog open={whDialogOpen} onOpenChange={setWhDialogOpen}>
            <DialogContent className="max-w-sm">
              <DialogHeader><DialogTitle>{editingWhId ? "Editar Armazém" : "Novo Armazém"}</DialogTitle></DialogHeader>
              <div className="space-y-3 py-2">
                <div className="space-y-1.5"><Label>Nome *</Label><Input value={whForm.name} onChange={e => setWhForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div className="space-y-1.5"><Label>Código *</Label><Input value={whForm.code} onChange={e => setWhForm(f => ({ ...f, code: e.target.value }))} /></div>
                <div className="space-y-1.5"><Label>Endereço</Label><Input value={whForm.address} onChange={e => setWhForm(f => ({ ...f, address: e.target.value }))} /></div>
              </div>
              <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setWhDialogOpen(false)}>Cancelar</Button><Button onClick={handleSaveWarehouse}>{editingWhId ? "Atualizar" : "Guardar"}</Button></div>
            </DialogContent>
          </Dialog>

          {/* Delete Warehouse Confirmation */}
          <AlertDialog open={!!deleteWhId} onOpenChange={() => setDeleteWhId(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Eliminar Armazém?</AlertDialogTitle>
                <AlertDialogDescription>Esta ação irá eliminar o armazém e todas as suas localizações associadas.</AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex justify-end gap-2">
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteWhId && deleteWarehouse(deleteWhId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Eliminar</AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>

        {/* LOCALIZAÇÕES */}
        <TabsContent value="locations" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Localizações</h2>
              <p className="text-sm text-muted-foreground">Gerir localizações do inventário</p>
            </div>
            <Button size="sm" className="gap-1.5" onClick={() => { setLocForm({ name: "" }); setLocDialogOpen(true); }}>
              <Plus className="h-4 w-4" /> Nova Localização
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {locations.map((loc) => (
                <Card key={loc.id} className="hover-lift">
                  <CardContent className="pt-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <p className="font-medium text-card-foreground">{loc.name}</p>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => setDeleteLocId(loc.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </CardContent>
                </Card>
            ))}
            {locations.length === 0 && (
              <p className="text-sm text-muted-foreground col-span-full text-center py-8">Nenhuma localização definida</p>
            )}
          </div>

          <Dialog open={locDialogOpen} onOpenChange={setLocDialogOpen}>
            <DialogContent className="max-w-sm">
              <DialogHeader><DialogTitle>Nova Localização</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Nome *</Label>
                  <Input value={locForm.name} onChange={e => setLocForm(f => ({ ...f, name: e.target.value }))} placeholder="Nome da localização" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setLocDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={async () => {
                    if (!locForm.name.trim()) { toast.error("Preencha o nome."); return; }
                    const { error } = await supabase.from("inventory_locations").insert({ name: locForm.name });
                    if (error) { toast.error(error.message); return; }
                    setLocDialogOpen(false);
                    setLocForm({ name: "" });
                    toast.success("Localização criada.");
                    fetchData();
                  }}>Criar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <AlertDialog open={!!deleteLocId} onOpenChange={() => setDeleteLocId(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Eliminar Localização?</AlertDialogTitle>
                <AlertDialogDescription>Esta ação não pode ser revertida.</AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex justify-end gap-2">
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={async () => { if (deleteLocId) { const { error } = await supabase.from("inventory_locations").delete().eq("id", deleteLocId); if (error) { toast.error(error.message); } else { toast.success("Localização eliminada."); fetchData(); } setDeleteLocId(null); } }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Eliminar</AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Crie novos pedidos de material com todos os detalhes necessários.</p>
            <StockRequestFormDialog onAdd={handleAddRequest} products={products} />
          </div>
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-border bg-muted/50">
              <h3 className="text-sm font-semibold text-card-foreground">Pedidos Recentes</h3>
            </div>
            <div className="divide-y divide-border">
              {requests.slice(-5).reverse().map(req => (
                <div key={req.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">{req.code}</Badge>
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

      {/* Refresh button */}
      <div className="flex justify-center pt-2">
        <Button variant="outline" className="gap-2" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4" /> Atualizar Dados
        </Button>
      </div>

      {/* DELETE DIALOG */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Produto</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza de que deseja eliminar este produto? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDeleteProduct(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InventoryPage;
