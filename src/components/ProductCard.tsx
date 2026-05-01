import { Heart, MapPin, MessageCircle, Share2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useStartConversation } from "@/hooks/useStartConversation";

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  seller: {
    id?: string;
    name: string;
    avatar: string;
    verified: boolean;
    whatsappNumber?: string;
  };
  location: string;
  likes: number;
  comments: number;
  isNew?: boolean;
  isUrgent?: boolean;
}

const ProductCard = ({
  title,
  price,
  originalPrice,
  image,
  seller,
  location,
  likes,
  comments,
  isNew,
  isUrgent,
}: ProductCardProps) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const { startConversation } = useStartConversation();

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  const handleContact = () => {
    if (seller.id) {
      startConversation({
        sellerId: seller.id,
        productTitle: title,
        productImage: image,
        productPrice: price,
      });
    }
  };

  const handleBuy = () => {
    const message = encodeURIComponent(
      `Olá ${seller.name}! Vi o anúncio "${title}" por ${formatPrice(price)} no MOZ VENDAS e estou interessado(a). Ainda está disponível?`
    );

    if (seller.whatsappNumber) {
      const phone = seller.whatsappNumber.replace(/\D/g, "");
      window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
    } else {
      handleContact();
    }
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("pt-MZ", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <article className="group bg-card rounded-3xl overflow-hidden border border-border/60 transition-all duration-300 hover:shadow-warm hover:-translate-y-1 animate-fade-in">
      {/* Product Image — 4:5 cinematic */}
      <div className="relative overflow-hidden rounded-3xl m-2" style={{ aspectRatio: "4/5" }}>
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Top-left badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {isNew && (
            <span className="font-display italic text-[11px] font-semibold px-2.5 py-1 bg-accent text-accent-foreground rounded-full shadow-soft tracking-wide">
              novo
            </span>
          )}
          {isUrgent && (
            <span className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 bg-primary text-primary-foreground rounded-full shadow-soft">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground animate-pulse-dot" />
              urgente
            </span>
          )}
          {discount > 0 && (
            <span className="text-[11px] font-bold px-2.5 py-1 bg-foreground text-background rounded-full shadow-soft">
              −{discount}%
            </span>
          )}
        </div>

        {/* Like button — top right */}
        <button
          onClick={handleLike}
          className="absolute top-3 right-3 h-9 w-9 flex items-center justify-center rounded-full bg-card/85 backdrop-blur-md shadow-soft transition-transform hover:scale-110"
          aria-label="Favoritar"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-all",
              liked ? "fill-primary text-primary scale-110" : "text-foreground"
            )}
            strokeWidth={1.75}
          />
        </button>

        {/* Price tag — bottom left, editorial */}
        <div className="absolute bottom-3 left-3 bg-card/95 backdrop-blur-md rounded-2xl px-3 py-1.5 shadow-card">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display italic text-xl font-bold text-foreground leading-none">
              {formatPrice(price)}
            </span>
            <span className="text-[10px] font-semibold text-muted-foreground tracking-wider">MZN</span>
          </div>
          {originalPrice && (
            <span className="block text-[10px] text-muted-foreground line-through leading-none mt-0.5">
              {formatPrice(originalPrice)} MZN
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="px-4 pt-1 pb-4">
        <h3 className="font-semibold text-foreground line-clamp-2 mb-3 leading-snug">
          {title}
        </h3>

        {/* Seller row — compact */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            {seller.avatar ? (
              <img
                src={seller.avatar}
                alt={seller.name}
                className="h-6 w-6 rounded-full object-cover ring-1 ring-border"
              />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary">
                <User className="h-3 w-3 text-muted-foreground" />
              </div>
            )}
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-xs font-medium text-foreground truncate">
                {seller.name}
              </span>
              {seller.verified && (
                <svg
                  className="h-3.5 w-3.5 text-support flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground flex-shrink-0">
            <MapPin className="h-3 w-3" strokeWidth={1.75} />
            <span className="truncate max-w-[80px]">{location}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleContact}
            className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full border border-border text-foreground transition-colors hover:bg-secondary"
            aria-label="Mensagem"
          >
            <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <button
            className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full border border-border text-foreground transition-colors hover:bg-secondary"
            aria-label="Partilhar"
          >
            <Share2 className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <Button
            onClick={handleBuy}
            className="flex-1 h-10 rounded-full bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90 border-0 gap-2 font-semibold shadow-soft"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.413c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.595 5.392l-.999 3.648 3.893-1.039z"/>
            </svg>
            Comprar
          </Button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
