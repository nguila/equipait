import { Search, Bell, User } from "lucide-react";
import { Input } from "@/components/ui/input";

const TopBar = () => {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Pesquisar projetos, tarefas, recursos..."
          className="pl-9 bg-secondary/50 border-0 text-sm h-9"
        />
      </div>
      <div className="flex items-center gap-3">
        <button className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
        </button>
        <div className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-secondary cursor-pointer">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
            AR
          </div>
          <span className="text-sm font-medium">Ana R.</span>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
