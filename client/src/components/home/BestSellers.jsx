import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import ProductCard from "../ProductCard";

export default function BestSellers() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        setLoading(true);
        const res = await api.get("/products");
        // 🌟 Filter specifically for best sellers
        const bestSellers = res.data.filter(p => p.isBestSeller === true).slice(0, 6);
        setProducts(bestSellers); 
      } catch (error) {
        console.error("Best seller error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBestSellers();
  }, []);

  if (!loading && products.length === 0) return null; // Hide if none exist

  return (
    <section className="py-24 px-6 sm:px-8 lg:px-12 bg-neutral-50 border-t border-neutral-100">
      <div className="max-w-[90rem] mx-auto">
        
        {/* EDITORIAL TITLE HEADER */}
        <div className="flex flex-col items-center text-center mb-20 relative">
          <span className="text-[10px] font-bold tracking-[0.3em] text-neutral-400 mb-4 uppercase">
            Signature Pieces
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-wide uppercase text-neutral-900">
            Best Sellers
          </h2>
          <div className="w-12 h-[1px] bg-neutral-900 mt-8"></div>
          
          <Link to="/products" className="absolute right-0 bottom-0 hidden sm:block text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 hover:text-neutral-900 hover:underline underline-offset-8 decoration-1 transition-all">
            Shop All &rarr;
          </Link>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 animate-pulse">
              Curating Collection...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-16 sm:gap-x-10 sm:gap-y-20">
            {products.map((product) => (
              <div key={product._id} className="w-full">
                {/* 🌟 FORCE "Best Seller" BADGE */}
                <ProductCard product={product} badgeOverride="Best Seller" />
              </div>
            ))}
          </div>
        )}

        <div className="mt-16 text-center sm:hidden">
           <Link to="/products" className="inline-block border border-neutral-900 text-neutral-900 px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-900 hover:text-white transition-colors">
            Shop All Best Sellers
          </Link>
        </div>

      </div>
    </section>
  );
}