import { Heart, MapPin, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useStartConversation } from "@/hooks/useStartConversation";

interface ProductCardProps {
  id: number;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  seller: {
    id?: string;
    name: string;
    avatar: string;
    verified: boolean;
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

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <article className="group bg-card rounded-2xl shadow-card overflow-hidden transition-all duration-300 hover:shadow-elevated hover:-translate-y-1">
      {/* Seller Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <img
            src={seller.avatar}
            alt={seller.name}
            className="h-8 w-8 rounded-full object-cover ring-2 ring-primary/20"
          />
          <div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-foreground">
                {seller.name}
              </span>
              {seller.verified && (
                <svg
                  className="h-4 w-4 text-primary"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {location}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isNew && (
            <Badge className="bg-primary text-primary-foreground border-0">
              Novo
            </Badge>
          )}
          {isUrgent && (
            <Badge className="bg-accent text-accent-foreground border-0">
              Urgente
            </Badge>
          )}
          {discount > 0 && (
            <Badge className="bg-foreground text-background border-0">
              -{discount}%
            </Badge>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-2 mb-2">
          {title}
        </h3>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-2xl font-bold text-primary">
            {formatPrice(price)}
          </span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Heart
                className={cn(
                  "h-5 w-5 transition-all",
                  liked && "fill-accent text-accent scale-110"
                )}
              />
              {likeCount}
            </button>
            <button className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
              <MessageCircle className="h-5 w-5" />
              {comments}
            </button>
            <button className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
              <Share2 className="h-5 w-5" />
            </button>
          </div>
          <Button
            size="sm"
            className="gradient-primary text-primary-foreground border-0 shadow-soft"
            onClick={handleContact}
          >
            Comprar
          </Button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
