import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import {
  Headphones,
  ArrowRight,
  BarChart3,
  Users,
  Layers,
  FileText,
  Monitor,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function useStaggerReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.querySelectorAll("[data-stagger]").forEach((child, i) => {
            (child as HTMLElement).style.animationDelay = `${i * 100}ms`;
            child.classList.add("animate-stagger-in");
          });
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

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


const LandingPage = () => {
  const navigate = useNavigate();
  const featuresRef = useStaggerReveal();
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-card/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
              <Headphones className="h-5 w-5 text-primary-foreground" />
            </div>
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
        <div className="absolute inset-0 bg-mesh" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-primary/5 blur-[120px] animate-hero-glow" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[500px] rounded-full bg-accent/5 blur-[100px] animate-hero-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />

        <div className="relative mx-auto max-w-4xl px-6 py-28 lg:py-36 text-center">
          <div className="animate-slide-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              IT Service Management Platform
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-[3.5rem] leading-[1.08]">
              Suporte técnico{" "}
              <span className="text-gradient">inteligente</span>{" "}
              para a sua equipa de TI
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Centralize tickets, documente soluções e monitorize o desempenho da equipa.
              Tudo numa plataforma pensada para departamentos de TI.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row justify-center">
              <Button
                size="lg"
                className="h-13 px-8 text-base bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/25 transition-all duration-300"
                onClick={() => navigate("/auth")}
              >
                Aceder ao Portal
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
          <div ref={featuresRef} className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                data-stagger
                className="group rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 opacity-0"
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


      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/50 backdrop-blur-sm py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
              <Headphones className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
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
