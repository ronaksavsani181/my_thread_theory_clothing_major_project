import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import ProductCard from "../ProductCard";

export default function NewArrivals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        setLoading(true);
        const res = await api.get("/products");
        // 🌟 Filter specifically for new arrivals
        const newItems = res.data.filter(p => p.isNewArrival === true).slice(0, 8);
        setProducts(newItems); 
      } catch (error) {
        console.error("New Arrivals error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNewArrivals();
  }, []);

  if (!loading && products.length === 0) return null; // Hide if none exist

  return (
    <section className="py-24 px-6 sm:px-8 lg:px-12 max-w-[90rem] mx-auto bg-white border-t border-neutral-100">
      
      {/* MINIMALIST EDITORIAL HEADER */}
      <div className="flex justify-between items-end mb-12 border-b border-neutral-200 pb-6">
        <div>
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400 block mb-2">Just Landed</span>
          <h2 className="text-2xl md:text-3xl font-light tracking-wide uppercase text-neutral-900">
            New Arrivals
          </h2>
        </div>
        <Link to="/products" className="hidden sm:block text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 hover:text-neutral-900 hover:underline underline-offset-8 decoration-1 transition-all">
          View All &rarr;
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
               {/* 🌟 FORCE "New" BADGE */}
              <ProductCard product={product} badgeOverride="New" />
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-12 text-center sm:hidden">
         <Link to="/products" className="inline-block border border-neutral-900 text-neutral-900 px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-900 hover:text-white transition-colors">
          View All Arrivals
        </Link>
      </div>
    </section>
  );
}