import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Home, Play, Plus, User, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const BottomNav = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSeller, setIsSeller] = useState(false);

  useEffect(() => {
    if (!user) { setIsSeller(false); return; }
    supabase
      .from("profiles")
      .select("is_seller_mode")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => setIsSeller(data?.is_seller_mode ?? false));
  }, [user]);

  const navItems = [
    { icon: Home, label: "Início", active: true, path: "/" },
    { icon: Play, label: "Reels", path: "/reels" },
    ...(isSeller ? [{ icon: Plus, label: "Anunciar", isAction: true, path: "/add-product" }] : []),
    { icon: MessageCircle, label: "Chat", path: user ? "/messages" : "/auth" },
    { icon: User, label: "Perfil", path: user ? "/profile" : "/auth" },
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
