import ProductCard from "./ProductCard";

const products = [
  {
    id: 1,
    title: "iPhone 14 Pro Max 256GB - Roxo Profundo - Estado Impecável",
    price: 5499,
    originalPrice: 7999,
    image: "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=600&h=600&fit=crop",
    seller: {
      name: "TechStore SP",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop",
      verified: true,
    },
    location: "São Paulo, SP",
    likes: 234,
    comments: 18,
    isNew: true,
  },
  {
    id: 2,
    title: "Tênis Nike Air Max 90 Original - Tamanho 42",
    price: 459,
    originalPrice: 899,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop",
    seller: {
      name: "SneakerHead",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      verified: true,
    },
    location: "Rio de Janeiro, RJ",
    likes: 89,
    comments: 7,
    isUrgent: true,
  },
  {
    id: 3,
    title: "PlayStation 5 + 2 Controles + 5 Jogos Originais",
    price: 3200,
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&h=600&fit=crop",
    seller: {
      name: "GameMaster",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
      verified: false,
    },
    location: "Curitiba, PR",
    likes: 156,
    comments: 23,
  },
  {
    id: 4,
    title: "Bolsa Louis Vuitton Neverfull MM Original com Nota",
    price: 8900,
    originalPrice: 12000,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop",
    seller: {
      name: "LuxuryBags",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      verified: true,
    },
    location: "Belo Horizonte, MG",
    likes: 312,
    comments: 45,
    isNew: true,
  },
  {
    id: 5,
    title: "MacBook Pro M2 14\" 512GB - Seminovo - Garantia Apple",
    price: 11500,
    originalPrice: 15999,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop",
    seller: {
      name: "AppleStore RJ",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      verified: true,
    },
    location: "Rio de Janeiro, RJ",
    likes: 278,
    comments: 32,
  },
  {
    id: 6,
    title: "Bicicleta Speed Specialized Tarmac SL7 Carbon",
    price: 18500,
    image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&h=600&fit=crop",
    seller: {
      name: "BikeShop",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      verified: true,
    },
    location: "Porto Alegre, RS",
    likes: 67,
    comments: 8,
    isUrgent: true,
  },
];

const ProductFeed = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </div>
  );
};

export default ProductFeed;
