import { 
  Smartphone, 
  Shirt, 
  Car, 
  Home, 
  Gamepad2, 
  Dumbbell, 
  Baby, 
  Sparkles,
  MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  { name: "Eletrônicos", icon: Smartphone, active: true },
  { name: "Moda", icon: Shirt },
  { name: "Veículos", icon: Car },
  { name: "Casa", icon: Home },
  { name: "Games", icon: Gamepad2 },
  { name: "Esportes", icon: Dumbbell },
  { name: "Bebês", icon: Baby },
  { name: "Beleza", icon: Sparkles },
  { name: "Mais", icon: MoreHorizontal },
];

const CategoryNav = () => {
  return (
    <div className="w-full overflow-x-auto scrollbar-hide border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-1 py-3">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.name}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all",
                  category.active
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {category.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryNav;
