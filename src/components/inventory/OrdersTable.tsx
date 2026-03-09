import StatusBadge from "@/components/shared/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, User, MapPin, Package } from "lucide-react";

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
  status: string;
}

interface Props {
  requests: StockRequest[];
  onStatusChange: (id: string, status: string) => void;
}

const OrdersTable = ({ requests, onStatusChange }: Props) => {
  return (
    <div className="space-y-4">
      <div className="hidden lg:block rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground min-w-24">Código</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground min-w-32">Requerente</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground min-w-40">Produto</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground min-w-12">Qtd</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground min-w-24">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground min-w-32">Armazém</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground min-w-40">Destino</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground min-w-40">Recolha</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground min-w-32">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {requests.map(req => (
                <tr key={req.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{req.code}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm text-card-foreground">{req.requesterName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Package className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm text-card-foreground">{req.productName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-card-foreground">{req.quantity}</td>
                  <td className="px-4 py-3"><StatusBadge status={req.eventType} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{req.warehouseName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{req.destination}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground">{req.expectedPickupDate}</span>
                        <span className="text-xs text-muted-foreground">{req.pickupPersonName}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Select value={req.status} onValueChange={v => onStatusChange(req.id, v)}>
                      <SelectTrigger className="h-7 w-32 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="aprovado">Aprovado</SelectItem>
                        <SelectItem value="em_preparacao">Em Preparação</SelectItem>
                        <SelectItem value="entregue">Entregue</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="lg:hidden space-y-3">
        {requests.map(req => (
          <div key={req.id} className="rounded-lg border border-border bg-card p-4 space-y-3 hover:bg-muted/30 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-mono text-muted-foreground">{req.code}</span>
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm font-medium text-card-foreground">{req.requesterName}</span>
                </div>
              </div>
              <Select value={req.status} onValueChange={v => onStatusChange(req.id, v)}>
                <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="em_preparacao">Em Prep.</SelectItem>
                  <SelectItem value="entregue">Entregue</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="h-px bg-border" />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Produto</span>
                <div className="flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-card-foreground">{req.productName}</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quantidade</span>
                <span className="text-sm font-semibold text-card-foreground">{req.quantity} un.</span>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tipo</span>
                <StatusBadge status={req.eventType} />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Armazém</span>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{req.warehouseName}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {requests.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
          <p className="text-sm text-muted-foreground">Sem pedidos para exibir</p>
        </div>
      )}
    </div>
  );
};

export default OrdersTable;
