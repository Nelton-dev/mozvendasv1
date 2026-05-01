import {
  Smartphone,
  Shirt,
  Car,
  Home,
  Gamepad2,
  Dumbbell,
  Baby,
  Sparkles,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  { name: "Todos", value: null, icon: LayoutGrid, tone: "primary" },
  { name: "Eletrônicos", value: "eletronicos", icon: Smartphone, tone: "support" },
  { name: "Moda", value: "moda", icon: Shirt, tone: "primary" },
  { name: "Veículos", value: "veiculos", icon: Car, tone: "accent" },
  { name: "Casa", value: "casa", icon: Home, tone: "support" },
  { name: "Games", value: "games", icon: Gamepad2, tone: "primary" },
  { name: "Esportes", value: "esportes", icon: Dumbbell, tone: "accent" },
  { name: "Bebês", value: "bebes", icon: Baby, tone: "primary" },
  { name: "Beleza", value: "beleza", icon: Sparkles, tone: "accent" },
] as const;

const toneClasses: Record<string, string> = {
  primary: "text-primary",
  accent: "text-accent",
  support: "text-support",
};

interface CategoryNavProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

const CategoryNav = ({ selectedCategory, onSelectCategory }: CategoryNavProps) => {
  return (
    <div className="w-full overflow-x-auto scrollbar-hide bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 py-3">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.value;
            return (
              <button
                key={category.name}
                onClick={() => onSelectCategory(category.value)}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all border",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-warm"
                    : "bg-card text-foreground border-border hover:border-primary/40"
                )}
              >
                <Icon
                  className={cn("h-4 w-4", isActive ? "text-primary-foreground" : toneClasses[category.tone])}
                  strokeWidth={1.75}
                />
                {category.name}
              </button>
            );
          })}
        </div>
        <div className="flex justify-center pb-2">
          <span className="capulana-divider opacity-60" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
};

export default CategoryNav;
