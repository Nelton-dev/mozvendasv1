import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface StartConversationParams {
  sellerId: string;
  productTitle?: string;
  productImage?: string;
  productPrice?: number;
}

export const useStartConversation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const startConversation = async ({
    sellerId,
    productTitle,
    productImage,
    productPrice,
  }: StartConversationParams) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (sellerId === user.id) {
      toast({
        title: "Ops!",
        description: "Você não pode conversar consigo mesmo",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("buyer_id", user.id)
        .eq("seller_id", sellerId)
        .eq("product_title", productTitle || "")
        .maybeSingle();

      if (existing) {
        navigate(`/messages?conversation=${existing.id}`);
        return;
      }

      // Create new conversation
      const { data: newConversation, error } = await supabase
        .from("conversations")
        .insert({
          buyer_id: user.id,
          seller_id: sellerId,
          product_title: productTitle,
          product_image: productImage,
          product_price: productPrice,
        })
        .select("id")
        .single();

      if (error) throw error;

      navigate(`/messages?conversation=${newConversation.id}`);
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a conversa",
        variant: "destructive",
      });
    }
  };

  return { startConversation };
};
