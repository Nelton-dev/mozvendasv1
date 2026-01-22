import { Home, Search, Plus, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Início", active: true },
  { icon: Search, label: "Buscar" },
  { icon: Plus, label: "Anunciar", isAction: true },
  { icon: Heart, label: "Favoritos" },
  { icon: User, label: "Perfil" },
];

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-xl sm:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 transition-colors",
                item.isAction
                  ? "relative -mt-6"
                  : item.active
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {item.isAction ? (
                <div className="flex h-14 w-14 items-center justify-center rounded-full gradient-accent shadow-elevated">
                  <Icon className="h-6 w-6 text-accent-foreground" />
                </div>
              ) : (
                <>
                  <Icon className="h-6 w-6" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
