import { ShoppingCart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const EconomatoPage = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Economato</h1>
          <p className="text-sm text-muted-foreground">Gestão de compras e fornecedores</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Requisição
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <ShoppingCart className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold text-foreground">Módulo de Economato</h3>
          <p className="text-sm text-muted-foreground mt-1">Gerencie compras, requisições e fornecedores</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EconomatoPage;
