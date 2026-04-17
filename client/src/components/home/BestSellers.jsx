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
        
        // 🌟 Filter for Best Sellers, fallback to top rated if needed
        const bestItems = res.data.filter(p => p.isBestSeller === true).slice(0, 8);
        
        // Safety fallback: if no items are explicitly marked "isBestSeller", just show 4 items
        if (bestItems.length === 0 && res.data.length > 0) {
          setProducts(res.data.slice(0, 4));
        } else {
          setProducts(bestItems);
        }
        
      } catch (error) {
        console.error("Best Sellers error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBestSellers();
  }, []);

  // Hide the section entirely if there are no products to show
  if (!loading && products.length === 0) return null; 

  return (
    <section className="py-20 sm:py-24 lg:py-32 px-5 sm:px-8 lg:px-12 max-w-[100rem] mx-auto bg-white border-t border-neutral-100 font-sans overflow-hidden">
      
      {/* MINIMALIST EDITORIAL HEADER */}
      <div className="flex justify-between items-end mb-10 sm:mb-12 border-b border-neutral-200 pb-5 sm:pb-6">
        <div className="transform opacity-0 animate-[fade-in-up_0.6s_ease-out_forwards]">
          <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400 block mb-1.5 sm:mb-2">
            Community Favorites
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-light tracking-wide uppercase text-neutral-900">
            Best Sellers
          </h2>
        </div>
        <Link 
          to="/products" 
          className="hidden sm:block text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 hover:text-neutral-900 hover:underline underline-offset-8 decoration-1 transition-all transform opacity-0 animate-[fade-in-up_0.6s_ease-out_0.2s_forwards]"
        >
          Shop The Edit &rarr;
        </Link>
      </div>

      {/* LOADING STATE */}
      {loading ? (
        <div className="h-[40vh] sm:h-64 flex items-center justify-center">
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 animate-pulse">
            Curating Collection...
          </p>
        </div>
      ) : (
        /* 🌟 STAGGERED ANIMATION GRID */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 sm:gap-x-6 lg:gap-x-8 gap-y-12 sm:gap-y-16">
          {products.map((product, index) => (
            <div 
              key={product._id} 
              className="w-full transform opacity-0 animate-[fade-in-up_0.6s_ease-out_forwards]"
              style={{ animationDelay: `${0.15 + (index * 0.1)}s` }} // Creates the cascading load effect
            >
              {/* Force the Best Seller badge for ultimate luxury signaling */}
              <ProductCard product={product} badgeOverride="Best Seller" />
            </div>
          ))}
        </div>
      )}
      
      {/* MOBILE FULL-WIDTH BUTTON */}
      <div className="mt-12 text-center sm:hidden transform opacity-0 animate-[fade-in-up_0.6s_ease-out_0.8s_forwards]">
         <Link 
          to="/products" 
          className="inline-block w-full border border-neutral-900 text-neutral-900 px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-900 hover:text-white transition-colors active:scale-[0.98]"
        >
          View All Best Sellers
        </Link>
      </div>

      {/* CSS For the animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </section>
  );
}