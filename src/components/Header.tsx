import { Search, Bell, MessageCircle, Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary">
            <span className="text-lg font-bold text-primary-foreground">V</span>
          </div>
          <span className="hidden text-xl font-bold text-foreground sm:block">
            Vende<span className="text-primary">Aí</span>
          </span>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
              className="pl-10 bg-secondary border-0 focus-visible:ring-primary"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative hidden sm:flex">
            <Bell className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
              3
            </span>
          </Button>
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <MessageCircle className="h-5 w-5" />
          </Button>
          <Button className="gradient-accent text-accent-foreground border-0 gap-2 shadow-soft hover:opacity-90 transition-opacity">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Anunciar</span>
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
