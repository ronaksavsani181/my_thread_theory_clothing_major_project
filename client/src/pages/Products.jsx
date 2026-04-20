import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import api from "../services/api";
import ProductCard from "../components/ProductCard";
import ProductCardSkeleton from "../components/ProductCardSkeleton"; // 🌟 IMPORTED SKELETON

// 🌟 TOP LUXURY BRANDS WITH CURATED AESTHETIC IMAGES
const STATIC_BRANDS = [
  { name: "H&M", image: "https://i.pinimg.com/736x/13/19/c0/1319c023694bb21a9f668796c6ea33b6.jpg?q=80&w=2000&auto=format&fit=crop" },
  { name: "Lacoste", image: "https://i.pinimg.com/736x/29/f6/49/29f6492fa8560ea4c74dcb474d1cc9cf.jpg?q=80&w=2000&auto=format&fit=crop" },
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
const ITEMS_PER_PAGE = 12; // 🌟 PAGINATION CONSTANT

export default function Products() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  // 🔎 URL SEARCH PARAMS
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // 🎛️ FILTER STATES
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [season, setSeason] = useState("");
  const [size, setSize] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [newArrival, setNewArrival] = useState(false);
  const [sort, setSort] = useState("");
  
  // 📄 PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);

  // 🟢 LOAD PAGE FROM TOP ON INITIAL RENDER
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setIsPageLoaded(true), 100);
  }, []);

  // 🟢 LOCK BODY SCROLL ONLY WHEN MOBILE DRAWER IS OPEN
  useEffect(() => {
    if (isFilterDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isFilterDrawerOpen]);

  // 🟢 SYNC URL TO STATE
  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
    setCategory(searchParams.get("category") || "");
    setBrandFilter(searchParams.get("brand") || "");
  }, [searchParams]);

  // 🟢 FETCH PRODUCTS ONCE
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await api.get("/products");
        setAllProducts(res.data);
      } catch (error) {
        console.error("Failed to load products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // ⚡ URL PARAMETER UPDATER HELPER
  const updateURLParams = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  // 🟢 DYNAMIC EXTRACTIONS & STRICT A-Z SORTING
  const availableBrands = useMemo(() => {
    const dbBrands = [...new Set(allProducts.map(p => p.brand?.trim()).filter(Boolean))];
    return dbBrands.map(dbBrandName => {
      const staticMatch = STATIC_BRANDS.find(
        sb => sb.name.toLowerCase() === dbBrandName.toLowerCase()
      );
      return {
        name: dbBrandName,
        image: staticMatch ? staticMatch.image : FALLBACK_IMAGE
      };
    }).sort((a, b) => a.name.localeCompare(b.name)); 
  }, [allProducts]);

  const availableCategories = useMemo(() => {
    const cats = new Set(allProducts.map(p => p.category?.trim()).filter(Boolean));
    return Array.from(cats).sort((a, b) => a.localeCompare(b)); 
  }, [allProducts]);

  const availableSizes = useMemo(() => {
    const sizesSet = new Set();
    allProducts.forEach(product => {
      if (Array.isArray(product.sizesAvailable)) {
        product.sizesAvailable.forEach(s => sizesSet.add(s.trim().toUpperCase()));
      }
    });
    const sizeOrder = { 'XXS': 1, 'XS': 2, 'S': 3, 'M': 4, 'L': 5, 'XL': 6, 'XXL': 7 };
    return Array.from(sizesSet).sort((a, b) => {
      if (sizeOrder[a] && sizeOrder[b]) return sizeOrder[a] - sizeOrder[b];
      if (sizeOrder[a]) return -1;
      if (sizeOrder[b]) return 1;
      return a.localeCompare(b);
    });
  }, [allProducts]);

  // ⚡ INSTANT CLIENT-SIDE FILTERING 
  const displayedProducts = useMemo(() => {
    let filtered = [...allProducts];

    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (category) {
      filtered = filtered.filter(p => p.category?.trim().toLowerCase() === category.trim().toLowerCase());
    }
    if (brandFilter) {
      filtered = filtered.filter(p => p.brand?.trim().toLowerCase() === brandFilter.trim().toLowerCase());
    }
    if (season) {
      filtered = filtered.filter(p => p.season === season);
    }
    if (size) {
      filtered = filtered.filter(p => p.sizesAvailable?.map(s => s.trim().toUpperCase()).includes(size));
    }
    if (minPrice) {
      filtered = filtered.filter(p => p.price >= Number(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter(p => p.price <= Number(maxPrice));
    }
    if (newArrival) {
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);
      filtered = filtered.filter(p => new Date(p.createdAt) >= last30Days);
    }

    if (sort === "priceLow") filtered.sort((a, b) => a.price - b.price);
    if (sort === "priceHigh") filtered.sort((a, b) => b.price - a.price);
    if (sort === "newest") filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return filtered;
  }, [allProducts, searchQuery, category, brandFilter, season, size, minPrice, maxPrice, newArrival, sort]);

  // 🟢 RESET PAGE TO 1 WHEN FILTERS CHANGE
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, category, brandFilter, season, size, minPrice, maxPrice, newArrival, sort]);

  // 📄 PAGINATION LOGIC CALCULATION
  const totalPages = Math.ceil(displayedProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = displayedProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const clearFilters = () => {
    setMinPrice(""); setMaxPrice(""); setSeason(""); setSize(""); setNewArrival(false); setSort("");
    setCurrentPage(1);
    navigate("/products", { replace: true }); 
    setIsFilterDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const preventInvalidPriceChars = (e) => {
    if (['e', 'E', '+', '-', '.'].includes(e.key)) {
      e.preventDefault();
    }
  };

  // ======================================================================
  // 🌟 REUSABLE FILTER UI COMPONENT
  // ======================================================================
  const FilterContent = (
    <div className="space-y-10">
      {/* SORTING */}
      <div>
        <h3 className="text-[10px] font-bold tracking-[0.25em] uppercase border-b border-neutral-100 pb-3 mb-4">Sort By</h3>
        <div className="relative">
          <select
            className="w-full appearance-none bg-neutral-50 border border-neutral-200 py-3 px-4 text-[10px] sm:text-xs font-bold uppercase tracking-[0.1em] text-neutral-900 focus:outline-none focus:border-neutral-900 cursor-pointer"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="">Featured</option>
            <option value="newest">Newest Arrivals</option>
            <option value="priceLow">Price: Low to High</option>
            <option value="priceHigh">Price: High to Low</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none stroke-[1.5]" />
        </div>
      </div>

      {/* DYNAMIC BRANDS */}
      {availableBrands.length > 0 && (
        <div>
          <h3 className="text-[10px] font-bold tracking-[0.25em] uppercase border-b border-neutral-100 pb-3 mb-4">Designer Brands</h3>
          <div className="flex flex-col space-y-3 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
            {availableBrands.map(b => (
              <label key={b.name} className="flex items-center cursor-pointer group">
                <div className={`w-3.5 h-3.5 border mr-3 shrink-0 flex items-center justify-center transition-colors ${brandFilter === b.name ? "bg-neutral-900 border-neutral-900" : "border-neutral-300 group-hover:border-neutral-500"}`}>
                   {brandFilter === b.name && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                </div>
                <img 
                  src={b.image} 
                  alt={b.name} 
                  className={`w-6 h-6 rounded-full object-cover mr-2.5 border transition-all ${brandFilter === b.name ? "border-neutral-900" : "border-neutral-200 group-hover:border-neutral-400"}`} 
                />
                <input type="checkbox" className="hidden" checked={brandFilter === b.name} onChange={() => updateURLParams("brand", brandFilter === b.name ? "" : b.name)} />
                <span className={`text-xs uppercase tracking-[0.15em] truncate ${brandFilter === b.name ? "font-bold text-neutral-900" : "font-light text-neutral-500 group-hover:text-neutral-900"}`}>{b.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* DYNAMIC CATEGORY */}
      {availableCategories.length > 0 && (
        <div>
          <h3 className="text-[10px] font-bold tracking-[0.25em] uppercase border-b border-neutral-100 pb-3 mb-4">Category</h3>
          <div className="flex flex-col space-y-3">
            {availableCategories.map(cat => (
              <label key={cat} className="flex items-center cursor-pointer group">
                <div className={`w-3.5 h-3.5 border mr-3 shrink-0 flex items-center justify-center transition-colors ${category === cat ? "bg-neutral-900 border-neutral-900" : "border-neutral-300 group-hover:border-neutral-500"}`}>
                   {category === cat && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                </div>
                <input type="checkbox" className="hidden" checked={category === cat} onChange={() => updateURLParams("category", category === cat ? "" : cat)} />
                <span className={`text-[10px] sm:text-[11px] uppercase tracking-[0.15em] ${category === cat ? "font-bold text-neutral-900" : "font-light text-neutral-500 group-hover:text-neutral-900"}`}>{cat}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* DYNAMIC SIZES */}
      {availableSizes.length > 0 && (
        <div>
          <h3 className="text-[10px] font-bold tracking-[0.25em] uppercase border-b border-neutral-100 pb-3 mb-4">Size</h3>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map(s => (
              <button 
                key={s} 
                onClick={() => setSize(size === s ? "" : s)}
                className={`min-w-[40px] h-10 px-2 flex items-center justify-center text-[10px] font-bold tracking-widest transition-all ${size === s ? 'bg-neutral-900 border-neutral-900 text-white' : 'bg-white border border-neutral-200 text-neutral-500 hover:border-neutral-900 hover:text-neutral-900'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PRICE RANGE */}
      <div>
        <h3 className="text-[10px] font-bold tracking-[0.25em] uppercase border-b border-neutral-100 pb-3 mb-4">Price Range</h3>
        <div className="flex items-center gap-3">
          <input 
            type="number" min="0" placeholder="Min ₹" 
            value={minPrice} onKeyDown={preventInvalidPriceChars} onChange={(e) => setMinPrice(e.target.value.replace(/[^0-9]/g, ""))} 
            className="w-full border border-neutral-200 py-3 px-3 text-[11px] font-light placeholder-neutral-400 focus:outline-none focus:border-neutral-900 bg-neutral-50" 
          />
          <span className="text-neutral-300">-</span>
          <input 
            type="number" min="0" placeholder="Max ₹" 
            value={maxPrice} onKeyDown={preventInvalidPriceChars} onChange={(e) => setMaxPrice(e.target.value.replace(/[^0-9]/g, ""))} 
            className="w-full border border-neutral-200 py-3 px-3 text-[11px] font-light placeholder-neutral-400 focus:outline-none focus:border-neutral-900 bg-neutral-50" 
          />
        </div>
      </div>

      {/* NEW ARRIVALS */}
      <div>
        <label className="flex items-center cursor-pointer group">
          <div className={`w-4 h-4 border mr-3 shrink-0 flex items-center justify-center transition-colors ${newArrival ? "bg-neutral-900 border-neutral-900" : "border-neutral-300 group-hover:border-neutral-500"}`}>
             {newArrival && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
          </div>
          <input type="checkbox" className="hidden" checked={newArrival} onChange={(e) => setNewArrival(e.target.checked)} />
          <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-neutral-900">New Arrivals Only</span>
        </label>
      </div>
      
      {/* DESKTOP CLEAR FILTERS */}
      <div className="pt-2 hidden md:block">
        <button onClick={clearFilters} className="w-full border border-neutral-900 text-neutral-900 py-3.5 text-[9px] font-bold uppercase tracking-[0.25em] hover:bg-neutral-900 hover:text-white transition-colors active:scale-95">
          Clear All Filters
        </button>
      </div>
    </div>
  );

  return (
    <div className={`bg-white min-h-screen font-sans selection:bg-neutral-200 text-neutral-900 transition-opacity duration-1000 ${isPageLoaded ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* 📱 MOBILE SLIDING FILTER DRAWER */}
      <div className={`fixed inset-0 z-[70] transition-opacity duration-500 md:hidden ${isFilterDrawerOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
        <div className="absolute inset-0 bg-neutral-950/40 backdrop-blur-sm transition-opacity" onClick={() => setIsFilterDrawerOpen(false)}></div>
        <div className={`absolute right-0 top-0 h-full w-[85%] max-w-[380px] bg-white shadow-[-\-20px_0_40px_rgba(0,0,0,0.15)] transform transition-transform duration-500 ease-[0.25,1,0.5,1] flex flex-col ${isFilterDrawerOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex items-center justify-between px-6 py-6 border-b border-neutral-100 shrink-0">
            <h2 className="text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-900">Refine & Sort</h2>
            <button onClick={() => setIsFilterDrawerOpen(false)} className="p-2 -mr-2 text-neutral-400 hover:text-neutral-900 transition-transform active:scale-95">
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-8">
            {FilterContent}
          </div>
          <div className="p-6 border-t border-neutral-100 bg-white shrink-0 flex gap-4">
            <button onClick={clearFilters} className="flex-1 border border-neutral-200 text-neutral-500 py-4 text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-100 hover:text-neutral-900 transition-colors">
              Clear All
            </button>
            <button onClick={() => setIsFilterDrawerOpen(false)} className="flex-1 bg-neutral-950 text-white py-4 text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-colors">
              Show Results
            </button>
          </div>
        </div>
      </div>

      {/* MAIN PAGE CONTENT */}
      <div className="max-w-[100rem] mx-auto px-5 sm:px-8 lg:px-12 py-24 sm:py-32 lg:py-40">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 border-b border-neutral-200 pb-8 animate-[fade-in-up_0.8s_ease-out_forwards]">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-wide uppercase text-neutral-900">
              The Collection
            </h1>
            <p className="mt-4 sm:mt-5 text-[9px] sm:text-[10px] font-bold text-neutral-400 uppercase tracking-[0.3em]">
              {brandFilter ? `${brandFilter} Edit` : category ? `${category} Edit` : "Curated Essentials"} • {displayedProducts.length} Pieces
            </p>
          </div>
          <button 
            onClick={() => setIsFilterDrawerOpen(true)}
            className="md:hidden mt-8 w-full flex items-center justify-between border border-neutral-200 bg-neutral-50 px-5 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-900 hover:text-neutral-500 transition-colors group active:bg-neutral-100"
          >
            <span>Filter & Sort</span>
            <SlidersHorizontal className="w-4 h-4 stroke-[1.5]" />
          </button>
        </div>

        {/* SPLIT LAYOUT (DESKTOP) */}
        <div className="flex flex-col md:flex-row gap-10 lg:gap-16 items-start">
          <aside className="hidden md:block w-56 lg:w-64 shrink-0 animate-[fade-in-up_0.8s_ease-out_0.2s_forwards] opacity-0">
            <div className="sticky top-32 pb-20">
              {FilterContent}
            </div>
          </aside>

          <main className="flex-1 w-full">
            {loading ? (
              /* 🌟 SKELETON UI INTEGRATION 🌟 */
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-12 sm:gap-x-6 sm:gap-y-16 lg:gap-x-8 lg:gap-y-20">
                {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                  <ProductCardSkeleton key={index} />
                ))}
              </div>
            ) : paginatedProducts.length === 0 ? (
              <div className="h-[40vh] sm:h-[50vh] flex flex-col items-center justify-center text-center px-4 bg-neutral-50/50 border border-neutral-100 opacity-0 animate-[fade-in-up_0.6s_ease-out_forwards]">
                <h3 className="text-xl sm:text-2xl font-light tracking-wide uppercase mb-3 text-neutral-900">No Pieces Found</h3>
                <p className="text-xs sm:text-sm font-light tracking-wide text-neutral-500 mb-8 max-w-sm mx-auto leading-relaxed">Adjust your filters to discover more of the collection.</p>
                <button onClick={clearFilters} className="border border-neutral-900 text-neutral-900 px-10 py-3.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-neutral-900 hover:text-white transition-all active:scale-95">
                  Reset Selection
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-12 sm:gap-x-6 sm:gap-y-16 lg:gap-x-8 lg:gap-y-20">
                  {paginatedProducts.map((p, index) => (
                    <div 
                      key={p._id} 
                      className="opacity-0 animate-[fade-in-up_0.8s_ease-out_forwards]"
                      style={{ animationDelay: `${(index % ITEMS_PER_PAGE) * 80}ms` }} 
                    >
                      <ProductCard product={p} />
                    </div>
                  ))}
                </div>

                {/* PAGINATION UI */}
                {totalPages > 1 && (
                  <div className="flex flex-col items-center justify-center space-y-6 mt-20 sm:mt-24 pt-10 sm:pt-12 border-t border-neutral-200 opacity-0 animate-[fade-in-up_0.8s_ease-out_1s_forwards]">
                    <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.25em] text-neutral-400">
                      Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex items-center space-x-4 sm:space-x-6">
                      <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 border border-transparent disabled:opacity-20 disabled:cursor-not-allowed hover:text-neutral-900 transition-colors">
                        &larr; Prev
                      </button>
                      <div className="flex space-x-1.5 sm:space-x-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button key={page} onClick={() => handlePageChange(page)} className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-[9px] sm:text-[10px] font-bold transition-all ${currentPage === page ? "bg-neutral-900 text-white border border-neutral-900" : "bg-transparent text-neutral-500 border border-transparent hover:border-neutral-300 hover:text-neutral-900"}`}>
                            {page}
                          </button>
                        ))}
                      </div>
                      <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 border border-transparent disabled:opacity-20 disabled:cursor-not-allowed hover:text-neutral-900 transition-colors">
                        Next &rarr;
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
}