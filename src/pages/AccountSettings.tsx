import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, AlertTriangle, ShieldX, Undo2, Clock } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import BottomNav from "@/components/BottomNav";

const AccountSettings = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [deletionRequest, setDeletionRequest] = useState<any>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    if (user) checkDeletionStatus();
  }, [user, authLoading]);

  const checkDeletionStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("manage-account-deletion", {
        body: { action: "status" },
      });
      if (!error && data?.request) {
        setDeletionRequest(data.request);
      }
    } catch (err) {
      console.error("Error checking deletion status:", err);
    } finally {
      setChecking(false);
    }
  };

  const handleRequestDeletion = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-account-deletion", {
        body: { action: "request" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setDeletionRequest(data.request);
      toast({
        title: "Pedido de exclusão criado",
        description: "Sua conta será excluída em 3 dias. Você pode cancelar a qualquer momento.",
      });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDeletion = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-account-deletion", {
        body: { action: "cancel" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setDeletionRequest(null);
      toast({ title: "Exclusão cancelada!", description: "Sua conta está segura." });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getRemainingTime = () => {
    if (!deletionRequest?.scheduled_deletion_at) return "";
    const diff = new Date(deletionRequest.scheduled_deletion_at).getTime() - Date.now();
    const hours = Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (days > 0) return `${days} dia(s) e ${remainingHours} hora(s)`;
    return `${remainingHours} hora(s)`;
  };

  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-8">
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="flex h-14 items-center gap-4 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Configurações da Conta</h1>
        </div>
      </header>

      <div className="container mx-auto max-w-md p-4 space-y-6">
        {/* Deletion section */}
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-destructive">
              <ShieldX className="h-5 w-5" />
              Excluir Conta
            </CardTitle>
            <CardDescription>
              Ao excluir sua conta, todos os seus dados serão removidos permanentemente após um período de carência de 3 dias.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {deletionRequest ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-xl bg-destructive/10 border border-destructive/20 p-4">
                  <Clock className="h-8 w-8 text-destructive flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-destructive">Exclusão programada</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Sua conta será excluída em <strong>{getRemainingTime()}</strong>
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={handleCancelDeletion}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Undo2 className="h-4 w-4" />}
                  Cancelar exclusão
                </Button>
              </div>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Solicitar exclusão da conta
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Sua conta entrará em período de carência de <strong>3 dias</strong>. Durante esse período, você pode cancelar a exclusão. Após esse prazo, todos os seus dados serão removidos permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Voltar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleRequestDeletion}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={loading}
                    >
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sim, excluir minha conta
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
};

export default AccountSettings;
