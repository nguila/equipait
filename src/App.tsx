import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import LandingPage from "@/pages/LandingPage";
import Dashboard from "@/pages/Dashboard";
import ProjectsPage from "@/pages/ProjectsPage";
import ResourcesPage from "@/pages/ResourcesPage";
import InventoryPage from "@/pages/InventoryPage";
import FleetPage from "@/pages/FleetPage";
import DocumentsPage from "@/pages/DocumentsPage";
import ReportsPage from "@/pages/ReportsPage";
import UsersPage from "@/pages/UsersPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projetos" element={<ProjectsPage />} />
            <Route path="/recursos" element={<ResourcesPage />} />
            <Route path="/inventario" element={<InventoryPage />} />
            <Route path="/frota" element={<FleetPage />} />
            <Route path="/documentos" element={<DocumentsPage />} />
            <Route path="/relatorios" element={<ReportsPage />} />
            <Route path="/utilizadores" element={<UsersPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
