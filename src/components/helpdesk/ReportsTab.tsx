import { useState, useMemo } from "react";
import { FileDown, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--destructive))", "hsl(210, 70%, 50%)", "hsl(140, 60%, 40%)", "hsl(40, 80%, 50%)", "hsl(280, 60%, 50%)"];

const statusLabels: Record<string, string> = {
  open: "Aberto",
  in_progress: "Em Progresso",
  waiting: "Em Espera",
  resolved: "Resolvido",
  closed: "Fechado",
};

interface Ticket {
  id: string;
  ticket_number: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  category: string | null;
  assigned_to: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface ReportsTabProps {
  tickets: Ticket[];
  profiles: { user_id: string; full_name: string | null; email: string | null; department_id: string | null }[];
  departments: { id: string; name: string; description: string | null }[];
}

const ReportsTab = ({ tickets, profiles, departments }: ReportsTabProps) => {
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const d = new Date(t.created_at);
      if (dateFrom && d < dateFrom) return false;
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        if (d > end) return false;
      }
      return true;
    });
  }, [tickets, dateFrom, dateTo]);

  // Tickets by status
  const statusData = Object.entries(statusLabels).map(([key, label]) => ({
    name: label,
    value: filteredTickets.filter((t) => t.status === key).length,
  })).filter((d) => d.value > 0);

  // Tickets by priority
  const priorityData = [
    { name: "Crítica", value: filteredTickets.filter((t) => t.priority === "critical").length },
    { name: "Alta", value: filteredTickets.filter((t) => t.priority === "high").length },
    { name: "Média", value: filteredTickets.filter((t) => t.priority === "medium").length },
    { name: "Baixa", value: filteredTickets.filter((t) => t.priority === "low").length },
  ].filter((d) => d.value > 0);

  // Tickets by technician
  const techData = profiles
    .map((p) => ({
      name: p.full_name || p.email || "Sem nome",
      total: filteredTickets.filter((t) => t.assigned_to === p.user_id).length,
      resolvidos: filteredTickets.filter((t) => t.assigned_to === p.user_id && (t.status === "resolved" || t.status === "closed")).length,
    }))
    .filter((d) => d.total > 0)
    .sort((a, b) => b.total - a.total);

  // Tickets by department
  const deptData = departments.map((d) => {
    const deptUserIds = profiles.filter((p) => p.department_id === d.id).map((p) => p.user_id);
    return {
      name: d.name,
      total: filteredTickets.filter((t) => t.assigned_to && deptUserIds.includes(t.assigned_to)).length,
      resolvidos: filteredTickets.filter((t) => t.assigned_to && deptUserIds.includes(t.assigned_to) && (t.status === "resolved" || t.status === "closed")).length,
    };
  }).filter((d) => d.total > 0);

  // Average resolution time by technician
  const avgResolutionByTech = useMemo(() => {
    return profiles.map((p) => {
      const resolved = filteredTickets.filter(
        (t) => t.assigned_to === p.user_id && (t.status === "resolved" || t.status === "closed")
      );
      if (resolved.length === 0) return null;
      const totalHours = resolved.reduce((sum, t) => {
        const created = new Date(t.created_at).getTime();
        const updated = new Date(t.updated_at).getTime();
        return sum + (updated - created) / (1000 * 60 * 60);
      }, 0);
      return {
        name: p.full_name || p.email || "Sem nome",
        horas: Math.round((totalHours / resolved.length) * 10) / 10,
      };
    }).filter(Boolean) as { name: string; horas: number }[];
  }, [filteredTickets, profiles]);

  // Average resolution time by department
  const avgResolutionByDept = useMemo(() => {
    return departments.map((d) => {
      const deptUserIds = profiles.filter((p) => p.department_id === d.id).map((p) => p.user_id);
      const resolved = filteredTickets.filter(
        (t) => t.assigned_to && deptUserIds.includes(t.assigned_to) && (t.status === "resolved" || t.status === "closed")
      );
      if (resolved.length === 0) return null;
      const totalHours = resolved.reduce((sum, t) => {
        const created = new Date(t.created_at).getTime();
        const updated = new Date(t.updated_at).getTime();
        return sum + (updated - created) / (1000 * 60 * 60);
      }, 0);
      return {
        name: d.name,
        horas: Math.round((totalHours / resolved.length) * 10) / 10,
      };
    }).filter(Boolean) as { name: string; horas: number }[];
  }, [filteredTickets, departments, profiles]);

  // Monthly trend
  const monthlyData = useMemo(() => {
    const months: Record<string, { name: string; criados: number; resolvidos: number }> = {};
    filteredTickets.forEach((t) => {
      const d = new Date(t.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("pt-PT", { month: "short", year: "2-digit" });
      if (!months[key]) months[key] = { name: label, criados: 0, resolvidos: 0 };
      months[key].criados++;
    });
    filteredTickets.filter((t) => t.status === "resolved" || t.status === "closed").forEach((t) => {
      const d = new Date(t.updated_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("pt-PT", { month: "short", year: "2-digit" });
      if (!months[key]) months[key] = { name: label, criados: 0, resolvidos: 0 };
      months[key].resolvidos++;
    });
    return Object.entries(months).sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v);
  }, [filteredTickets]);

  const exportReportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(18);
    doc.text("Relatório Helpdesk", 14, 20);
    doc.setFontSize(9);
    const dateRange = [
      dateFrom ? format(dateFrom, "dd/MM/yyyy") : "Início",
      dateTo ? format(dateTo, "dd/MM/yyyy") : "Hoje",
    ].join(" — ");
    doc.text(`Período: ${dateRange} | Exportado: ${new Date().toLocaleDateString("pt-PT")}`, 14, 28);

    let y = 36;

    // Summary
    (doc as any).autoTable({
      startY: y,
      head: [["Total", "Abertos", "Em Progresso", "Resolvidos", "Fechados", "Críticos"]],
      body: [[
        filteredTickets.length,
        filteredTickets.filter((t) => t.status === "open").length,
        filteredTickets.filter((t) => t.status === "in_progress").length,
        filteredTickets.filter((t) => t.status === "resolved").length,
        filteredTickets.filter((t) => t.status === "closed").length,
        filteredTickets.filter((t) => t.priority === "critical").length,
      ]],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
    });
    y = (doc as any).lastAutoTable.finalY + 10;

    // By technician
    if (techData.length > 0) {
      doc.setFontSize(12);
      doc.text("Por Técnico", 14, y);
      y += 4;
      (doc as any).autoTable({
        startY: y,
        head: [["Técnico", "Total", "Resolvidos", "Tempo Médio (h)"]],
        body: techData.map((t) => {
          const avg = avgResolutionByTech.find((a) => a.name === t.name);
          return [t.name, t.total, t.resolvidos, avg ? avg.horas : "—"];
        }),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] },
      });
      y = (doc as any).lastAutoTable.finalY + 10;
    }

    // By department
    if (deptData.length > 0) {
      doc.setFontSize(12);
      doc.text("Por Departamento", 14, y);
      y += 4;
      (doc as any).autoTable({
        startY: y,
        head: [["Departamento", "Total", "Resolvidos", "Tempo Médio (h)"]],
        body: deptData.map((d) => {
          const avg = avgResolutionByDept.find((a) => a.name === d.name);
          return [d.name, d.total, d.resolvidos, avg ? avg.horas : "—"];
        }),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] },
      });
    }

    doc.save(`relatorio_helpdesk_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const DateFilter = ({ label, date, onChange }: { label: string; date: Date | undefined; onChange: (d: Date | undefined) => void }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn("gap-1.5 text-xs", !date && "text-muted-foreground")}>
          <CalendarIcon className="h-3.5 w-3.5" />
          {date ? format(date, "dd/MM/yyyy") : label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={onChange} initialFocus className="p-3 pointer-events-auto" />
      </PopoverContent>
    </Popover>
  );

  if (filteredTickets.length === 0 && tickets.length === 0) {
    return (
      <>
        <h2 className="text-lg font-semibold text-foreground">Relatórios & Estatísticas</h2>
        <Card><CardContent className="py-12 text-center text-muted-foreground">Sem dados para apresentar. Crie tickets para ver os relatórios.</CardContent></Card>
      </>
    );
  }

  return (
    <>
      {/* Header with filters */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-foreground">Relatórios & Estatísticas</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <DateFilter label="Data início" date={dateFrom} onChange={setDateFrom} />
          <DateFilter label="Data fim" date={dateTo} onChange={setDateTo} />
          {(dateFrom || dateTo) && (
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => { setDateFrom(undefined); setDateTo(undefined); }}>
              Limpar
            </Button>
          )}
          <Button size="sm" variant="outline" className="gap-1.5" onClick={exportReportPDF}>
            <FileDown className="h-4 w-4" /> Exportar PDF
          </Button>
        </div>
      </div>

      {filteredTickets.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Nenhum ticket encontrado no período selecionado.</CardContent></Card>
      ) : (
        <>
          {/* Pie charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Distribuição por Estado</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}`}>
                      {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Distribuição por Prioridade</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={priorityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}`}>
                      {priorityData.map((_, i) => <Cell key={i} fill={["hsl(var(--destructive))", "hsl(25, 90%, 50%)", "hsl(45, 90%, 50%)", "hsl(140, 60%, 40%)"][i]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Bar charts - by technician and department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Tickets por Técnico</h3>
                {techData.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Nenhum ticket atribuído</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={techData} layout="vertical" margin={{ left: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={75} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="total" name="Total" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="resolvidos" name="Resolvidos" fill="hsl(140, 60%, 40%)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Tickets por Departamento</h3>
                {deptData.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Nenhum ticket associado</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={deptData} margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="total" name="Total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="resolvidos" name="Resolvidos" fill="hsl(140, 60%, 40%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Average resolution time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Tempo Médio de Resolução por Técnico (horas)</h3>
                {avgResolutionByTech.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Sem dados de resolução</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={avgResolutionByTech} layout="vertical" margin={{ left: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" unit="h" />
                      <YAxis type="category" dataKey="name" width={75} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(v: number) => [`${v}h`, "Tempo Médio"]} />
                      <Bar dataKey="horas" name="Horas" fill="hsl(280, 60%, 50%)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Tempo Médio de Resolução por Departamento (horas)</h3>
                {avgResolutionByDept.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Sem dados de resolução</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={avgResolutionByDept} margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis unit="h" />
                      <Tooltip formatter={(v: number) => [`${v}h`, "Tempo Médio"]} />
                      <Bar dataKey="horas" name="Horas" fill="hsl(280, 60%, 50%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Monthly trend */}
          {monthlyData.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Tendência Mensal</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="criados" name="Criados" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="resolvidos" name="Resolvidos" fill="hsl(140, 60%, 40%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </>
  );
};

export default ReportsTab;
