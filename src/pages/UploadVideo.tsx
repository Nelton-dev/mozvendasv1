import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Upload, Video } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const UploadVideo = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [productId, setProductId] = useState<string>("");
  const [products, setProducts] = useState<{ id: string; title: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    if (user) fetchProducts();
  }, [user, authLoading]);

  const fetchProducts = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("products")
      .select("id, title")
      .eq("seller_id", user.id)
      .eq("is_active", true);
    if (data) setProducts(data);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile || !user || !title.trim()) return;

    if (videoFile.size > 50 * 1024 * 1024) {
      toast({ title: "Ficheiro muito grande", description: "O vídeo deve ter no máximo 50MB", variant: "destructive" });
      return;
    }

    setUploading(true);
    setProgress(10);

    try {
      const fileExt = videoFile.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      setProgress(30);
      const { error: uploadError } = await supabase.storage
        .from("product-videos")
        .upload(filePath, videoFile);

      if (uploadError) throw uploadError;
      setProgress(70);

      const { data: urlData } = supabase.storage
        .from("product-videos")
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase.from("product_videos").insert({
        seller_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        video_url: urlData.publicUrl,
        product_id: productId || null,
      });

      if (dbError) throw dbError;
      setProgress(100);

      toast({ title: "Vídeo publicado!", description: "Seu vídeo já está disponível nos Reels" });
      navigate("/reels");
    } catch (err: any) {
      console.error("Upload error:", err);
      toast({ title: "Erro ao enviar vídeo", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  if (authLoading) {
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
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Novo Vídeo</h1>
        </div>
      </header>

      <div className="container mx-auto max-w-md p-4">
        <form onSubmit={handleUpload} className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                Detalhes do Vídeo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Video upload */}
              <div className="space-y-2">
                <Label>Vídeo *</Label>
                <label className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border p-8 cursor-pointer hover:border-primary/50 transition-colors">
                  {videoFile ? (
                    <>
                      <Video className="h-10 w-10 text-primary" />
                      <span className="text-sm font-medium text-foreground">{videoFile.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Toque para selecionar um vídeo</span>
                      <span className="text-xs text-muted-foreground">MP4, MOV • Máx. 50MB</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="video/mp4,video/quicktime,video/webm"
                    className="hidden"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: iPhone 15 Pro em perfeito estado"
                  required
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o produto mostrado no vídeo..."
                  rows={3}
                  maxLength={500}
                />
              </div>

              {products.length > 0 && (
                <div className="space-y-2">
                  <Label>Vincular a produto (opcional)</Label>
                  <Select value={productId} onValueChange={setProductId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {uploading && (
            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
              <div
                className="h-full gradient-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full gradient-primary text-primary-foreground border-0"
            disabled={uploading || !videoFile || !title.trim()}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando... {progress}%
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Publicar Vídeo
              </>
            )}
          </Button>
        </form>
      </div>
      <BottomNav />
    </div>
  );
};

export default UploadVideo;
