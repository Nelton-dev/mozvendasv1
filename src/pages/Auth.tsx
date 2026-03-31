import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, MapPin, Store, ShoppingBag } from "lucide-react";
import { z } from "zod";
import { lovable } from "@/integrations/lovable/index";
import { Separator } from "@/components/ui/separator";
import mozLogo from "@/assets/moz-vendas-logo.png";

const emailSchema = z.string().email("Email inválido");
const passwordSchema = z.string().min(6, "Senha deve ter no mínimo 6 caracteres");
const nameSchema = z.string().min(2, "Nome deve ter no mínimo 2 caracteres");

const PROVINCES = [
  "Maputo Cidade",
  "Maputo Província",
  "Gaza",
  "Inhambane",
  "Sofala",
  "Manica",
  "Tete",
  "Zambézia",
  "Nampula",
  "Cabo Delgado",
  "Niassa",
];

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [province, setProvince] = useState("");
  const [detailedLocation, setDetailedLocation] = useState("");
  const [role, setRole] = useState<"client" | "seller">("client");
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "Geolocalização não suportada", variant: "destructive" });
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
          );
          const data = await res.json();
          const state = data.address?.state || "";
          const city = data.address?.city || data.address?.town || data.address?.village || "";
          
          // Try to match province
          const matched = PROVINCES.find(p => state.toLowerCase().includes(p.toLowerCase()) || p.toLowerCase().includes(state.toLowerCase()));
          if (matched) setProvince(matched);
          if (city) setDetailedLocation(city);
          
          toast({ title: "Localização detectada!" });
        } catch {
          toast({ title: "Erro ao detectar localização", variant: "destructive" });
        } finally {
          setDetectingLocation(false);
        }
      },
      () => {
        setDetectingLocation(false);
        toast({ title: "Permissão de localização negada", variant: "destructive" });
      }
    );
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) newErrors.email = emailResult.error.errors[0].message;

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) newErrors.password = passwordResult.error.errors[0].message;

    if (!isLogin) {
      const nameResult = nameSchema.safeParse(name);
      if (!nameResult.success) newErrors.name = nameResult.error.errors[0].message;
      if (!province) newErrors.province = "Selecione a sua província";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Erro ao entrar",
            description: error.message.includes("Invalid login credentials")
              ? "Email ou senha incorretos"
              : error.message,
            variant: "destructive",
          });
        } else {
          navigate("/");
        }
      } else {
        const location = detailedLocation ? `${detailedLocation}, ${province}` : province;
        const { error } = await signUp(email, password, name, location, role === "seller");
        if (error) {
          toast({
            title: "Erro ao cadastrar",
            description: error.message.includes("already registered")
              ? "Este email já está cadastrado"
              : error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Conta criada!",
            description: "Você já pode começar a usar o MOZ VENDAS",
          });
          navigate("/");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Button variant="ghost" className="mb-4" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <Card className="shadow-card">
          <CardHeader className="text-center">
            <div className="flex flex-col items-center gap-2 mb-4">
              <img src={mozLogo} alt="MOZ VENDAS" className="h-16 w-16" />
              <span className="text-2xl font-bold text-foreground">
                MOZ <span className="text-primary">VENDAS</span>
              </span>
            </div>
            <CardTitle className="text-xl">
              {isLogin ? "Entrar na sua conta" : "Criar sua conta"}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? "Digite seu email e senha para acessar"
                : "Preencha os dados para se cadastrar"}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      placeholder="Seu nome"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={errors.name ? "border-destructive" : ""}
                    />
                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                  </div>

                  {/* Role selection */}
                  <div className="space-y-2">
                    <Label>Tipo de conta</Label>
                    <RadioGroup
                      value={role}
                      onValueChange={(v) => setRole(v as "client" | "seller")}
                      className="grid grid-cols-2 gap-3"
                    >
                      <label
                        htmlFor="role-client"
                        className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 cursor-pointer transition-all ${
                          role === "client" ? "border-primary bg-primary/5" : "border-border"
                        }`}
                      >
                        <RadioGroupItem value="client" id="role-client" className="sr-only" />
                        <ShoppingBag className="h-6 w-6 text-primary" />
                        <span className="text-sm font-semibold">Cliente</span>
                        <span className="text-[10px] text-muted-foreground text-center">Comprar produtos</span>
                      </label>
                      <label
                        htmlFor="role-seller"
                        className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 cursor-pointer transition-all ${
                          role === "seller" ? "border-primary bg-primary/5" : "border-border"
                        }`}
                      >
                        <RadioGroupItem value="seller" id="role-seller" className="sr-only" />
                        <Store className="h-6 w-6 text-primary" />
                        <span className="text-sm font-semibold">Vendedor</span>
                        <span className="text-[10px] text-muted-foreground text-center">Vender produtos</span>
                      </label>
                    </RadioGroup>
                  </div>

                  {/* Province */}
                  <div className="space-y-2">
                    <Label>Província *</Label>
                    <div className="flex gap-2">
                      <Select value={province} onValueChange={setProvince}>
                        <SelectTrigger className={errors.province ? "border-destructive flex-1" : "flex-1"}>
                          <SelectValue placeholder="Selecione a província" />
                        </SelectTrigger>
                        <SelectContent>
                          {PROVINCES.map((p) => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleDetectLocation}
                        disabled={detectingLocation}
                      >
                        {detectingLocation ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <MapPin className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {errors.province && <p className="text-sm text-destructive">{errors.province}</p>}
                    <p className="text-xs text-muted-foreground">Toque no ícone de localização para detectar automaticamente</p>
                  </div>

                  {/* Detailed location */}
                  <div className="space-y-2">
                    <Label htmlFor="detailedLocation">Cidade / Bairro (opcional)</Label>
                    <Input
                      id="detailedLocation"
                      placeholder="Ex: Matola, Bairro Central"
                      value={detailedLocation}
                      onChange={(e) => setDetailedLocation(e.target.value)}
                    />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? "border-destructive" : ""}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full gradient-primary text-primary-foreground border-0"
                disabled={loading || googleLoading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLogin ? "Entrar" : "Criar conta"}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">ou</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                disabled={loading || googleLoading}
                onClick={async () => {
                  setGoogleLoading(true);
                  try {
                    const result = await lovable.auth.signInWithOAuth("google", {
                      redirect_uri: window.location.origin,
                    });
                    if (result?.error) {
                      toast({
                        title: "Erro ao entrar com Google",
                        description: String(result.error),
                        variant: "destructive",
                      });
                    }
                  } catch (err) {
                    toast({
                      title: "Erro ao entrar com Google",
                      description: "Tente novamente mais tarde",
                      variant: "destructive",
                    });
                  } finally {
                    setGoogleLoading(false);
                  }
                }}
              >
                {googleLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                Continuar com Google
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setErrors({});
                  }}
                  className="text-primary font-medium hover:underline"
                >
                  {isLogin ? "Cadastre-se" : "Entrar"}
                </button>
              </p>
              <p className="text-center text-xs text-muted-foreground mt-2">
                Ao continuar, você concorda com os nossos{" "}
                <button type="button" onClick={() => navigate("/terms")} className="text-primary hover:underline">
                  Termos e Condições
                </button>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
