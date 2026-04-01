import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import mozLogo from "@/assets/moz-vendas-logo.png";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (error: any) {
      toast({
        title: "Erro ao enviar email",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Button variant="ghost" className="mb-4" onClick={() => navigate("/auth")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao login
        </Button>

        <Card className="shadow-card">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <img src={mozLogo} alt="MOZ VENDAS" className="h-16 w-16" />
            </div>
            {sent ? (
              <>
                <div className="flex justify-center mb-2">
                  <CheckCircle2 className="h-12 w-12 text-primary animate-scale-in" />
                </div>
                <CardTitle className="text-xl">Email enviado!</CardTitle>
                <CardDescription>
                  Enviamos um link de recuperação para <strong>{email}</strong>. Verifique sua caixa de entrada e spam.
                </CardDescription>
              </>
            ) : (
              <>
                <CardTitle className="text-xl">Esqueceu a senha?</CardTitle>
                <CardDescription>
                  Digite seu email e enviaremos um link para redefinir sua senha.
                </CardDescription>
              </>
            )}
          </CardHeader>

          {!sent ? (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full gradient-primary text-primary-foreground border-0"
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enviar link de recuperação
                </Button>
              </CardFooter>
            </form>
          ) : (
            <CardFooter className="flex flex-col gap-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setSent(false)}
              >
                Enviar novamente
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => navigate("/auth")}
              >
                Voltar ao login
              </Button>
            </CardFooter>
          )}

          {!sent && (
            <div className="px-6 pb-6">
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">ou</span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full mt-3 gap-2"
                onClick={() => navigate("/otp-recovery")}
              >
                <Mail className="h-4 w-4" />
                Recuperar via SMS
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
