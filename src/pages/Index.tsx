import { useState } from "react";
import Header from "@/components/Header";
import CategoryNav from "@/components/CategoryNav";
import StoriesBar from "@/components/StoriesBar";
import ProductFeed from "@/components/ProductFeed";
import BottomNav from "@/components/BottomNav";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-0">
      <Header />
      <CategoryNav
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      <StoriesBar />
      <ProductFeed selectedCategory={selectedCategory} />
      <BottomNav />
    </div>
  );
};

export default Index;
