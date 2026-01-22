import Header from "@/components/Header";
import CategoryNav from "@/components/CategoryNav";
import StoriesBar from "@/components/StoriesBar";
import ProductFeed from "@/components/ProductFeed";
import BottomNav from "@/components/BottomNav";

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-0">
      <Header />
      <CategoryNav />
      <StoriesBar />
      <ProductFeed />
      <BottomNav />
    </div>
  );
};

export default Index;
