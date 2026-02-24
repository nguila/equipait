import { useNavigate } from "react-router-dom";
import {
  Headphones,
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
  Globe,
  BarChart3,
  Users,
  Clock,
  MessageSquare,
  Layers,
  FileText,
  Monitor,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const features = [
  {
    icon: Headphones,
    title: "Gestão de Tickets",
    description:
      "Crie, acompanhe e resolva tickets de suporte com prioridades, SLAs e categorização automática.",
  },
  {
    icon: Monitor,
    title: "Monitorização em Tempo Real",
    description:
      "Dashboard com KPIs ao vivo, notificações instantâneas e visão completa do estado dos pedidos.",
  },
  {
    icon: Users,
    title: "Gestão de Equipa",
    description:
      "Atribua tickets, controle cargas de trabalho e mantenha a equipa alinhada com ferramentas colaborativas.",
  },
  {
    icon: FileText,
    title: "Base de Conhecimento",
    description:
      "Documentação centralizada com áreas de conhecimento, tipos de documento e campos personalizáveis.",
  },
  {
    icon: BarChart3,
    title: "Relatórios & Métricas",
    description:
      "Analise tempos de resposta, taxas de resolução e tendências com exportação Excel e PDF.",
  },
  {
    icon: Layers,
    title: "Multi-módulo Integrado",
    description:
      "Inventário, serviços técnicos, economato e frota — tudo ligado ao fluxo de suporte.",
  },
];

const benefits = [
  {
    icon: Clock,
    title: "Resolução 3x mais rápida",
    description: "SLAs automáticos e priorização inteligente reduzem o tempo de resposta.",
  },
  {
    icon: Shield,
    title: "Segurança de nível empresarial",
    description: "Permissões granulares por módulo, RLS e controlo de acessos por função.",
  },
  {
    icon: MessageSquare,
    title: "Comunicação centralizada",
    description: "Comentários em tickets, notificações em tempo real e histórico completo.",
  },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoUrl(url);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-9 w-9 rounded-lg object-contain" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-md">
                <Headphones className="h-5 w-5 text-primary-foreground" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-foreground leading-tight">
                TI Data CoLAB
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">
                Service Desk & IT Management
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/auth")}
            >
              Iniciar Sessão
            </Button>
            <Button size="sm" onClick={() => navigate("/auth")}>
              Aceder ao Portal
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-primary/3" />
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-primary/3 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                <Headphones className="h-3.5 w-3.5" />
                IT Service Management
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] leading-[1.1]">
                Suporte técnico{" "}
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  inteligente
                </span>{" "}
                para a sua equipa de TI
              </h1>
              <p className="mt-5 text-lg text-muted-foreground leading-relaxed max-w-lg">
                Centralize tickets, documente soluções e monitorize o desempenho da equipa.
                Tudo numa plataforma pensada para departamentos de TI.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="h-12 px-8 text-base shadow-lg"
                  onClick={() => navigate("/auth")}
                >
                  Começar Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-8 text-base"
                  onClick={() => {
                    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Ver Funcionalidades
                </Button>
              </div>
            </div>

            {/* Hero Visual - Simulated Dashboard Preview */}
            <div className="relative hidden lg:block">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-3 w-3 rounded-full bg-destructive/60" />
                  <div className="h-3 w-3 rounded-full bg-warning/60" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/60" />
                  <span className="ml-2 text-xs text-muted-foreground font-mono">dashboard</span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: "Abertos", value: "12", color: "text-amber-500" },
                    { label: "Em Curso", value: "8", color: "text-blue-500" },
                    { label: "Resolvidos", value: "47", color: "text-emerald-500" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-lg bg-muted/50 p-3">
                      <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-[10px] text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {["Erro no servidor de email", "VPN não conecta", "Pedido de licença Office"].map((t, i) => (
                    <div key={t} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-muted-foreground">#{100 + i}</span>
                        <span className="text-xs font-medium text-card-foreground">{t}</span>
                      </div>
                      <span className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded-full ${
                        i === 0 ? "bg-destructive/10 text-destructive" : i === 1 ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-600"
                      }`}>
                        {i === 0 ? "Alta" : i === 1 ? "Média" : "Baixa"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 rounded-xl border border-border bg-card p-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-card-foreground">98.5% SLA</p>
                    <p className="text-[10px] text-muted-foreground">Taxa de cumprimento</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-8 sm:grid-cols-4">
            {[
              { value: "99.9%", label: "Uptime" },
              { value: "<2h", label: "Tempo Médio Resposta" },
              { value: "24/7", label: "Disponibilidade" },
              { value: "100%", label: "Em Português" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Logo Upload Section */}
      <section className="border-t border-border bg-muted/20 py-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <span className="text-sm text-muted-foreground font-medium">Personalizar logótipo:</span>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-primary/30 bg-card px-4 py-2 text-sm text-primary transition-colors hover:bg-primary/5">
              <Upload className="h-4 w-4" />
              Carregar Logótipo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
            </label>
            {logoUrl && (
              <div className="flex items-center gap-2">
                <img src={logoUrl} alt="Preview" className="h-8 w-8 rounded object-contain" />
                <button
                  onClick={() => setLogoUrl(null)}
                  className="text-xs text-destructive hover:underline"
                >
                  Remover
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border bg-muted/30 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Tudo para gerir o suporte de TI
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Módulos especializados que trabalham em conjunto para uma resolução eficiente de incidentes.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Porquê o TI Data CoLAB?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Construído especificamente para equipas de suporte técnico que precisam de resultados.
              </p>
              <div className="mt-10 space-y-8">
                {benefits.map((benefit) => (
                  <div key={benefit.title} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <benefit.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{benefit.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
              <h3 className="text-xl font-bold text-card-foreground">A plataforma inclui:</h3>
              <ul className="mt-6 space-y-4">
                {[
                  "Dashboard com KPIs e notificações em tempo real",
                  "Sistema de tickets com SLAs e priorização",
                  "Base de conhecimento com documentação técnica",
                  "Gestão de equipamentos e inventário TI",
                  "Relatórios de desempenho com export Excel/PDF",
                  "Controlo de acessos e permissões granulares",
                  "Comentários e histórico por ticket",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm text-card-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="mt-8 w-full shadow-md"
                size="lg"
                onClick={() => navigate("/auth")}
              >
                Aceder ao Service Desk
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-gradient-to-r from-sidebar-DEFAULT to-sidebar-accent py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-sidebar-foreground sm:text-4xl">
            Pronto para transformar o suporte da sua equipa?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sidebar-foreground/80">
            Junte-se às equipas de TI que já utilizam o TI Data CoLAB para resolver incidentes
            mais rápido e com maior controlo.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="mt-8 h-12 px-8 text-base font-semibold shadow-lg"
            onClick={() => navigate("/auth")}
          >
            Começar Gratuitamente
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <div className="flex items-center gap-2">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-5 w-5 rounded object-contain" />
            ) : (
              <Headphones className="h-4 w-4 text-primary" />
            )}
            <span className="text-sm font-semibold text-foreground">TI Data CoLAB</span>
            <span className="text-xs text-muted-foreground">— Service Desk</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Data CoLAB. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
