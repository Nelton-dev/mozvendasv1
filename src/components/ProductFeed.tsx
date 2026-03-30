import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "./ProductCard";

interface Product {
  id: string;
  seller_id: string;
  title: string;
  price: number;
  original_price: number | null;
  images: string[];
  location: string | null;
  is_urgent: boolean;
  category: string;
  created_at: string;
  seller?: {
    name: string;
    avatar_url: string | null;
    is_verified: boolean;
    whatsapp_number: string | null;
  };
}

const ProductFeed = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch seller profiles
      const sellerIds = [...new Set((data || []).map((p) => p.seller_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, name, avatar_url, is_verified, whatsapp_number, shop_name, is_seller_mode")
        .in("user_id", sellerIds);

      const profileMap = new Map(
        (profiles || []).map((p) => [p.user_id, p])
      );

      const enriched = (data || []).map((p) => ({
        ...p,
        seller: profileMap.get(p.seller_id) || {
          name: "Vendedor",
          avatar_url: null,
          is_verified: false,
          whatsapp_number: null,
        },
      }));

      setProducts(enriched);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <p className="text-lg font-semibold text-foreground mb-1">Nenhum produto ainda</p>
        <p className="text-sm text-muted-foreground">
          Seja o primeiro a publicar um anúncio!
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            title={product.title}
            price={product.price}
            originalPrice={product.original_price || undefined}
            image={product.images?.[0] || "/placeholder.svg"}
            seller={{
              id: product.seller_id,
              name: (product.seller as any)?.is_seller_mode && (product.seller as any)?.shop_name
                ? (product.seller as any).shop_name
                : product.seller?.name || "Vendedor",
              avatar: product.seller?.avatar_url || "",
              verified: product.seller?.is_verified || false,
              whatsappNumber: product.seller?.whatsapp_number || undefined,
            }}
            location={product.location || "Moçambique"}
            likes={0}
            comments={0}
            isNew={
              new Date(product.created_at).getTime() >
              Date.now() - 7 * 24 * 60 * 60 * 1000
            }
            isUrgent={product.is_urgent}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductFeed;
