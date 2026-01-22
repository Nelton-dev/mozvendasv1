import { useNavigate } from "react-router-dom";
import { Home, Search, Plus, Heart, User, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const BottomNav = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const navItems = [
    { icon: Home, label: "Início", active: true, path: "/" },
    { icon: Search, label: "Buscar", path: "/" },
    { icon: Plus, label: "Anunciar", isAction: true, path: "/" },
    { icon: MessageCircle, label: "Chat", path: user ? "/messages" : "/auth" },
    { icon: User, label: "Perfil", path: user ? "/" : "/auth" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-xl sm:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
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
