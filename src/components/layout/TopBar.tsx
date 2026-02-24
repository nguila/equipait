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
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6 shadow-sm">
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-primary" />
        <Input
          placeholder="Pesquisar projetos, tarefas, recursos..."
          className="pl-10 bg-secondary/60 border border-border/60 text-sm h-10 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground/70"
        />
      </div>
      <div className="flex items-center gap-1">
        <button
          className="relative rounded-lg p-2.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          title="Ajuda"
        >
          <HelpCircle className="h-5 w-5" />
        </button>
        <button
          onClick={toggleTheme}
          className="relative rounded-lg p-2.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          title={theme === "light" ? "Modo escuro" : "Modo claro"}
        >
          {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>
        <button
          className="relative rounded-lg p-2.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          title="Definições"
        >
          <Settings className="h-5 w-5" />
        </button>
        <button
          className="relative rounded-lg p-2.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          title="Notificações"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-destructive" />
          </span>
        </button>
        <div className="ml-2 h-8 w-px bg-border" />
        <div className="ml-2 flex items-center gap-2.5 rounded-lg px-3 py-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-md">
            {initials}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground leading-tight">{displayName}</span>
            {role && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 w-fit capitalize">
                {role === "admin" ? "Administrador" : role === "manager" ? "Gestor" : "Colaborador"}
              </Badge>
            )}
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="rounded-lg p-2.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          title="Terminar sessão"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};

export default TopBar;
