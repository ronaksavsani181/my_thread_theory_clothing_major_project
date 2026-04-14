import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import ProductCard from "../ProductCard";

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const res = await api.get("/products");
        // General catalog showcase: slice the newest 8 items
        setProducts(res.data.slice(0, 8)); 
      } catch (error) {
        console.error("Featured error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <section className="py-24 px-6 sm:px-8 lg:px-12 max-w-[90rem] mx-auto bg-white">
      
      {/* MINIMALIST EDITORIAL HEADER */}
      <div className="flex justify-between items-end mb-12 border-b border-neutral-200 pb-6">
        <div>
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400 block mb-2">Editor's Picks</span>
          <h2 className="text-2xl md:text-3xl font-light tracking-wide uppercase text-neutral-900">
            Featured Products
          </h2>
        </div>
        <Link to="/products" className="hidden sm:block text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 hover:text-neutral-900 hover:underline underline-offset-8 decoration-1 transition-all">
          View Collection &rarr;
        </Link>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 animate-pulse">Curating Collection...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-16 sm:gap-x-8">
          {products.map((product) => (
            <div key={product._id} className="w-full">
              {/* 🌟 FORCE TAGS TO BE HIDDEN HERE */}
              <ProductCard product={product} hideBadge={true} />
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-12 text-center sm:hidden">
         <Link to="/products" className="inline-block border border-neutral-900 text-neutral-900 px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-900 hover:text-white transition-colors">
          View All Products
        </Link>
      </div>
    </section>
  );
}