import { Skeleton } from "@/components/ui/skeleton";

export const ProductCardSkeleton = () => (
  <div className="bg-card rounded-3xl overflow-hidden border border-border/60 animate-fade-in">
    <div className="m-2">
      <Skeleton className="w-full rounded-3xl bg-muted" style={{ aspectRatio: "4/5" }} />
    </div>
    <div className="px-4 pt-1 pb-4 space-y-3">
      <Skeleton className="h-4 w-3/4 bg-muted" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full bg-muted" />
          <Skeleton className="h-3 w-20 bg-muted" />
        </div>
        <Skeleton className="h-3 w-14 bg-muted" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-10 rounded-full bg-muted" />
        <Skeleton className="h-10 w-10 rounded-full bg-muted" />
        <Skeleton className="h-10 flex-1 rounded-full bg-muted" />
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
    <p className="text-sm text-muted-foreground animate-pulse">A carregar...</p>
  </div>
);
