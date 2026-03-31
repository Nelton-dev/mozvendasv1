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
            <div className="flex items-center justify-center gap-2 mb-4">
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
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLogin ? "Entrar" : "Criar conta"}
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
