import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/AuthPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import Dashboard from "@/pages/Dashboard";
import ServicosPage from "@/pages/ServicosPage";
import ProjectosPage from "@/pages/ProjectosPage";
import InventoryPage from "@/pages/InventoryPage";

import HelpdeskPage from "@/pages/HelpdeskPage";
import DocumentsPage from "@/pages/DocumentsPage";
import FornecedoresPage from "@/pages/FornecedoresPage";
import ContactosPage from "@/pages/ContactosPage";
import AdminPage from "@/pages/AdminPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
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
              <Route path="/servicos" element={<ProtectedRoute requiredAccess="/servicos"><ServicosPage /></ProtectedRoute>} />
              <Route path="/projectos" element={<ProtectedRoute requiredAccess="/projectos"><ProjectosPage /></ProtectedRoute>} />
              <Route path="/inventario" element={<ProtectedRoute requiredAccess="/inventario"><InventoryPage /></ProtectedRoute>} />
              
              <Route path="/helpdesk" element={<ProtectedRoute requiredAccess="/helpdesk"><HelpdeskPage /></ProtectedRoute>} />
              <Route path="/documentos" element={<ProtectedRoute requiredAccess="/documentos"><DocumentsPage /></ProtectedRoute>} />
              <Route path="/fornecedores" element={<ProtectedRoute requiredAccess="/fornecedores"><FornecedoresPage /></ProtectedRoute>} />
              <Route path="/contactos" element={<ProtectedRoute requiredAccess="/contactos"><ContactosPage /></ProtectedRoute>} />
              <Route path="/administracao" element={<ProtectedRoute requiredAccess="/administracao"><AdminPage /></ProtectedRoute>} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
