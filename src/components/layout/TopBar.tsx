import { Search, Bell, Settings, HelpCircle, LogOut, Moon, Sun } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/hooks/useTheme";

const TopBar = () => {
  const { user, signOut } = useAuth();
  const { role } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const handleSignOut = async () => {
    await signOut();
    toast({ title: "Sessão terminada" });
    navigate("/");
  };

  const initials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : "??";

  const displayName = user?.email?.split("@")[0] ?? "Utilizador";

  return (
    <header className="flex h-16 items-center justify-between border-b border-border/60 bg-card/80 backdrop-blur-xl px-6">
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Pesquisar projetos, tarefas, recursos..."
          className="pl-10 bg-secondary/40 border-border/40 text-sm h-10 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/60"
        />
      </div>
      <div className="flex items-center gap-0.5">
        {[
          { icon: HelpCircle, title: "Ajuda", onClick: undefined },
          { icon: theme === "light" ? Moon : Sun, title: theme === "light" ? "Modo escuro" : "Modo claro", onClick: toggleTheme },
          { icon: Settings, title: "Definições", onClick: undefined },
        ].map((btn, i) => (
          <button
            key={i}
            onClick={btn.onClick}
            className="relative rounded-lg p-2.5 text-muted-foreground transition-all duration-200 hover:bg-primary/8 hover:text-primary"
            title={btn.title}
          >
            <btn.icon className="h-[18px] w-[18px]" />
          </button>
        ))}
        <button
          className="relative rounded-lg p-2.5 text-muted-foreground transition-all duration-200 hover:bg-primary/8 hover:text-primary"
          title="Notificações"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-2 top-2 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
        </button>

        <div className="mx-3 h-8 w-px bg-border/50" />

        <div className="flex items-center gap-2.5 rounded-xl px-3 py-1.5 transition-colors hover:bg-secondary/50">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-xs font-bold text-primary-foreground shadow-md">
            {initials}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground leading-tight">{displayName}</span>
            {role && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 w-fit capitalize border-primary/30 text-primary">
                {role === "admin" ? "Administrador" : role === "manager" ? "Gestor" : "Colaborador"}
              </Badge>
            )}
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="rounded-lg p-2.5 text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
          title="Terminar sessão"
        >
          <LogOut className="h-[18px] w-[18px]" />
        </button>
      </div>
    </header>
  );
};

export default TopBar;
