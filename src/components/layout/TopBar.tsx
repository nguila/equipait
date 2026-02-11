import { Search, Bell, Settings, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

const TopBar = () => {
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
        <div className="ml-2 flex items-center gap-2.5 rounded-lg px-3 py-1.5 hover:bg-primary/10 cursor-pointer transition-colors">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-md">
            AR
          </div>
          <span className="text-sm font-semibold text-foreground">Ana R.</span>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
