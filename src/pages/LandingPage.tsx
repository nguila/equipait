import { useNavigate } from "react-router-dom";
import {
  FolderKanban,
  BarChart3,
  Users,
  Truck,
  Package,
  FileText,
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: FolderKanban,
    title: "Gestão de Projetos",
    description:
      "Planeie, acompanhe e entregue projetos com vistas Kanban, timeline e listas de tarefas integradas.",
  },
  {
    icon: Users,
    title: "Alocação de Recursos",
    description:
      "Visualize a capacidade da equipa com heatmaps, detete conflitos e otimize a distribuição de trabalho.",
  },
  {
    icon: Package,
    title: "Controlo de Inventário",
    description:
      "Gestão multi-armazém com importação Excel, pedidos de stock e alertas de nível mínimo.",
  },
  {
    icon: Truck,
    title: "Gestão de Frota",
    description:
      "Controle veículos, manutenções programadas, seguros e custos operacionais num só lugar.",
  },
  {
    icon: FileText,
    title: "Documentos Centralizados",
    description:
      "Organize e partilhe documentos por projeto, departamento ou categoria com controlo de versões.",
  },
  {
    icon: BarChart3,
    title: "Relatórios & Analytics",
    description:
      "Dashboards dinâmicos com KPIs em tempo real, exportação de dados e análise de tendências.",
  },
];

const benefits = [
  {
    icon: Zap,
    title: "Produtividade +40%",
    description: "Automatize processos repetitivos e foque no que realmente importa.",
  },
  {
    icon: Shield,
    title: "Dados Seguros",
    description: "Controlo de acessos por função, encriptação e backups automáticos.",
  },
  {
    icon: Globe,
    title: "Acesso em Qualquer Lugar",
    description: "Plataforma web responsiva, acessível a partir de qualquer dispositivo.",
  },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-md">
              <FolderKanban className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              ERP Data CoLAB
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
            >
              Iniciar Sessão
            </Button>
            <Button size="sm" onClick={() => navigate("/dashboard")}>
              Começar Agora
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 text-center lg:py-32">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <Zap className="h-3.5 w-3.5" />
            Plataforma ERP Integrada
          </div>
          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Gestão inteligente para{" "}
            <span className="bg-gradient-to-r from-primary to-sidebar-accent bg-clip-text text-transparent">
              equipas colaborativas
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground lg:text-xl">
            Centralize projetos, recursos, inventário e frota numa única plataforma.
            Tome decisões informadas com dados em tempo real.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="h-12 px-8 text-base shadow-lg"
              onClick={() => navigate("/dashboard")}
            >
              Aceder ao Dashboard
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
              Explorar Funcionalidades
            </Button>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-8 sm:grid-cols-4">
            {[
              { value: "6+", label: "Módulos" },
              { value: "100%", label: "Integrado" },
              { value: "24/7", label: "Disponível" },
              { value: "PT", label: "Em Português" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border bg-muted/30 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Tudo o que precisa, num só lugar
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Módulos integrados que comunicam entre si para uma visão 360° da sua operação.
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
                Porquê escolher o ERP Data CoLAB?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Desenhado para equipas que precisam de agilidade sem sacrificar o controlo.
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
              <h3 className="text-xl font-bold text-card-foreground">Inclui acesso a:</h3>
              <ul className="mt-6 space-y-4">
                {[
                  "Dashboard com KPIs em tempo real",
                  "Gestão de projetos com Kanban e Timeline",
                  "Alocação de recursos com deteção de conflitos",
                  "Inventário multi-armazém com import/export",
                  "Gestão completa de frota e manutenções",
                  "Documentos e relatórios centralizados",
                  "Gestão de utilizadores e permissões",
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
                onClick={() => navigate("/dashboard")}
              >
                Começar a Utilizar
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
            Pronto para transformar a sua gestão?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sidebar-foreground/80">
            Junte-se às equipas que já utilizam o ERP Data CoLAB para otimizar operações e
            impulsionar resultados.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="mt-8 h-12 px-8 text-base font-semibold shadow-lg"
            onClick={() => navigate("/dashboard")}
          >
            Aceder ao ERP
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <FolderKanban className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">ERP Data CoLAB</span>
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
