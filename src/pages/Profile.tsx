import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Loader2, MapPin, Phone, User, Store, ShoppingBag, Package, FileText, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isSellerMode, setIsSellerMode] = useState(false);
  const [shopName, setShopName] = useState("");
  const [shopDescription, setShopDescription] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    if (user) fetchProfile();
  }, [user, authLoading]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("name, location, avatar_url, whatsapp_number, is_seller_mode, shop_name, shop_description")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setName(data.name || "");
        setLocation(data.location || "");
        setAvatarUrl(data.avatar_url);
        setWhatsappNumber(data.whatsapp_number || "");
        setIsSellerMode(data.is_seller_mode || false);
        setShopName(data.shop_name || "");
        setShopDescription(data.shop_description || "");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      setAvatarUrl(urlData.publicUrl);

      await supabase
        .from("profiles")
        .update({ avatar_url: urlData.publicUrl })
        .eq("user_id", user.id);

      toast({ title: "Foto atualizada!" });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({ title: "Erro ao enviar foto", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "Geolocalização não suportada", variant: "destructive" });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
          );
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || "";
          const state = data.address?.state || "";
          const country = data.address?.country || "";
          const loc = [city, state, country].filter(Boolean).join(", ");
          setLocation(loc);
          toast({ title: "Localização obtida!" });
        } catch {
          toast({ title: "Erro ao obter localização", variant: "destructive" });
        }
      },
      () => {
        toast({ title: "Permissão de localização negada", variant: "destructive" });
      }
    );
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name,
          location,
          whatsapp_number: whatsappNumber,
          is_seller_mode: isSellerMode,
          shop_name: shopName || null,
          shop_description: shopDescription || null,
        })
        .eq("user_id", user.id);

      if (error) throw error;
      toast({ title: "Perfil salvo com sucesso!" });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({ title: "Erro ao salvar perfil", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-8">
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">Meu Perfil</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
              <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Cliente</span>
              <Switch
                checked={isSellerMode}
                onCheckedChange={setIsSellerMode}
                className="scale-75"
              />
              <span className="text-xs font-medium text-muted-foreground">Vendedor</span>
              <Store className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-md p-4 space-y-6">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="h-24 w-24 rounded-full object-cover ring-4 ring-primary/20" />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-secondary ring-4 ring-primary/20">
                <User className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
            </label>
          </div>
          <p className="text-sm font-medium text-foreground">{name || "Utilizador"}</p>
          {isSellerMode && shopName && (
            <p className="text-xs text-primary font-semibold flex items-center gap-1">
              <Store className="h-3 w-3" /> {shopName}
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          {isSellerMode && (
            <Button variant="outline" className="gap-2 h-auto py-3 flex-col" onClick={() => navigate("/my-products")}>
              <Package className="h-5 w-5 text-primary" />
              <span className="text-xs">Meus Produtos</span>
            </Button>
          )}
          <Button variant="outline" className="gap-2 h-auto py-3 flex-col" onClick={() => navigate("/messages")}>
            <ShoppingBag className="h-5 w-5 text-primary" />
            <span className="text-xs">Mensagens</span>
          </Button>
          <Button variant="outline" className="gap-2 h-auto py-3 flex-col" onClick={() => navigate("/terms")}>
            <FileText className="h-5 w-5 text-primary" />
            <span className="text-xs">Termos</span>
          </Button>
          <Button variant="outline" className="gap-2 h-auto py-3 flex-col text-destructive hover:text-destructive" onClick={handleSignOut}>
            <LogOut className="h-5 w-5" />
            <span className="text-xs">Sair</span>
          </Button>
        </div>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="personal" className="flex-1">Pessoal</TabsTrigger>
            {isSellerMode && <TabsTrigger value="shop" className="flex-1">Loja</TabsTrigger>}
          </TabsList>

          <TabsContent value="personal" className="mt-4">
            <Card className="shadow-card">
              <CardHeader><CardTitle className="text-lg">Informações pessoais</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="whatsapp" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="+258 84 123 4567" className="pl-10" />
                  </div>
                  <p className="text-xs text-muted-foreground">Os compradores usarão este número para contactá-lo</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Localização</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Maputo, Moçambique" className="pl-10" />
                    </div>
                    <Button type="button" variant="outline" size="icon" onClick={handleGetLocation}>
                      <MapPin className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {isSellerMode && (
            <TabsContent value="shop" className="mt-4">
              <Card className="shadow-card">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Store className="h-5 w-5 text-primary" /> Minha Loja</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="shopName">Nome da Loja</Label>
                    <Input id="shopName" value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="Ex: Tech Store Maputo" />
                    <p className="text-xs text-muted-foreground">Este nome será exibido nos seus anúncios</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shopDescription">Descrição da Loja</Label>
                    <Textarea
                      id="shopDescription"
                      value={shopDescription}
                      onChange={(e) => setShopDescription(e.target.value)}
                      placeholder="Descreva o que sua loja oferece para passar credibilidade aos compradores..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        <Button onClick={handleSave} className="w-full gradient-primary text-primary-foreground border-0" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar Perfil
        </Button>
      </div>
      <BottomNav />
    </div>
  );
};

export default Profile;
