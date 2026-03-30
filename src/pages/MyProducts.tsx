import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Trash2, Loader2, Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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

interface Product {
  id: string;
  title: string;
  price: number;
  images: string[] | null;
  is_active: boolean | null;
  created_at: string;
  category: string | null;
}

const MyProducts = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    if (user) fetchProducts();
  }, [user, authLoading]);

  const fetchProducts = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, title, price, images, is_active, created_at, category")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    setDeleting(productId);
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) throw error;
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      toast({ title: "Produto eliminado com sucesso!" });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({ title: "Erro ao eliminar produto", variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  };

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("pt-MZ", {
      style: "currency",
      currency: "MZN",
      minimumFractionDigits: 0,
    }).format(value);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-8">
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">Meus Produtos</h1>
          </div>
          <Button size="sm" className="gradient-primary text-primary-foreground border-0 gap-1" onClick={() => navigate("/add-product")}>
            <Plus className="h-4 w-4" />
            Novo
          </Button>
        </div>
      </header>

      <div className="container mx-auto max-w-md p-4 space-y-4">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold text-foreground mb-1">Nenhum produto</p>
            <p className="text-sm text-muted-foreground mb-4">Comece a vender publicando seu primeiro anúncio!</p>
            <Button className="gradient-primary text-primary-foreground border-0" onClick={() => navigate("/add-product")}>
              <Plus className="h-4 w-4 mr-2" />
              Publicar Anúncio
            </Button>
          </div>
        ) : (
          products.map((product) => (
            <Card key={product.id} className="shadow-card overflow-hidden">
              <CardContent className="p-0">
                <div className="flex gap-3 p-3">
                  <div className="h-20 w-20 flex-shrink-0 rounded-xl overflow-hidden bg-secondary">
                    <img
                      src={product.images?.[0] || "/placeholder.svg"}
                      alt={product.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm line-clamp-2">{product.title}</h3>
                    <p className="text-primary font-bold mt-1">{formatPrice(product.price)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{product.category || "Geral"}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => navigate(`/edit-product/${product.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                          {deleting === product.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Eliminar produto?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acção não pode ser desfeita. O produto será permanentemente eliminado.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(product.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default MyProducts;
