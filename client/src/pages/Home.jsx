import Hero from "../components/home/Hero";
import Brand from "../components/home/Brand";
import NewArrivals from "../components/home/NewArrivals";
import Categories from "../components/home/Categories";
import CategoryBanner from "../components/home/CategoryBanner";
import FeaturedProducts from "../components/home/FeaturedProducts";
import BestSellers from "../components/home/BestSellers";
import Newsletter from "../components/home/Newsletter";
export default function Home() {
  return (
    <div>
      <Hero />
      <Brand />
      <NewArrivals />
      <Categories />
      <CategoryBanner />
      <FeaturedProducts />
      <BestSellers />
      <Newsletter />
    </div>
  );
}
