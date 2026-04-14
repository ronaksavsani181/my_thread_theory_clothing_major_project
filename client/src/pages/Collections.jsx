import { useEffect, useState, useRef } from "react";
import api from "../services/api";
import ProductCard from "../components/ProductCard";
import womenvideo from "../../public/womenvideo.mp4";
import Brand from '../components/home/Brand'
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
const ITEMS_PER_PAGE = 10; 

export default function Collections() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  
  // Pagination State
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  
  // Refs
  const productGridRef = useRef(null);
  const videoRef = useRef(null); // 🟢 Ref for the video element

  // 🟢 Set video to slow-motion (0.5x) on load
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5;
    }
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
      const offset = 100; // Account for fixed navbar
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
      <div className="max-w-[90rem] mx-auto px-6 sm:px-8 lg:px-12 pt-28 lg:pt-36 mb-24">
        
        <div className="flex flex-col items-center text-center mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-wide uppercase text-neutral-900 mb-6">
            The Collections
          </h1>
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400 max-w-lg leading-loose">
            Explore our curated edits. Designed in-house, crafted for the modern aesthetic.
          </p>
        </div>

        {/* Editorial Masonry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 lg:h-[700px]">
          
          {/* Main Large Block (Women) - SLOW MOTION INFINITE VIDEO */}
          <div 
            onClick={() => handleCampaignClick("Women")}
            className="md:col-span-7 h-[60vh] md:h-full min-h-[400px] relative group cursor-pointer overflow-hidden bg-neutral-950 flex items-center justify-center"
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
            <div className="absolute inset-0 bg-neutral-950/30 transition-colors duration-700 group-hover:bg-neutral-950/50 pointer-events-none"></div>
            
            <div className="absolute inset-0 flex flex-col justify-end p-10 sm:p-16 pointer-events-none">
              <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-neutral-300 mb-3">{CAMPAIGNS[0].subtitle}</span>
              <h2 className="text-3xl sm:text-4xl font-light tracking-widest text-white uppercase">{CAMPAIGNS[0].title}</h2>
            </div>
          </div>

          {/* Right Side Stacked Blocks (Men & Kids) */}
          <div className="md:col-span-5 flex flex-col gap-4 lg:gap-6 h-full">
            
            {/* Top Block (Men) */}
            <div 
              onClick={() => handleCampaignClick("Men")}
              className="flex-1 h-[40vh] md:h-auto min-h-[300px] relative group cursor-pointer overflow-hidden bg-neutral-100"
            >
              <img src={CAMPAIGNS[1].img} alt={CAMPAIGNS[1].title} className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-[2s] ease-[0.25,1,0.5,1] group-hover:scale-105" />
              <div className="absolute inset-0 bg-neutral-950/20 transition-colors duration-700 group-hover:bg-neutral-950/40"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-10">
                <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-neutral-300 mb-2">{CAMPAIGNS[1].subtitle}</span>
                <h2 className="text-2xl font-light tracking-widest text-white uppercase">{CAMPAIGNS[1].title}</h2>
              </div>
            </div>

            {/* Bottom Block (Kids) */}
            <div 
              onClick={() => handleCampaignClick("Kids")}
              className="flex-1 h-[40vh] md:h-auto min-h-[300px] relative group cursor-pointer overflow-hidden bg-neutral-100"
            >
              <img src={CAMPAIGNS[2].img} alt={CAMPAIGNS[2].title} className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-[2s] ease-[0.25,1,0.5,1] group-hover:scale-105" />
              <div className="absolute inset-0 bg-neutral-950/20 transition-colors duration-700 group-hover:bg-neutral-950/40"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-10">
                <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-neutral-300 mb-2">{CAMPAIGNS[2].subtitle}</span>
                <h2 className="text-2xl font-light tracking-widest text-white uppercase">{CAMPAIGNS[2].title}</h2>
              </div>
            </div>

          </div>
        </div>
      </div>
        <Brand />
      {/* =========================================
          SECTION 2: THE ARCHIVE (Interactive Grid)
          ========================================= */}
      <div ref={productGridRef} className="max-w-[90rem] mx-auto px-6 sm:px-8 lg:px-12 pt-10 border-t border-neutral-200">
        
        {/* INTERACTIVE TABS */}
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 mb-20">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => handleCategoryChange(tab)}
              className={`relative text-[10px] font-bold tracking-[0.25em] uppercase transition-colors duration-500 pb-2 ${
                activeCategory === tab ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-600"
              }`}
            >
              {tab}
              {/* Animated Underline */}
              <span 
                className={`absolute left-0 bottom-0 h-[1px] bg-neutral-900 transition-all duration-500 ease-[0.25,1,0.5,1] ${
                  activeCategory === tab ? "w-full" : "w-0"
                }`}
              ></span>
            </button>
          ))}
        </div>

        {/* DYNAMIC PRODUCT GRID */}
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 animate-pulse">
              Curating the {activeCategory === "All" ? "Archive" : activeCategory + " Edit"}...
            </p>
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center text-center px-4 bg-neutral-50/50 border border-neutral-100">
            <h3 className="text-xl font-light tracking-wide text-neutral-900 uppercase mb-3">No Pieces Found</h3>
            <p className="text-sm font-light tracking-wide text-neutral-500 mb-8 max-w-sm mx-auto">
              We are currently restocking the {activeCategory} collection. Please check back later.
            </p>
            <button
              onClick={() => handleCategoryChange("All")}
              className="border border-neutral-900 bg-white text-neutral-900 px-10 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-900 hover:text-white transition-colors"
            >
              View All Pieces
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-16 sm:gap-x-8 sm:gap-y-20">
              {displayedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>

            {/* LOAD MORE BUTTON (Pagination) */}
            {products.length > visibleCount && (
              <div className="mt-24 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  className="group relative overflow-hidden border border-neutral-300 bg-transparent text-neutral-900 px-14 py-4 text-[10px] font-bold uppercase tracking-[0.25em] transition-all duration-500 hover:border-neutral-900 hover:text-white"
                >
                  <span className="relative z-10">Load More Pieces</span>
                  <div className="absolute inset-0 h-full w-full scale-y-0 bg-neutral-900 transition-transform duration-500 ease-[0.25,1,0.5,1] group-hover:scale-y-100 origin-bottom"></div>
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}