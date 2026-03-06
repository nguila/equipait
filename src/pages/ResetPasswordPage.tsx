import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, Loader2, Lock, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // Check for recovery type in hash fragment or search params
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace("#", "?"));
    const typeFromHash = hashParams.get("type");
    const typeFromSearch = searchParams.get("type");
    if (typeFromHash !== "recovery" && typeFromSearch !== "recovery") {
      // Wait a moment for Supabase to process the token
      const timeout = setTimeout(() => {
        if (!user) navigate("/auth");
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [searchParams, navigate, user]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("As passwords não coincidem");
      return;
    }

    if (password.length < 6) {
      setError("A password deve ter pelo menos 6 caracteres");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.auth.updateUser({ password });

    setSubmitting(false);

    if (error) {
      setError(error.message);
      toast({
        variant: "destructive",
        title: "Erro ao redefinir password",
        description: error.message,
      });
    } else {
      toast({
        title: "Password redefinida com sucesso",
        description: "A redirecionar para o dashboard...",
      });
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg">
            <FolderKanban className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Helpdesk Data CoLAB</h1>
          <p className="text-sm text-muted-foreground">
            Redefinir password
          </p>
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader>
            <CardTitle>Nova Password</CardTitle>
            <CardDescription>
              Introduza a sua nova password para aceder à conta
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleResetPassword}>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="password">Nova Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    minLength={6}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                    minLength={6}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Redefinir Password
              </Button>
              <button
                type="button"
                onClick={() => navigate("/auth")}
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar para login
              </button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
