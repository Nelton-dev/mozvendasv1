import { 
  Smartphone, 
  Shirt, 
  Car, 
  Home, 
  Gamepad2, 
  Dumbbell, 
  Baby, 
  Sparkles,
  LayoutGrid
} from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  { name: "Todos", value: null, icon: LayoutGrid },
  { name: "Eletrônicos", value: "eletronicos", icon: Smartphone },
  { name: "Moda", value: "moda", icon: Shirt },
  { name: "Veículos", value: "veiculos", icon: Car },
  { name: "Casa", value: "casa", icon: Home },
  { name: "Games", value: "games", icon: Gamepad2 },
  { name: "Esportes", value: "esportes", icon: Dumbbell },
  { name: "Bebês", value: "bebes", icon: Baby },
  { name: "Beleza", value: "beleza", icon: Sparkles },
];

interface CategoryNavProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

const CategoryNav = ({ selectedCategory, onSelectCategory }: CategoryNavProps) => {
  return (
    <div className="w-full overflow-x-auto scrollbar-hide border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-1 py-3">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.value;
            return (
              <button
                key={category.name}
                onClick={() => onSelectCategory(category.value)}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all",
                  isActive
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
