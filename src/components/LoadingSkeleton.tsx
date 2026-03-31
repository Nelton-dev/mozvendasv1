import { Skeleton } from "@/components/ui/skeleton";

export const ProductCardSkeleton = () => (
  <div className="bg-card rounded-2xl shadow-card overflow-hidden animate-fade-in">
    <div className="flex items-center gap-2 p-3 border-b border-border">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="space-y-1.5">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
    <Skeleton className="aspect-square w-full" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-7 w-1/3" />
      <div className="flex justify-between pt-3 border-t border-border">
        <div className="flex gap-4">
          <Skeleton className="h-5 w-10" />
          <Skeleton className="h-5 w-10" />
        </div>
        <Skeleton className="h-9 w-20 rounded-md" />
      </div>
    </div>
  </div>
);

export const ProductFeedSkeleton = () => (
  <div className="container mx-auto px-4 py-6">
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

export const PageLoadingSpinner = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
    <img
      src="/moz-vendas-logo.png"
      alt="MOZ VENDAS"
      className="h-16 w-16 animate-pulse"
      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
    />
    <div className="flex gap-1.5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-2.5 w-2.5 rounded-full bg-primary animate-bounce"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
    <p className="text-sm text-muted-foreground animate-pulse">Carregando...</p>
  </div>
);
