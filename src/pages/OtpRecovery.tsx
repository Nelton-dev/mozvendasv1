import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Phone, ShieldCheck, KeyRound } from "lucide-react";
import mozLogo from "@/assets/moz-vendas-logo.png";

type Step = "phone" | "otp" | "reset";

const OtpRecovery = () => {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;

    const formatted = phone.startsWith("+") ? phone : `+258${phone.replace(/\D/g, "")}`;
    if (!/^\+\d{9,15}$/.test(formatted)) {
      toast({ title: "Número inválido", description: "Use o formato +258XXXXXXXXX", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-otp-sms", {
        body: { phone: formatted },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setPhone(formatted);
      setStep("otp");
      toast({ title: "Código enviado!", description: "Verifique seu SMS" });
    } catch (err: any) {
      toast({ title: "Erro ao enviar SMS", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-otp", {
        body: { phone, code: otpCode },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.verified && data?.email) {
        setRecoveryEmail(data.email);
        // Send password reset email
        await supabase.auth.resetPasswordForEmail(data.email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        setStep("reset");
        toast({ title: "Código verificado!", description: "Um link de redefinição foi enviado ao seu email." });
      }
    } catch (err: any) {
      toast({ title: "Erro na verificação", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Button variant="ghost" className="mb-4" onClick={() => step === "phone" ? navigate("/forgot-password") : setStep("phone")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <Card className="shadow-card">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <img src={mozLogo} alt="MOZ VENDAS" className="h-16 w-16" />
            </div>

            {step === "phone" && (
              <>
                <div className="flex justify-center mb-2">
                  <Phone className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-xl">Recuperar via SMS</CardTitle>
                <CardDescription>
                  Digite o número de telefone associado à sua conta para receber um código de verificação.
                </CardDescription>
              </>
            )}

            {step === "otp" && (
              <>
                <div className="flex justify-center mb-2">
                  <ShieldCheck className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-xl">Verificar código</CardTitle>
                <CardDescription>
                  Digite o código de 6 dígitos enviado para <strong>{phone}</strong>
                </CardDescription>
              </>
            )}

            {step === "reset" && (
              <>
                <div className="flex justify-center mb-2">
                  <KeyRound className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-xl">Verificação concluída!</CardTitle>
                <CardDescription>
                  Enviamos um link de redefinição de senha para <strong>{recoveryEmail}</strong>. Verifique seu email.
                </CardDescription>
              </>
            )}
          </CardHeader>

          {step === "phone" && (
            <form onSubmit={handleSendOtp}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Número de telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+258 84 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use o número WhatsApp cadastrado na sua conta
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full gradient-primary text-primary-foreground border-0" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enviar código
                </Button>
              </CardFooter>
            </form>
          )}

          {step === "otp" && (
            <>
              <CardContent className="flex flex-col items-center space-y-4">
                <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                <p className="text-xs text-muted-foreground">O código expira em 10 minutos</p>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button
                  className="w-full gradient-primary text-primary-foreground border-0"
                  disabled={loading || otpCode.length !== 6}
                  onClick={handleVerifyOtp}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verificar código
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { setOtpCode(""); handleSendOtp({ preventDefault: () => {} } as React.FormEvent); }}>
                  Reenviar código
                </Button>
              </CardFooter>
            </>
          )}

          {step === "reset" && (
            <CardFooter className="flex flex-col gap-3">
              <Button variant="outline" className="w-full" onClick={() => navigate("/auth")}>
                Ir para o login
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

export default OtpRecovery;
