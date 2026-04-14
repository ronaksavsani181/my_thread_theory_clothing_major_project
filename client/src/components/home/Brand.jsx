import { useEffect, useState } from "react";
import { Link } from "react-router-dom";


// Top luxury clothing brands with curated aesthetic images
const STATIC_BRANDS = [
  { name: "H&M", image: "https://i.pinimg.com/736x/13/19/c0/1319c023694bb21a9f668796c6ea33b6.jpg?q=80&w=2000&auto=format&fit=crop" },
  { name: "Lacoste", image: "https://i.pinimg.com/736x/29/f6/49/29f6492fa8560ea4c74dcb474d1cc9cf.jpg?q=80&w=1800&auto=format&fit=crop" },
  { name: "Gucci", image: "https://i.pinimg.com/736x/d3/ad/21/d3ad21db0aeb47f7af0cf361455bd7a0.jpg?q=80&w=2000&auto=format&fit=crop" },
  { name: "Tommy Hilfiger", image: "https://i.pinimg.com/736x/1e/15/24/1e1524f566e4187d43aaf7d3aff3acb0.jpg?q=80&w=2069&auto=format&fit=crop" },
  { name: "Armani Exchange", image: "https://i.pinimg.com/736x/10/7b/a8/107ba8e0030f9091b3dcd2e767e6f0ed.jpg?q=80&w=2000&auto=format&fit=crop" },
  { name: "Adidas", image: "https://i.pinimg.com/736x/68/21/4b/68214b8db3a809e8de10f1a344a2bc85.jpg?q=80&w=2000&auto=format&fit=crop" },
  { name: "ZARA", image: "https://i.pinimg.com/1200x/9b/fd/d7/9bfdd7b1e1a98ea8986da7146136ec70.jpg?q=80&w=2000&auto=format&fit=crop" },
  { name: "Nike", image: "https://i.pinimg.com/1200x/62/bd/e4/62bde49a4d6d3157881265a6e0a58fbe.jpg?q=80&w=2000&auto=format&fit=crop" },
  { name: "Givenchy", image: "https://i.pinimg.com/736x/54/70/e0/5470e0ae12dbc399ecb1af597b30f467.jpg?q=80&w=2000&auto=format&fit=crop" },
  { name: "Louis Vuitton", image: "https://i.pinimg.com/736x/59/e7/87/59e7876b9d8b4bc6ceb51b19d5d1c6cf.jpg?q=80&w=2000&auto=format&fit=crop" },
  { name: "Burberry", image: "https://i.pinimg.com/736x/11/0b/c1/110bc1c071898e25c4c634b1549b021f.jpg?q=80&w=2000&auto=format&fit=crop" }
];

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop";

export default function Brand() {
  const [displayBrands, setDisplayBrands] = useState(STATIC_BRANDS);

  useEffect(() => {
    const fetchDynamicBrands = async () => {
      try {
        const res = await api.get("/products");
        // Extract exact unique brands from DB, ignore empty ones
        const dbBrands = [...new Set(res.data.map(p => p.brand).filter(Boolean))];

        // Merge DB brands with Static Images, avoid duplicates
        const mergedBrands = dbBrands.map(dbBrandName => {
          const staticMatch = STATIC_BRANDS.find(
            sb => sb.name.toLowerCase() === dbBrandName.trim().toLowerCase()
          );
          return {
            name: dbBrandName.trim(), // Preserves DB formatting
            image: staticMatch ? staticMatch.image : FALLBACK_IMAGE
          };
        });

        if (mergedBrands.length > 0) {
          setDisplayBrands(mergedBrands);
        }
      } catch (error) {
        console.error("Failed to fetch brands from products", error);
      }
    };
    fetchDynamicBrands();
  }, []);

  return (
    <section className="bg-white py-24 sm:py-32 border-b border-neutral-200 overflow-hidden font-sans">
      <div className="text-center mb-16 px-6 flex flex-col items-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 mb-4">
          Curated Archive
        </p>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-widest text-neutral-900 uppercase">
          The Designer Edit
        </h2>
        <div className="w-12 h-[1px] bg-neutral-900 mt-8"></div>
      </div>

      <div className="relative w-full flex overflow-hidden group">
        <div className="absolute left-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

        <div className="flex gap-12 md:gap-20 items-center px-8 pt-6 w-max animate-[marquee_35s_linear_infinite] group-hover:[animation-play-state:paused]">
          {displayBrands.map((brand, index) => (
            <BrandItem key={index} brand={brand} />
          ))}
          {/* Duplicate Set for Infinite Scroll Effect */}
          {displayBrands.map((brand, index) => (
            <BrandItem key={`dup-${index}`} brand={brand} />
          ))}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}} />
    </section>
  );
}

function BrandItem({ brand }) {
  return (
    <Link
      to={`/products?brand=${encodeURIComponent(brand.name)}`}
      className="brand-item group/brand flex flex-col items-center gap-6 focus:outline-none"
    >
      <div className="h-28 w-28 md:h-40 md:w-40 rounded-full overflow-hidden border border-neutral-200 bg-neutral-50 transition-all duration-700 ease-[0.25,1,0.5,1] group-hover/brand:border-neutral-900 group-hover/brand:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.15)] group-hover/brand:-translate-y-2">
        <img
          src={brand.image}
          alt={brand.name}
          className="h-full w-full object-cover transition-all duration-700 ease-[0.25,1,0.5,1] grayscale opacity-80 group-hover/brand:grayscale-0 group-hover/brand:opacity-100 group-hover/brand:scale-110"
        />
      </div>
      <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.25em] text-neutral-400 transition-colors duration-500 group-hover/brand:text-neutral-900">
        {brand.name}
      </span>
    </Link>
  );
}