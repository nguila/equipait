import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Props {
  onAdd: (request: any) => void;
  products: any[];
}

const StockRequestFormDialog = ({ onAdd, products }: Props) => {
  const [open, setOpen] = useState(false);
  const [requestDate, setRequestDate] = useState<Date>();
  const [pickupDate, setPickupDate] = useState<Date>();
  const [form, setForm] = useState({
    requesterName: "", productId: "", quantity: "",
    destination: "", eventType: "", pickupPersonName: "", observations: "",
  });

  const selectedProduct = products.find((p: any) => p.id === form.productId);

  const handleSubmit = () => {
    if (!form.requesterName || !form.productId || !form.quantity || !form.eventType || !requestDate) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    const newRequest = {
      id: `sr${Date.now()}`,
      code: `PED-${String(Date.now()).slice(-3)}`,
      requesterName: form.requesterName,
      date: requestDate ? format(requestDate, "yyyy-MM-dd") : "",
      productId: form.productId,
      productName: selectedProduct?.name || "",
      quantity: Number(form.quantity),
      warehouseName: "",
      destination: form.destination,
      eventType: form.eventType,
      expectedPickupDate: pickupDate ? format(pickupDate, "yyyy-MM-dd") : "",
      pickupPersonName: form.pickupPersonName,
      observations: form.observations,
      status: "pendente",
    };
    onAdd(newRequest);
    setOpen(false);
    setForm({ requesterName: "", productId: "", quantity: "", destination: "", eventType: "", pickupPersonName: "", observations: "" });
    setRequestDate(undefined);
    setPickupDate(undefined);
    toast.success("Pedido criado com sucesso.");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5"><ClipboardList className="h-4 w-4" /> Novo Pedido</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Novo Pedido de Material</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="space-y-1.5">
            <Label>Nome do Requerente *</Label>
            <Input value={form.requesterName} onChange={e => setForm(f => ({ ...f, requesterName: e.target.value }))} placeholder="Nome completo" />
          </div>
          <div className="space-y-1.5">
            <Label>Data do Pedido *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !requestDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {requestDate ? format(requestDate, "dd/MM/yyyy") : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={requestDate} onSelect={setRequestDate} className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1.5">
            <Label>Produto *</Label>
            <Select value={form.productId} onValueChange={v => setForm(f => ({ ...f, productId: v }))}>
              <SelectTrigger><SelectValue placeholder="Selecionar produto" /></SelectTrigger>
              <SelectContent>{products.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.code} - {p.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Quantidade *</Label>
            <Input type="number" min="1" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Destino</Label>
            <Input value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} placeholder="Local de entrega" />
          </div>
          <div className="space-y-1.5">
            <Label>Tipo de Evento *</Label>
            <Select value={form.eventType} onValueChange={v => setForm(f => ({ ...f, eventType: v }))}>
              <SelectTrigger><SelectValue placeholder="Selecionar tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="requisicao">Requisição</SelectItem>
                <SelectItem value="devolucao">Devolução</SelectItem>
                <SelectItem value="transferencia">Transferência</SelectItem>
                <SelectItem value="abate">Abate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Data Prevista de Recolha</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !pickupDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {pickupDate ? format(pickupDate, "dd/MM/yyyy") : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={pickupDate} onSelect={setPickupDate} className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1.5">
            <Label>Pessoa que Recolhe</Label>
            <Input value={form.pickupPersonName} onChange={e => setForm(f => ({ ...f, pickupPersonName: e.target.value }))} placeholder="Nome de quem recolhe" />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>Observações</Label>
            <Textarea value={form.observations} onChange={e => setForm(f => ({ ...f, observations: e.target.value }))} placeholder="Notas adicionais..." rows={3} />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSubmit}>Submeter Pedido</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StockRequestFormDialog;
