import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import ProductCard from "../components/ProductCard";

// 🌟 TOP LUXURY BRANDS WITH CURATED AESTHETIC IMAGES FOR THE FILTER
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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // 🔎 URL SEARCH PARAMS - The Single Source of Truth
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
  }, []);

  // 🟢 SYNC URL TO STATE (Runs on mount & URL changes)
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

  // 🟢 DYNAMIC EXTRACTIONS & MERGING FOR FILTERS
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
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Smooth scroll to top on page change
  };

  const clearFilters = () => {
    setMinPrice(""); setMaxPrice(""); setSeason(""); setSize(""); setNewArrival(false); setSort("");
    setCurrentPage(1);
    navigate("/products", { replace: true }); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 🚫 HELPER FUNCTION TO BLOCK INVALID CHARACTERS IN PRICE INPUTS
  const preventInvalidPriceChars = (e) => {
    if (['e', 'E', '+', '-', '.'].includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-neutral-200 text-neutral-900">
      <div className="max-w-[100rem] mx-auto px-5 sm:px-8 lg:px-14 py-28 sm:py-36">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-neutral-200 pb-8">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-wide uppercase">
              The Collection
            </h1>
            <p className="mt-4 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.3em]">
              {brandFilter ? `${brandFilter} Edit` : category ? `${category} Edit` : "Curated Essentials"} • {displayedProducts.length} Pieces
            </p>
          </div>

          {/* DESKTOP SORTING */}
          <div className="hidden md:flex items-center space-x-2 border-b border-neutral-300 hover:border-neutral-900 transition-colors group pb-2">
             <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Sort:</span>
            <select
              className="appearance-none bg-transparent pl-2 pr-8 text-[10px] font-bold uppercase tracking-[0.2em] focus:outline-none cursor-pointer"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="">Featured</option>
              <option value="newest">New Arrivals</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* MOBILE FILTER TOGGLE */}
        <button 
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          className="md:hidden w-full flex items-center justify-between border border-neutral-200 p-4 mb-8 text-[10px] font-bold uppercase tracking-[0.2em] bg-neutral-50 active:bg-neutral-100 transition-colors"
        >
          <span>Refine & Sort</span>
          <svg className={`w-4 h-4 transform transition-transform ${mobileFiltersOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
        </button>

        <div className="flex flex-col md:flex-row gap-10 lg:gap-16">
          
          {/* LEFT SIDEBAR: EDITORIAL FILTERS */}
          <aside className={`w-full md:w-56 lg:w-64 flex-shrink-0 transition-all duration-300 overflow-hidden md:block ${mobileFiltersOpen ? "max-h-[3000px] opacity-100" : "max-h-0 opacity-0 md:max-h-none md:opacity-100"}`}>
            <div className="md:sticky md:top-32 space-y-10 pb-10 pr-2">
              
              {/* 🟢 DYNAMIC BRANDS WITH IMAGES IN FILTER */}
              {availableBrands.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-bold tracking-[0.25em] uppercase border-b border-neutral-100 pb-3 mb-4">Designer Brands</h3>
                  <div className="flex flex-col space-y-3">
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
                        <span className={`text-[11px] uppercase tracking-[0.15em] truncate ${brandFilter === b.name ? "font-bold text-neutral-900" : "font-medium text-neutral-500 group-hover:text-neutral-900"}`}>{b.name}</span>
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
                        <span className={`text-[11px] uppercase tracking-[0.15em] ${category === cat ? "font-bold text-neutral-900" : "font-medium text-neutral-500 group-hover:text-neutral-900"}`}>{cat}</span>
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

              {/* PRICE RANGE (UPDATED LOGIC) */}
              <div>
                <h3 className="text-[10px] font-bold tracking-[0.25em] uppercase border-b border-neutral-100 pb-3 mb-4">Price Range</h3>
                <div className="flex items-center gap-3">
                  <input 
                    type="number" 
                    min="0" 
                    placeholder="Min ₹" 
                    value={minPrice} 
                    onKeyDown={preventInvalidPriceChars}
                    onChange={(e) => setMinPrice(e.target.value.replace(/[^0-9]/g, ""))} 
                    className="w-full border border-neutral-200 py-2.5 px-3 text-[11px] font-light placeholder-neutral-400 focus:outline-none focus:border-neutral-900" 
                  />
                  <span className="text-neutral-300">-</span>
                  <input 
                    type="number" 
                    min="0" 
                    placeholder="Max ₹" 
                    value={maxPrice} 
                    onKeyDown={preventInvalidPriceChars}
                    onChange={(e) => setMaxPrice(e.target.value.replace(/[^0-9]/g, ""))} 
                    className="w-full border border-neutral-200 py-2.5 px-3 text-[11px] font-light placeholder-neutral-400 focus:outline-none focus:border-neutral-900" 
                  />
                </div>
              </div>

              {/* NEW ARRIVALS */}
              <div className="pt-2">
                <label className="flex items-center cursor-pointer group">
                  <div className={`w-3.5 h-3.5 border mr-3 shrink-0 flex items-center justify-center transition-colors ${newArrival ? "bg-neutral-900 border-neutral-900" : "border-neutral-300 group-hover:border-neutral-500"}`}>
                     {newArrival && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <input type="checkbox" className="hidden" checked={newArrival} onChange={(e) => setNewArrival(e.target.checked)} />
                  <span className="text-[10px] font-bold tracking-[0.25em] uppercase">New Arrivals Only</span>
                </label>
              </div>

              {/* CLEAR FILTERS */}
              <div className="pt-6">
                <button onClick={clearFilters} className="w-full border border-neutral-900 text-neutral-900 py-3 text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-900 hover:text-white transition-colors">
                  Clear All Filters
                </button>
              </div>

            </div>
          </aside>

          {/* RIGHT SIDE: PRODUCT GRID & PAGINATION */}
          <main className="flex-1 w-full">
            {loading ? (
              <div className="h-96 flex flex-col items-center justify-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 animate-pulse">
                  Curating Collection...
                </p>
              </div>
            ) : paginatedProducts.length === 0 ? (
              <div className="h-96 flex flex-col items-center justify-center text-center px-4 bg-neutral-50/50 border border-neutral-100">
                <h3 className="text-xl font-light tracking-wide uppercase mb-3">No Pieces Found</h3>
                <p className="text-sm font-light tracking-wide text-neutral-500 mb-8 max-w-sm mx-auto">Adjust your filters to discover more of the collection.</p>
                <button onClick={clearFilters} className="bg-neutral-900 text-white px-8 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-colors">
                  Reset Selection
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-12 sm:gap-x-6 sm:gap-y-16">
                  {paginatedProducts.map((p) => (
                    <ProductCard key={p._id} product={p} />
                  ))}
                </div>

                {/* 📄 PAGINATION UI */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-4 mt-20 pt-10 border-t border-neutral-200">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 border border-transparent disabled:opacity-30 disabled:cursor-not-allowed hover:text-neutral-900 transition-colors"
                    >
                      Prev
                    </button>

                    <div className="flex space-x-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-8 h-8 flex items-center justify-center text-[10px] font-bold transition-all ${
                            currentPage === page
                              ? "bg-neutral-900 text-white"
                              : "bg-transparent text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 border border-transparent disabled:opacity-30 disabled:cursor-not-allowed hover:text-neutral-900 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </main>

        </div>
      </div>
    </div>
  );
}