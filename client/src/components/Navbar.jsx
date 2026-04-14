import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useCart } from "../context/useCart";
import { useState, useEffect } from "react";
import api from "../services/api";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // 🟢 AJAX REAL-TIME SEARCH STATE
  const [allProducts, setAllProducts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Total cart items calculation
  const cartItemCount = cartItems.reduce((total, item) => total + item.qty, 0);

  // Close mobile menu and search when route changes
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setSearch(""); // Clear search on navigation
  }, [location.pathname]);

  // Scroll Detect (Premium Glassmorphism effect)
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🟢 FETCH ALL PRODUCTS FOR FAST CLIENT-SIDE SEARCHING
  useEffect(() => {
    if (searchOpen || menuOpen) {
      const fetchProducts = async () => {
        try {
          const res = await api.get("/products");
          setAllProducts(res.data);
        } catch (error) {
          console.error("Failed to fetch products for search");
        }
      };
      if (allProducts.length === 0) fetchProducts();
    }
  }, [searchOpen, menuOpen, allProducts.length]);

  // 🟢 REAL-TIME AJAX DEBOUNCED SEARCH LOGIC
  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Debounce to prevent lag while typing
    const timer = setTimeout(() => {
      const keyword = search.toLowerCase();
      const results = allProducts.filter(
        (p) => 
          p.title.toLowerCase().includes(keyword) || 
          p.category.toLowerCase().includes(keyword)
      ).slice(0, 12); // 🟢 INCREASED TO 12 FOR SCROLLABLE GALLERY
      
      setSearchResults(results);
      setIsSearching(false);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [search, allProducts]);

  // Standard Search Submit (Pressing Enter)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    navigate(`/products?search=${search}`);
    setSearch("");
    setSearchOpen(false);
    setMenuOpen(false);
  };

  // Dynamic styling based on scroll position
  const navBg = scrolled
    ? "bg-white/90 backdrop-blur-xl shadow-sm text-neutral-900 border-b border-neutral-200/50"
    : "bg-neutral-950 text-neutral-50 border-b border-transparent";

  const linkClass = `relative text-[11px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 py-1
    ${scrolled ? "text-neutral-500 hover:text-neutral-900" : "text-neutral-400 hover:text-white"}
    after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1px] 
    after:transition-all after:duration-300 hover:after:w-full
    ${scrolled ? "after:bg-neutral-900" : "after:bg-white"}
  `;

  const iconClass = "h-[22px] w-[22px] transition-transform duration-300 hover:scale-110";

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${navBg}`}>
        <div className="max-w-[85rem] mx-auto px-6 sm:px-8">
          <div className="flex h-[84px] items-center justify-between">
            
            {/* 1. BRAND LOGO */}
            <Link to="/" className="flex items-center gap-4 group">
              <div className={`flex h-9 w-9 items-center justify-center transition-colors duration-500 ${
                scrolled ? "bg-neutral-950 text-white" : "bg-white text-neutral-950"
              }`}>
                <span className="font-serif text-lg font-bold tracking-tighter">TT</span>
              </div>
              <span className="text-lg font-bold tracking-[0.25em] uppercase hidden sm:block">
                Thread <span className="font-light opacity-60">Theory</span>
              </span>
            </Link>

            {/* 2. DESKTOP CENTER LINKS */}
            <div className="hidden md:flex items-center gap-12 absolute left-1/2 -translate-x-1/2 mt-1">
              <Link to="/products" className={linkClass}>Shop</Link>
              <Link to="/collections" className={linkClass}>Collections</Link>
              <Link to="/wishlist" className={linkClass}>Wishlist</Link>
            </div>

            {/* 3. DESKTOP RIGHT ACTIONS */}
            <div className="hidden md:flex items-center gap-7">
              
              {/* Search Toggle */}
              <button 
                onClick={() => { setSearchOpen(!searchOpen); setSearch(""); }} 
                className="p-1 focus:outline-none"
              >
                <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </button>

              {/* User Account / Dropdown */}
              {user ? (
                <div className="relative group p-1 cursor-pointer">
                  <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  
                  {/* Hover Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-4 w-60 bg-white border border-neutral-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right translate-y-3 group-hover:translate-y-0 rounded-md overflow-hidden">
                    <div className="flex flex-col text-sm text-neutral-600">
                      <div className="px-5 py-4 border-b border-neutral-100 bg-neutral-50/50">
                        <p className="text-[10px] text-neutral-400 uppercase tracking-[0.2em] mb-1">Signed in as</p>
                        <p className="truncate text-neutral-900 font-medium tracking-wide">{user.name || "User"}</p>
                      </div>
                      <div className="p-2">
                        <Link to="/dashboard" className="block px-4 py-2.5 hover:bg-neutral-50 hover:text-neutral-900 transition-colors rounded-sm tracking-wide">My Profile</Link>
                        <Link to="/orders" className="block px-4 py-2.5 hover:bg-neutral-50 hover:text-neutral-900 transition-colors rounded-sm tracking-wide">My Orders</Link>
                        {user?.role === "admin" && (
                          <Link to="/admin" className="block px-4 py-2.5 hover:bg-neutral-50 text-indigo-600 transition-colors rounded-sm tracking-wide">Admin Panel</Link>
                        )}
                        <div className="h-px bg-neutral-100 my-1 mx-2"></div>
                        <button onClick={logout} className="w-full text-left px-4 py-2.5 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors rounded-sm tracking-wide">
                          Sign out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-6 border-r border-neutral-500/30 pr-7 mr-1">
                  <Link to="/login" className={linkClass}>Login</Link>
                  <Link to="/register" className={linkClass}>Register</Link>
                </div>
              )}

              {/* Cart Icon */}
              <Link to="/cart" className="relative p-1 group">
                <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                </svg>
                {cartItemCount > 0 && (
                  <span className={`absolute -top-1 -right-2 flex h-[18px] min-w-[18px] px-1 items-center justify-center rounded-full text-[9px] font-bold tracking-tighter transition-colors shadow-sm ${
                    scrolled ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-900 group-hover:bg-neutral-200'
                  }`}>
                    {cartItemCount}
                  </span>
                )}
              </Link>
            </div>

            {/* 4. MOBILE HAMBURGER & CART */}
            <div className="flex items-center gap-5 md:hidden">
              <Link to="/cart" className="relative p-1">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                </svg>
                {cartItemCount > 0 && (
                  <span className={`absolute -top-1 -right-2 flex h-[18px] min-w-[18px] px-1 items-center justify-center rounded-full text-[9px] font-bold shadow-sm ${
                    scrolled ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-900'
                  }`}>
                    {cartItemCount}
                  </span>
                )}
              </Link>
              <button onClick={() => { setMenuOpen(true); setSearch(""); }} className="p-1 focus:outline-none">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
            </div>

          </div>
        </div>

        {/* 🟢 DESKTOP AJAX SEARCH DROPDOWN (Perfectly Scaled & Scrollable) */}
        <div className={`overflow-hidden transition-all duration-700 ease-[0.25,1,0.5,1] absolute w-full top-full left-0 ${searchOpen ? 'max-h-[85vh] border-t border-neutral-200 bg-white/95 backdrop-blur-xl shadow-2xl opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="mx-auto max-w-[85rem] px-6 py-8">
            
            {/* Search Input (Fixed at top) */}
            <form onSubmit={handleSearchSubmit} className="relative w-full max-w-3xl mx-auto mb-6">
              <input
                type="text"
                placeholder="Search collections, pieces, or categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border-b-2 border-neutral-200 py-3 pl-2 pr-12 text-xl font-light tracking-wide text-neutral-900 bg-transparent placeholder-neutral-300 focus:border-neutral-900 focus:outline-none transition-colors"
                autoFocus={searchOpen}
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 transition-colors">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </button>
            </form>

            {/* Live Search Results (Scrollable Container) */}
            <div className={`transition-all duration-500 mx-auto max-w-6xl ${search.trim() ? 'opacity-100' : 'opacity-0 hidden'}`}>
              
              <div className="flex justify-between items-end mb-4 px-2">
                <h3 className="text-[9px] font-bold tracking-[0.2em] uppercase text-neutral-400">Suggested Results</h3>
                {searchResults.length > 0 && (
                  <Link to={`/products?search=${search}`} onClick={() => setSearchOpen(false)} className="text-[8px] font-bold tracking-[0.1em] uppercase text-neutral-900 border-b border-neutral-900 pb-0.5 hover:text-neutral-500 transition-colors">
                    View All
                  </Link>
                )}
              </div>

              {/* 🟢 SCROLLABLE GRID AREA (Prevents screen blowout) */}
              <div className="max-h-[55vh] overflow-y-auto no-scrollbar px-2 pb-8">
                {isSearching ? (
                  <div className="flex justify-center py-10">
                    <div className="h-5 w-5 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 lg:gap-5">
                    {searchResults.map((product) => (
                      <Link key={product._id} to={`/products/${product._id}`} onClick={() => setSearchOpen(false)} className="group block">
                        <div className="aspect-[3/4] bg-neutral-100 mb-2.5 overflow-hidden relative border border-neutral-100">
                          <img 
                            src={product.mainimage1 || product.image2} 
                            alt={product.title} 
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-[0.25,1,0.5,1]" 
                          />
                        </div>
                        <h4 className="text-[10px] font-medium text-neutral-900 truncate group-hover:text-neutral-500 transition-colors">{product.title}</h4>
                        <p className="text-[8px] font-bold tracking-widest text-neutral-400 mt-1 uppercase">₹{product.price.toLocaleString()}</p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-xs font-light text-neutral-500">No pieces found matching "{search}"</p>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </nav>

      {/* 🟢 MOBILE SLIDE-IN DRAWER */}
      <div className={`fixed inset-0 z-[60] transition-opacity duration-500 md:hidden ${menuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
        
        <div className="absolute inset-0 bg-neutral-950/40 backdrop-blur-sm transition-opacity" onClick={() => setMenuOpen(false)}></div>
        
        <div className={`absolute top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl transform transition-transform duration-500 ease-[0.25,1,0.5,1] flex flex-col ${menuOpen ? "translate-x-0" : "translate-x-full"}`}>
          
          <div className="flex items-center justify-between px-8 py-7 border-b border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center bg-neutral-950 text-white">
                <span className="font-serif text-sm font-bold">TT</span>
              </div>
              <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-900">Menu</span>
            </div>
            <button onClick={() => setMenuOpen(false)} className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="px-8 py-8 overflow-y-auto flex-grow no-scrollbar">
            
            {/* 🟢 MOBILE AJAX SEARCH INPUT */}
            <form onSubmit={handleSearchSubmit} className="relative mb-10">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-none border-b border-neutral-300 py-3 pl-9 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:outline-none transition-colors tracking-wide bg-transparent"
              />
              <svg className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </form>

            {/* 🟢 MOBILE LIVE SEARCH RESULTS */}
            {search.trim() ? (
              <div className="mb-10 animate-fade-in">
                <h3 className="text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 mb-5 border-b border-neutral-100 pb-2">Suggested Results</h3>
                
                {isSearching ? (
                   <p className="text-xs text-neutral-400 font-light italic">Searching...</p>
                ) : searchResults.length > 0 ? (
                  <div className="flex flex-col gap-5">
                    {searchResults.map(product => (
                      <Link key={product._id} to={`/products/${product._id}`} onClick={() => setMenuOpen(false)} className="flex items-center gap-4 group">
                        <div className="w-12 h-16 bg-neutral-100 overflow-hidden shrink-0 border border-neutral-100">
                          <img src={product.mainimage1 || product.image2} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <div className="flex flex-col justify-center">
                          <h4 className="text-[11px] font-medium text-neutral-900 line-clamp-1 leading-snug mb-1">{product.title}</h4>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">₹{product.price.toLocaleString()}</p>
                        </div>
                      </Link>
                    ))}
                    <Link to={`/products?search=${search}`} onClick={() => setMenuOpen(false)} className="text-[9px] font-bold tracking-[0.1em] uppercase text-neutral-900 border border-neutral-900 text-center py-3 mt-4 hover:bg-neutral-950 hover:text-white transition-colors">
                      View All Results
                    </Link>
                  </div>
                ) : (
                  <p className="text-xs text-neutral-500 font-light">No pieces found.</p>
                )}
              </div>
            ) : (
              /* Mobile Navigation Links (Hidden when searching) */
              <div className="flex flex-col gap-8 text-xl font-light tracking-wide text-neutral-800">
                <Link to="/products" className="hover:text-neutral-400 transition-colors">Shop All</Link>
                <Link to="/collections" className="hover:text-neutral-400 transition-colors">Collections</Link>
                <Link to="/wishlist" className="hover:text-neutral-400 transition-colors">Wishlist</Link>
                
                {user && (
                  <div className="mt-4 flex flex-col gap-6">
                    <div className="h-px bg-neutral-100 w-12"></div>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-[0.25em]">My Profile</p>
                    <Link to="/dashboard" className="text-lg hover:text-neutral-400 transition-colors">Profile</Link>
                    <Link to="/orders" className="text-lg hover:text-neutral-400 transition-colors">My Orders</Link>
                    {user?.role === "admin" && (
                      <Link to="/admin" className="text-lg text-indigo-600 hover:text-indigo-800 transition-colors">Admin Panel</Link>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Footer / Auth Buttons */}
          <div className="p-8 bg-neutral-50/80 border-t border-neutral-100">
            {user ? (
              <button onClick={logout} className="w-full bg-neutral-950 text-white py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all active:scale-[0.98]">
                Sign Out
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                <Link to="/login" className="w-full border border-neutral-300 bg-white py-3.5 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-900 hover:bg-neutral-50 transition-all active:scale-[0.98]">
                  Log In
                </Link>
                <Link to="/register" className="w-full bg-neutral-950 text-white py-3.5 text-center text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-neutral-800 transition-all active:scale-[0.98]">
                  Create Account
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
      
      {/* Hide Scrollbar helper for Mobile Drawer */}
      <style dangerouslySetInnerHTML={{__html: `.no-scrollbar::-webkit-scrollbar { display: none; }`}} />
    </>
  );
}