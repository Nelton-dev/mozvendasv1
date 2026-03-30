import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Camera, Loader2, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const categories = [
  "Electrónicos", "Moda", "Veículos", "Casa", "Games",
  "Desportos", "Bebés", "Beleza", "Outros",
];

const EditProduct = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [category, setCategory] = useState("Outros");
  const [location, setLocation] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    if (id) fetchProduct();
  }, [user, id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id!)
        .eq("seller_id", user!.id)
        .maybeSingle();

      if (error || !data) {
        toast({ title: "Produto não encontrado", variant: "destructive" });
        navigate("/my-products");
        return;
      }

      setTitle(data.title);
      setDescription(data.description || "");
      setPrice(data.price.toString());
      setOriginalPrice(data.original_price?.toString() || "");
      setCategory(data.category || "Outros");
      setLocation(data.location || "");
      setIsUrgent(data.is_urgent || false);
      setIsActive(data.is_active !== false);
      setImages(data.images || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;
    setUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const fileExt = file.name.split(".").pop();
        const filePath = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const { error } = await supabase.storage.from("product-images").upload(filePath, file);
        if (error) throw error;
        const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(filePath);
        uploadedUrls.push(urlData.publicUrl);
      }
      setImages((prev) => [...prev, ...uploadedUrls]);
    } catch (error) {
      toast({ title: "Erro ao enviar imagem", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => setImages((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price) {
      toast({ title: "Preencha título e preço", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from("products")
        .update({
          title: title.trim(),
          description: description.trim() || null,
          price: parseFloat(price),
          original_price: originalPrice ? parseFloat(originalPrice) : null,
          category,
          location: location || null,
          images,
          is_urgent: isUrgent,
          is_active: isActive,
        })
        .eq("id", id!)
        .eq("seller_id", user!.id);

      if (error) throw error;
      toast({ title: "Produto atualizado com sucesso!" });
      navigate("/my-products");
    } catch (error) {
      toast({ title: "Erro ao atualizar produto", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
          <Button variant="ghost" size="icon" onClick={() => navigate("/my-products")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Editar Produto</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="container mx-auto max-w-md p-4 space-y-6">
        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-lg">Fotos</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-secondary">
                  <img src={img} alt="" className="h-full w-full object-cover" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {images.length < 6 && (
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/50 text-muted-foreground hover:bg-secondary transition-colors">
                  {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <><Camera className="h-6 w-6 mb-1" /><span className="text-xs">Adicionar</span></>}
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-lg">Detalhes</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preço (MZN)</Label>
                <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min="0" step="0.01" />
              </div>
              <div className="space-y-2">
                <Label>Preço Original</Label>
                <Input type="number" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} min="0" step="0.01" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Localização</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} className="pl-10" placeholder="Maputo" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div><Label>Urgente</Label><p className="text-xs text-muted-foreground">Marcar como venda urgente</p></div>
              <Switch checked={isUrgent} onCheckedChange={setIsUrgent} />
            </div>
            <div className="flex items-center justify-between">
              <div><Label>Activo</Label><p className="text-xs text-muted-foreground">Produto visível no feed</p></div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full gradient-primary text-primary-foreground border-0 h-12 text-base" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar Alterações
        </Button>
      </form>
    </div>
  );
};

export default EditProduct;
