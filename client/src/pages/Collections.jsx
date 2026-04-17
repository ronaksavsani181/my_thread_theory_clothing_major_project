import { useEffect, useState, useRef } from "react";
import api from "../services/api";
import ProductCard from "../components/ProductCard";
import womenvideo from "../../public/womenvideo.mp4";
import Brand from '../components/home/Brand';

// Luxury placeholder media for the top campaign section
const CAMPAIGNS = [
  {
    id: "Women",
    title: "The Women's Edit",
    subtitle: "Fluidity & Form",
    video: womenvideo, 
  },
  {
    id: "Men",
    title: "The Men's Edit",
    subtitle: "Tailored Precision",
    img: "https://i.pinimg.com/736x/92/cd/20/92cd20e64821d5f5c6d5ecf8f6656150.jpg",
  },
  {
    id: "Kids",
    title: "The Kids Edit",
    subtitle: "Playful Elegance",
    img: "https://i.pinimg.com/736x/49/99/79/499979c9d76311331ed17ec87988f586.jpg",
  }
];

const TABS = ["All", "Women", "Men", "Kids", "Accessories"];
const ITEMS_PER_PAGE = 12; // 12 is perfect for 2-col mobile, 3-col tablet, 4-col desktop

export default function Collections() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  
  // Pagination State
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  
  // Refs
  const productGridRef = useRef(null);
  const videoRef = useRef(null);
  
  // Animation State for Product Grid
  const [gridVisible, setGridVisible] = useState(false);

  // Set video to slow-motion (0.5x) on load for a premium, dreamy feel
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5;
    }
  }, []);

  // Scroll detection for Product Grid Animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setGridVisible(true);
        }
      },
      { threshold: 0.05 } // Triggers very early to ensure visibility
    );

    if (productGridRef.current) {
      observer.observe(productGridRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // Fetch Products
  useEffect(() => {
    const fetchCollection = async () => {
      setLoading(true);
      try {
        const params = activeCategory === "All" ? {} : { category: activeCategory };
        const res = await api.get("/products", { params });
        setProducts(res.data);
      } catch (error) {
        console.error("Error fetching collection:", error);
      } finally {
        setLoading(false);
        // Reset grid animation trigger on category change for fresh cascade
        setGridVisible(false);
        setTimeout(() => setGridVisible(true), 50);
      }
    };

    fetchCollection();
  }, [activeCategory]);

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    setVisibleCount(ITEMS_PER_PAGE); 
  };

  const handleCampaignClick = (categoryId) => {
    handleCategoryChange(categoryId);
    // Smoothly scroll down to the product grid
    if (productGridRef.current) {
      const offset = 80; 
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = productGridRef.current.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + ITEMS_PER_PAGE);
  };

  // Determine which products to display based on the visibleCount limit
  const displayedProducts = products.slice(0, visibleCount);

  return (
    <div className="bg-white min-h-screen font-sans pb-32 selection:bg-neutral-200">
      
      {/* =========================================
          SECTION 1: THE CAMPAIGN LOOKBOOK
          ========================================= */}
      <div className="max-w-[100rem] mx-auto px-5 sm:px-8 lg:px-12 pt-28 lg:pt-36 mb-20 lg:mb-32">
        
        <div className="flex flex-col items-center text-center mb-12 lg:mb-16 opacity-0 animate-[fade-in-up_0.8s_ease-out_forwards]">
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light tracking-wide uppercase text-neutral-900 mb-4 lg:mb-6">
            The Collections
          </h1>
          <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400 max-w-sm sm:max-w-lg leading-loose px-4">
            Explore our curated edits. Designed in-house, crafted for the modern aesthetic.
          </p>
        </div>

        {/* 🌟 BULLETPROOF RESPONSIVE EDITORIAL LAYOUT */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 lg:h-[75vh] xl:h-[80vh] min-h-[600px]">
          
          {/* Main Large Block (Women) - SLOW MOTION INFINITE VIDEO */}
          <div 
            onClick={() => handleCampaignClick("Women")}
            className="w-full lg:w-7/12 h-[60vh] lg:h-full relative group cursor-pointer overflow-hidden bg-neutral-950 flex items-center justify-center opacity-0 animate-[fade-in-up_0.8s_ease-out_0.2s_forwards]"
          >
            <video 
              ref={videoRef}
              autoPlay 
              loop 
              muted 
              playsInline
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-[2s] ease-[0.25,1,0.5,1] group-hover:scale-105"
            >
              <source src={CAMPAIGNS[0].video} type="video/mp4" />
            </video>
            
            {/* Dark overlay to keep text readable */}
            <div className="absolute inset-0 bg-neutral-950/20 transition-colors duration-700 group-hover:bg-neutral-950/50 pointer-events-none"></div>
            
            <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-12 lg:p-16 pointer-events-none">
              <span className="text-[8px] sm:text-[9px] font-bold tracking-[0.3em] uppercase text-neutral-300 mb-2 sm:mb-3 transform transition-transform duration-700 ease-[0.25,1,0.5,1] group-hover:-translate-y-2">{CAMPAIGNS[0].subtitle}</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-widest text-white uppercase transform transition-transform duration-700 ease-[0.25,1,0.5,1] group-hover:-translate-y-2">{CAMPAIGNS[0].title}</h2>
            </div>
          </div>

          {/* Right Side Stacked Blocks (Men & Kids) */}
          <div className="w-full lg:w-5/12 flex flex-col gap-4 lg:gap-6 h-full">
            
            {/* Top Block (Men) */}
            <div 
              onClick={() => handleCampaignClick("Men")}
              className="w-full h-[45vh] lg:h-full lg:flex-1 relative group cursor-pointer overflow-hidden bg-neutral-100 opacity-0 animate-[fade-in-up_0.8s_ease-out_0.4s_forwards]"
            >
              <img src={CAMPAIGNS[1].img} alt={CAMPAIGNS[1].title} className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-[2s] ease-[0.25,1,0.5,1] group-hover:scale-105" />
              <div className="absolute inset-0 bg-neutral-950/10 transition-colors duration-700 group-hover:bg-neutral-950/40"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-10 lg:p-12 pointer-events-none">
                <span className="text-[8px] sm:text-[9px] font-bold tracking-[0.3em] uppercase text-neutral-300 mb-2 transform transition-transform duration-700 ease-[0.25,1,0.5,1] group-hover:-translate-y-2">{CAMPAIGNS[1].subtitle}</span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-widest text-white uppercase transform transition-transform duration-700 ease-[0.25,1,0.5,1] group-hover:-translate-y-2">{CAMPAIGNS[1].title}</h2>
              </div>
            </div>

            {/* Bottom Block (Kids) */}
            <div 
              onClick={() => handleCampaignClick("Kids")}
              className="w-full h-[45vh] lg:h-full lg:flex-1 relative group cursor-pointer overflow-hidden bg-neutral-100 opacity-0 animate-[fade-in-up_0.8s_ease-out_0.6s_forwards]"
            >
              <img src={CAMPAIGNS[2].img} alt={CAMPAIGNS[2].title} className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-[2s] ease-[0.25,1,0.5,1] group-hover:scale-105" />
              <div className="absolute inset-0 bg-neutral-950/10 transition-colors duration-700 group-hover:bg-neutral-950/40"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-10 lg:p-12 pointer-events-none">
                <span className="text-[8px] sm:text-[9px] font-bold tracking-[0.3em] uppercase text-neutral-300 mb-2 transform transition-transform duration-700 ease-[0.25,1,0.5,1] group-hover:-translate-y-2">{CAMPAIGNS[2].subtitle}</span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-widest text-white uppercase transform transition-transform duration-700 ease-[0.25,1,0.5,1] group-hover:-translate-y-2">{CAMPAIGNS[2].title}</h2>
              </div>
            </div>

          </div>
        </div>
      </div>

      <Brand />

      {/* =========================================
          SECTION 2: THE ARCHIVE (Interactive Grid)
          ========================================= */}
      <div className="max-w-[100rem] mx-auto px-5 sm:px-8 lg:px-12 pt-16 lg:pt-24 border-t border-neutral-100">
        
        {/* INTERACTIVE TABS (Mobile Scrollable) */}
        <div className="w-full overflow-x-auto no-scrollbar mb-16 sm:mb-20 pb-4">
          <div className="flex items-center md:justify-center gap-8 sm:gap-12 lg:gap-16 min-w-max px-2">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => handleCategoryChange(tab)}
                className={`relative text-[10px] sm:text-[11px] font-bold tracking-[0.2em] sm:tracking-[0.25em] uppercase transition-all duration-500 pb-2.5 hover:tracking-[0.3em] ${
                  activeCategory === tab ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-600"
                }`}
              >
                {tab}
                {/* Animated Underline */}
                <span 
                  className={`absolute left-0 bottom-0 h-[2px] bg-neutral-900 transition-all duration-500 ease-[0.25,1,0.5,1] ${
                    activeCategory === tab ? "w-full" : "w-0"
                  }`}
                ></span>
              </button>
            ))}
          </div>
        </div>

        {/* DYNAMIC PRODUCT GRID */}
        <div ref={productGridRef}>
          {loading ? (
            <div className="h-[40vh] sm:h-96 flex flex-col items-center justify-center">
              <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 animate-pulse">
                Curating the {activeCategory === "All" ? "Archive" : activeCategory + " Edit"}...
              </p>
            </div>
          ) : displayedProducts.length === 0 ? (
            <div className="h-[40vh] sm:h-96 flex flex-col items-center justify-center text-center px-4 bg-neutral-50/50 border border-neutral-100 opacity-0 animate-[fade-in-up_0.6s_ease-out_forwards]">
              <h3 className="text-xl sm:text-2xl font-light tracking-wide text-neutral-900 uppercase mb-3">No Pieces Found</h3>
              <p className="text-xs sm:text-sm font-light tracking-wide text-neutral-500 mb-8 max-w-xs sm:max-w-sm mx-auto leading-relaxed">
                We are currently restocking the {activeCategory} collection. Please check back later.
              </p>
              <button
                onClick={() => handleCategoryChange("All")}
                className="border border-neutral-900 bg-white text-neutral-900 px-8 sm:px-10 py-3.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-900 hover:text-white transition-colors active:scale-95"
              >
                View All Pieces
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-12 sm:gap-x-6 sm:gap-y-16 lg:gap-x-8 lg:gap-y-20">
                {displayedProducts.map((p, index) => (
                  <div 
                    key={p._id} 
                    className={`transition-all duration-700 ease-[0.25,1,0.5,1] transform ${gridVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"}`}
                    /* 🌟 SMART DELAY: Uses modulo so newly loaded items stagger from 0ms, preventing massive delays on page 2 */
                    style={{ transitionDelay: `${(index % ITEMS_PER_PAGE) * 100}ms` }} 
                  >
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>

              {/* LOAD MORE BUTTON (Pagination) */}
              {products.length > visibleCount && (
                <div className="mt-20 sm:mt-24 flex justify-center opacity-0 animate-[fade-in-up_0.8s_ease-out_1s_forwards]">
                  <button
                    onClick={handleLoadMore}
                    className="group relative overflow-hidden border border-neutral-300 bg-transparent text-neutral-900 px-10 sm:px-14 py-4.5 sm:py-5 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] transition-all duration-500 hover:border-neutral-900 hover:text-white active:scale-[0.98]"
                  >
                    <span className="relative z-10 transition-colors duration-500 group-hover:text-white">Load More Pieces</span>
                    <div className="absolute inset-0 h-full w-full scale-y-0 bg-neutral-900 transition-transform duration-500 ease-[0.25,1,0.5,1] group-hover:scale-y-100 origin-bottom"></div>
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      </div>

      {/* Global CSS for Animations and Hiding Scrollbars */}
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}