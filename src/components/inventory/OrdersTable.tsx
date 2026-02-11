import { type StockRequest } from "@/data/mockData";
import StatusBadge from "@/components/shared/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, User, MapPin, Package } from "lucide-react";

interface Props {
  requests: StockRequest[];
  onStatusChange: (id: string, status: StockRequest["status"]) => void;
}

const OrdersTable = ({ requests, onStatusChange }: Props) => {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Código</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Requerente</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Produto</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Qtd</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tipo</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Armazém</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Destino</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recolha</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {requests.map(req => (
              <tr key={req.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{req.code}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm text-card-foreground">{req.requesterName}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm text-card-foreground">{req.productName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-card-foreground">{req.quantity}</td>
                <td className="px-4 py-3"><StatusBadge status={req.eventType} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground truncate max-w-[120px]">{req.warehouseName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground truncate max-w-[120px]">{req.destination}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{req.expectedPickupDate}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{req.pickupPersonName}</span>
                </td>
                <td className="px-4 py-3">
                  <Select value={req.status} onValueChange={v => onStatusChange(req.id, v as StockRequest["status"])}>
                    <SelectTrigger className="h-7 w-32 text-xs">
                      <SelectValue />
                    </SelectTrigger>
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
  );
};

export default OrdersTable;
