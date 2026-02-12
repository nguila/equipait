import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/AuthPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import Dashboard from "@/pages/Dashboard";
import ProjectsPage from "@/pages/ProjectsPage";
import ResourcesPage from "@/pages/ResourcesPage";
import InventoryPage from "@/pages/InventoryPage";
import HelpdeskPage from "@/pages/HelpdeskPage";
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
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/projetos" element={<ProtectedRoute requiredAccess="/projetos"><ProjectsPage /></ProtectedRoute>} />
              <Route path="/recursos" element={<ProtectedRoute requiredAccess="/recursos"><ResourcesPage /></ProtectedRoute>} />
              <Route path="/inventario" element={<ProtectedRoute requiredAccess="/inventario"><InventoryPage /></ProtectedRoute>} />
              <Route path="/helpdesk" element={<ProtectedRoute requiredAccess="/helpdesk"><HelpdeskPage /></ProtectedRoute>} />
              <Route path="/frota" element={<ProtectedRoute requiredAccess="/frota"><FleetPage /></ProtectedRoute>} />
              <Route path="/documentos" element={<ProtectedRoute requiredAccess="/documentos"><DocumentsPage /></ProtectedRoute>} />
              <Route path="/relatorios" element={<ProtectedRoute requiredAccess="/relatorios"><ReportsPage /></ProtectedRoute>} />
              <Route path="/utilizadores" element={<ProtectedRoute requiredAccess="/utilizadores"><UsersPage /></ProtectedRoute>} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
