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
  Sparkles,
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
      <header className="sticky top-0 z-50 border-b border-border/40 bg-card/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-9 w-9 rounded-xl object-contain" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
                <Headphones className="h-5 w-5 text-primary-foreground" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-foreground leading-tight">
                TI Data CoLAB
              </span>
              <span className="text-[10px] text-muted-foreground font-semibold font-mono-tech tracking-wider">
                SERVICE DESK
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/auth")}
              className="text-muted-foreground hover:text-foreground"
            >
              Iniciar Sessão
            </Button>
            <Button size="sm" onClick={() => navigate("/auth")} className="bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-md">
              Aceder ao Portal
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-mesh" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[500px] rounded-full bg-accent/5 blur-[100px]" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />

        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="animate-slide-up">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" />
                IT Service Management Platform
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-[3.5rem] leading-[1.08]">
                Suporte técnico{" "}
                <span className="text-gradient">
                  inteligente
                </span>{" "}
                para a sua equipa de TI
              </h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-lg">
                Centralize tickets, documente soluções e monitorize o desempenho da equipa.
                Tudo numa plataforma pensada para departamentos de TI.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="h-13 px-8 text-base bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/25 transition-all duration-300"
                  onClick={() => navigate("/auth")}
                >
                  Começar Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-13 px-8 text-base border-border/60 hover:bg-secondary/50"
                  onClick={() => {
                    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Ver Funcionalidades
                </Button>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative hidden lg:block animate-fade-in">
              <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 shadow-2xl shadow-primary/5">
                <div className="flex items-center gap-2 mb-5">
                  <div className="h-3 w-3 rounded-full bg-destructive/70" />
                  <div className="h-3 w-3 rounded-full bg-warning/70" />
                  <div className="h-3 w-3 rounded-full bg-accent/70" />
                  <span className="ml-2 text-xs text-muted-foreground font-mono-tech">dashboard — live</span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { label: "Abertos", value: "12", color: "from-warning/20 to-warning/5 text-warning" },
                    { label: "Em Curso", value: "8", color: "from-primary/20 to-primary/5 text-primary" },
                    { label: "Resolvidos", value: "47", color: "from-accent/20 to-accent/5 text-accent" },
                  ].map((s) => (
                    <div key={s.label} className={`rounded-xl bg-gradient-to-br ${s.color} p-3 border border-border/20`}>
                      <p className="text-2xl font-bold">{s.value}</p>
                      <p className="text-[10px] text-muted-foreground font-medium">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {["Erro no servidor de email", "VPN não conecta", "Pedido de licença Office"].map((t, i) => (
                    <div key={t} className="flex items-center justify-between rounded-lg bg-secondary/30 backdrop-blur-sm px-3 py-2.5 border border-border/20">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[10px] font-mono-tech text-muted-foreground">#{100 + i}</span>
                        <span className="text-xs font-medium text-card-foreground">{t}</span>
                      </div>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        i === 0 ? "bg-destructive/15 text-destructive" : i === 1 ? "bg-warning/15 text-warning" : "bg-accent/15 text-accent"
                      }`}>
                        {i === 0 ? "Alta" : i === 1 ? "Média" : "Baixa"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 rounded-xl border border-border/40 bg-card/80 backdrop-blur-xl p-3.5 shadow-xl">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-accent/5">
                    <CheckCircle2 className="h-4.5 w-4.5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-card-foreground">98.5% SLA</p>
                    <p className="text-[10px] text-muted-foreground">Taxa de cumprimento</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-8 sm:grid-cols-4">
            {[
              { value: "99.9%", label: "Uptime" },
              { value: "<2h", label: "Tempo Médio Resposta" },
              { value: "24/7", label: "Disponibilidade" },
              { value: "100%", label: "Em Português" },
            ].map((stat) => (
              <div key={stat.label} className="text-center group">
                <div className="text-3xl font-bold text-gradient">{stat.value}</div>
                <div className="mt-1.5 text-sm text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Logo Upload */}
      <section className="border-t border-border/40 bg-secondary/20 py-8 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <span className="text-sm text-muted-foreground font-medium">Personalizar logótipo:</span>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-primary/30 bg-card/50 backdrop-blur-sm px-4 py-2 text-sm text-primary transition-all hover:bg-primary/5 hover:border-primary/50">
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
                <img src={logoUrl} alt="Preview" className="h-8 w-8 rounded-lg object-contain" />
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
      <section id="features" className="border-t border-border/40 py-24 lg:py-32 relative">
        <div className="absolute inset-0 bg-mesh opacity-50" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider font-mono-tech mb-3">Funcionalidades</p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Tudo para gerir o suporte de TI
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Módulos especializados que trabalham em conjunto para uma resolução eficiente de incidentes.
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, idx) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/10 text-primary transition-all duration-300 group-hover:from-primary group-hover:to-accent group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/25">
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
      <section className="py-24 lg:py-32 border-t border-border/40">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-accent uppercase tracking-wider font-mono-tech mb-3">Vantagens</p>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Porquê o TI Data CoLAB?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Construído especificamente para equipas de suporte técnico que precisam de resultados.
              </p>
              <div className="mt-10 space-y-8">
                {benefits.map((benefit) => (
                  <div key={benefit.title} className="flex gap-4 group">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/10 text-primary transition-all group-hover:from-primary group-hover:to-accent group-hover:text-primary-foreground group-hover:shadow-lg">
                      <benefit.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{benefit.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-8 shadow-xl shadow-primary/5">
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
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                    <span className="text-sm text-card-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="mt-8 w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/20"
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


      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/50 backdrop-blur-sm py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <div className="flex items-center gap-2.5">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-5 w-5 rounded object-contain" />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                <Headphones className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
            )}
            <span className="text-sm font-semibold text-foreground">TI Data CoLAB</span>
            <span className="text-xs text-muted-foreground font-mono-tech">— SERVICE DESK</span>
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
