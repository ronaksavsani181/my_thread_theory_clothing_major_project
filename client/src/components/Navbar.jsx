import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useCart } from "../context/useCart";
import { useState, useEffect, useRef } from "react";
import { 
  Search, ShoppingBag, Menu, X, User, LogOut, 
  Home, LayoutGrid, Heart, PackageOpen, 
  Instagram, Twitter, Facebook, ChevronRight, Loader2,
  Phone, Mail, MapPin, Tag
} from "lucide-react";
import api from "../services/api";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // AJAX REAL-TIME SEARCH STATE
  const [allProducts, setAllProducts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // ======================================================================
  // 🚨 CRITICAL ADMIN UI OVERRIDE 🚨
  // Double-security: If the route is an admin route, completely abort 
  // rendering the consumer navbar and bottom bar.
  // ======================================================================
  if (location.pathname.startsWith("/admin")) {
    return null; 
  }

  const cartItemCount = cartItems.reduce((total, item) => total + item.qty, 0);

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  // Close menus on route change
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setSearch(""); 
  }, [location.pathname]);

  // Handle scroll for glassmorphism top bar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when ANY overlay is open
  useEffect(() => {
    if (menuOpen || searchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [menuOpen, searchOpen]);

  // Auto-focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current.focus(), 100);
    }
  }, [searchOpen]);

  // FETCH ALL PRODUCTS FOR FAST CLIENT-SIDE SEARCHING
  useEffect(() => {
    if (searchOpen) {
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
  }, [searchOpen, allProducts.length]);

  // REAL-TIME AJAX DEBOUNCED SEARCH LOGIC
  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    const timer = setTimeout(() => {
      const keyword = search.toLowerCase();
      const results = allProducts.filter(
        (p) => p.title.toLowerCase().includes(keyword) || p.category.toLowerCase().includes(keyword)
      ).slice(0, 12); // Fetches top 12 items for a rich visual grid
      
      setSearchResults(results);
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, allProducts]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    navigate(`/products?search=${search}`);
    setSearch("");
    setSearchOpen(false);
  };

  const navBg = scrolled
    ? "bg-white/95 backdrop-blur-xl shadow-sm text-neutral-900 border-b border-neutral-200/50"
    : "bg-neutral-950 text-white border-b border-transparent";

  const desktopLinkClass = `relative text-[11px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 py-1
    ${scrolled ? "text-neutral-500 hover:text-neutral-900" : "text-neutral-400 hover:text-white"}
    after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1px] 
    after:transition-all after:duration-300 hover:after:w-full
    ${scrolled ? "after:bg-neutral-900" : "after:bg-white"}
  `;

  // Reusable Sidebar Link Component
  const SidebarLink = ({ to, icon: Icon, label, delay }) => (
    <Link 
      to={to} 
      onClick={() => setMenuOpen(false)}
      className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 transform opacity-0 animate-[fade-in-up_0.4s_ease-out_forwards]
      ${isActive(to) ? "bg-neutral-100 text-neutral-900 font-medium" : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 font-light"}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-center gap-4">
        <Icon className={`w-5 h-5 ${isActive(to) ? "stroke-[2]" : "stroke-[1.5]"}`} />
        <span className="text-[15px] tracking-wide">{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 opacity-40" />
    </Link>
  );

  return (
    <>
      {/* =========================================
          1. TOP NAVBAR (DESKTOP & MOBILE)
          ========================================= */}
      <nav className={`fixed top-0 w-full z-[45] transition-all duration-500 ${navBg} font-sans`}>
        <div className="max-w-[100rem] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex h-[70px] sm:h-[84px] items-center justify-between">
            
            {/* MOBILE HAMBURGER (Left) */}
            <div className="flex items-center md:hidden w-1/3">
              <button onClick={() => setMenuOpen(true)} className="p-2 -ml-2 focus:outline-none transition-transform active:scale-95">
                <Menu className="w-[26px] h-[26px] stroke-[1.5]" />
              </button>
            </div>
            
            {/* BRAND LOGO (Center Mobile, Left Desktop) */}
            <div className="w-1/3 md:w-auto flex justify-center md:justify-start">
              <Link to="/" className="flex items-center gap-3 sm:gap-4 group">
                <div className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center transition-colors duration-500 rounded-sm ${
                  scrolled ? "bg-neutral-950 text-white" : "bg-white text-neutral-950"
                }`}>
                  <span className="font-serif text-base sm:text-lg font-bold tracking-tighter">TT</span>
                </div>
                <span className="text-sm sm:text-lg font-bold tracking-[0.25em] uppercase hidden lg:block">
                  Thread <span className="font-light opacity-60">Theory</span>
                </span>
              </Link>
            </div>

            {/* DESKTOP CENTER LINKS */}
            <div className="hidden md:flex flex-grow items-center justify-center gap-10 absolute left-1/2 -translate-x-1/2 mt-1">
              <Link to="/products" className={desktopLinkClass}>Shop All</Link>
              <Link to="/collections" className={desktopLinkClass}>Collections</Link>
              <Link to="/wishlist" className={desktopLinkClass}>Wishlist</Link>
            </div>

            {/* RIGHT ACTIONS */}
            <div className="flex items-center justify-end gap-3 sm:gap-6 w-1/3">
              
              {/* SEARCH TRIGGER (ALL DEVICES) */}
              <button 
                onClick={() => setSearchOpen(true)} 
                className="p-2 focus:outline-none hover:scale-110 transition-transform md:mr-0 -mr-2"
              >
                <Search className="w-[22px] h-[22px] sm:w-[20px] sm:h-[20px] stroke-[1.5]" />
              </button>

              {/* DESKTOP ONLY PROFILE & CART */}
              <div className="hidden md:flex items-center gap-6">
                {user ? (
                  <div className="relative group p-1 cursor-pointer">
                    <User className="w-[20px] h-[20px] stroke-[1.25] hover:scale-110 transition-transform" />
                    <div className="absolute right-0 top-full mt-4 w-64 bg-white border border-neutral-100 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right translate-y-3 group-hover:translate-y-0 rounded-xl overflow-hidden">
                      <div className="flex flex-col text-sm text-neutral-600">
                        <div className="px-6 py-5 bg-neutral-950 text-white">
                          <p className="text-[9px] text-neutral-400 uppercase tracking-[0.25em] mb-1 font-bold">Signed in as</p>
                          <p className="truncate font-medium tracking-wide text-base">{user.name || "User"}</p>
                        </div>
                        <div className="p-3">
                          <Link to="/dashboard" className="block px-4 py-2.5 hover:bg-neutral-50 hover:text-neutral-900 transition-colors rounded-lg tracking-wide text-sm font-light">My Profile</Link>
                          <Link to="/orders" className="block px-4 py-2.5 hover:bg-neutral-50 hover:text-neutral-900 transition-colors rounded-lg tracking-wide text-sm font-light">My Orders</Link>
                          {user?.role === "admin" && (
                            <Link to="/admin" className="block px-4 py-2.5 hover:bg-neutral-50 text-indigo-600 transition-colors rounded-lg tracking-wide text-sm font-medium">Admin Panel</Link>
                          )}
                          <div className="h-px bg-neutral-100 my-2 mx-2"></div>
                          <button onClick={logout} className="w-full text-left px-4 py-2.5 text-red-500 hover:bg-red-50 transition-colors rounded-lg tracking-wide text-sm font-light flex items-center gap-2">
                            <LogOut className="w-4 h-4" /> Sign out
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-6 border-r border-neutral-500/30 pr-6 mr-1">
                    <Link to="/login" className={desktopLinkClass}>Login</Link>
                  </div>
                )}

                <Link to="/cart" className="relative p-1 group hover:scale-110 transition-transform">
                  <ShoppingBag className="w-[22px] h-[22px] stroke-[1.25]" />
                  {cartItemCount > 0 && (
                    <span className={`absolute -top-1.5 -right-2.5 flex h-[18px] min-w-[18px] px-1 items-center justify-center rounded-full text-[9px] font-bold tracking-tighter transition-colors shadow-sm ${
                      scrolled ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-900 group-hover:bg-neutral-200'
                    }`}>
                      {cartItemCount}
                    </span>
                  )}
                </Link>
              </div>

            </div>
          </div>
        </div>
      </nav>

      {/* =========================================
          2. UNIFIED TOP-TO-DOWN SEARCH OVERLAY
          ========================================= */}
      <div 
        className={`fixed top-0 left-0 w-full bg-white/95 backdrop-blur-2xl z-[70] transition-all duration-700 ease-[0.25,1,0.5,1] shadow-[0_30px_60px_rgba(0,0,0,0.1)] flex flex-col
        ${searchOpen ? "translate-y-0 opacity-100 h-[100dvh] lg:h-[85vh] visible" : "-translate-y-full opacity-0 h-[100dvh] lg:h-[85vh] invisible"}`}
      >
        <div className="w-full max-w-[100rem] mx-auto px-5 sm:px-8 lg:px-12 pt-10 sm:pt-14 pb-8 flex items-center justify-between shrink-0 border-b border-neutral-200/50">
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-5xl flex items-center group">
            <Search className="absolute left-2 w-6 h-6 sm:w-8 sm:h-8 text-neutral-400 stroke-[1.5] group-focus-within:text-neutral-900 transition-colors" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search collections, pieces, categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border-none py-2 pl-12 sm:pl-16 pr-4 text-2xl sm:text-4xl lg:text-5xl font-light tracking-wide text-neutral-900 placeholder-neutral-300 focus:outline-none focus:ring-0"
            />
          </form>
          <button onClick={() => setSearchOpen(false)} className="p-2 sm:p-4 hover:bg-neutral-100 rounded-full transition-colors group">
            <X className="w-8 h-8 sm:w-10 sm:h-10 stroke-[1] text-neutral-400 group-hover:text-neutral-900 transition-colors" />
          </button>
        </div>

        <div className="w-full max-w-[100rem] mx-auto px-5 sm:px-8 lg:px-12 flex-grow overflow-y-auto no-scrollbar pb-[env(safe-area-inset-bottom)] pt-8">
          {search.trim() ? (
            <div className="animate-fade-in-up pb-12">
              <div className="flex justify-between items-end mb-8">
                <h3 className="text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase text-neutral-400">Search Results</h3>
                {searchResults.length > 0 && (
                  <Link to={`/products?search=${search}`} onClick={() => setSearchOpen(false)} className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-neutral-900 border-b border-neutral-900 pb-0.5 hover:text-neutral-500 transition-colors">
                    View All {allProducts.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())).length}
                  </Link>
                )}
              </div>

              {isSearching ? (
                <div className="flex flex-col items-center justify-center py-20 text-neutral-400 gap-4">
                  <Loader2 className="w-8 h-8 animate-spin stroke-[1.5]" />
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold">Curating Results...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-10 sm:gap-6 lg:gap-8">
                  {searchResults.map((product) => (
                    <Link key={product._id} to={`/products/${product._id}`} onClick={() => setSearchOpen(false)} className="group block">
                      <div className="aspect-[3/4] bg-neutral-100 mb-4 overflow-hidden relative border border-neutral-100">
                        <img 
                          src={product.mainimage1 || product.image2} 
                          alt={product.title} 
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-[0.25,1,0.5,1]" 
                        />
                      </div>
                      <h4 className="text-xs sm:text-sm font-medium text-neutral-900 line-clamp-2 leading-snug group-hover:text-neutral-500 transition-colors mb-1.5">{product.title}</h4>
                      <p className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">₹{product.price.toLocaleString()}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-xl sm:text-2xl font-light text-neutral-400">No pieces found matching "{search}"</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center opacity-50">
              <Search className="w-12 h-12 stroke-[1] text-neutral-300 mb-6" />
              <p className="text-xl sm:text-2xl font-light text-neutral-400 max-w-md leading-relaxed">Start typing to explore the Theory collection.</p>
            </div>
          )}
        </div>
      </div>

      {/* =========================================
          3. CONSUMER BOTTOM NAVIGATION (MOBILE)
          ========================================= */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-neutral-200 z-[40] pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-[70px] px-2">
          
          <Link to="/" className="flex flex-col items-center justify-center w-full h-full gap-1 group">
            <div className={`p-1.5 rounded-full transition-colors ${isActive('/') && location.pathname === '/' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-400 group-hover:text-neutral-900'}`}>
              <Home className={`w-[22px] h-[22px] ${isActive('/') && location.pathname === '/' ? 'stroke-[2]' : 'stroke-[1.5]'}`} />
            </div>
            <span className={`text-[9px] font-medium tracking-wide ${isActive('/') && location.pathname === '/' ? 'text-neutral-900' : 'text-neutral-400'}`}>Home</span>
          </Link>

          <Link to="/products" className="flex flex-col items-center justify-center w-full h-full gap-1 group">
            <div className={`p-1.5 rounded-full transition-colors ${isActive('/products') ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-400 group-hover:text-neutral-900'}`}>
              <LayoutGrid className={`w-[22px] h-[22px] ${isActive('/products') ? 'stroke-[2]' : 'stroke-[1.5]'}`} />
            </div>
            <span className={`text-[9px] font-medium tracking-wide ${isActive('/products') ? 'text-neutral-900' : 'text-neutral-400'}`}>Shop</span>
          </Link>

          <Link to="/cart" className="flex flex-col items-center justify-center w-full h-full gap-1 group relative">
            <div className={`p-1.5 rounded-full transition-colors ${isActive('/cart') ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-400 group-hover:text-neutral-900'}`}>
              <ShoppingBag className={`w-[22px] h-[22px] ${isActive('/cart') ? 'stroke-[2]' : 'stroke-[1.5]'}`} />
              {cartItemCount > 0 && (
                <span className="absolute top-1.5 right-1/2 translate-x-3 flex h-[16px] min-w-[16px] px-1 items-center justify-center rounded-full bg-neutral-950 text-white text-[8px] font-bold shadow-sm">
                  {cartItemCount}
                </span>
              )}
            </div>
            <span className={`text-[9px] font-medium tracking-wide ${isActive('/cart') ? 'text-neutral-900' : 'text-neutral-400'}`}>Cart</span>
          </Link>

          <Link to={user ? "/dashboard" : "/login"} className="flex flex-col items-center justify-center w-full h-full gap-1 group">
            <div className={`p-1.5 rounded-full transition-colors ${isActive('/dashboard') || isActive('/login') ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-400 group-hover:text-neutral-900'}`}>
              <User className={`w-[22px] h-[22px] ${isActive('/dashboard') || isActive('/login') ? 'stroke-[2]' : 'stroke-[1.5]'}`} />
            </div>
            <span className={`text-[9px] font-medium tracking-wide ${isActive('/dashboard') || isActive('/login') ? 'text-neutral-900' : 'text-neutral-400'}`}>Profile</span>
          </Link>

        </div>
      </div>

      {/* =========================================
          4. OVERLAP PROFILE SIDEBAR DRAWER
          ========================================= */}
      <div className={`fixed inset-0 z-[60] transition-opacity duration-500 md:hidden ${menuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
        <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-md transition-opacity" onClick={() => setMenuOpen(false)}></div>
        
        <div className={`absolute top-0 left-0 h-full w-[85%] max-w-sm bg-neutral-50 shadow-[20px_0_40px_rgba(0,0,0,0.2)] transform transition-transform duration-500 ease-[0.25,1,0.5,1] flex flex-col ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          
          <div className="bg-neutral-950 pt-12 pb-16 px-6 relative shrink-0 text-center flex flex-col items-center">
            <button onClick={() => setMenuOpen(false)} className="absolute top-6 right-6 p-2 text-neutral-400 hover:text-white transition-colors bg-white/10 rounded-full">
              <X className="w-5 h-5 stroke-[2]" />
            </button>

            {user ? (
              <div className="flex flex-col items-center transform opacity-0 animate-[fade-in-up_0.5s_ease-out_0.1s_forwards]">
                <div className="h-20 w-20 bg-white rounded-full p-1 mb-4 shadow-xl">
                  <img src={`https://ui-avatars.com/api/?name=${user.name}&background=f5f5f5&color=171717`} alt="Profile" className="w-full h-full rounded-full object-cover" />
                </div>
                <h2 className="text-white text-xl font-medium tracking-wide">{user.name}</h2>
                <p className="text-neutral-400 text-[10px] tracking-[0.1em] uppercase mt-1">{user.email}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center transform opacity-0 animate-[fade-in-up_0.5s_ease-out_0.1s_forwards]">
                <div className="h-16 w-16 bg-neutral-800 rounded-full flex items-center justify-center mb-5 shadow-xl text-white font-serif text-2xl font-bold">TT</div>
                <h2 className="text-white text-lg font-medium tracking-wide">Thread Theory</h2>
                <p className="text-neutral-400 text-xs tracking-wide mt-2 font-light">Elevate your wardrobe.</p>
              </div>
            )}
          </div>

          <div className="flex-grow bg-white -mt-6 rounded-t-[32px] relative z-10 px-4 py-8 overflow-y-auto no-scrollbar shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col justify-between pb-24">
            <div className="flex flex-col gap-2">
              <SidebarLink to="/" icon={Home} label="Home" delay={0.15} />
              <SidebarLink to="/products" icon={LayoutGrid} label="Shop All" delay={0.2} />
              <SidebarLink to="/wishlist" icon={Heart} label="Wishlist" delay={0.25} />
              
              <div className="h-px bg-neutral-100 my-4 mx-4 transform opacity-0 animate-[fade-in-up_0.4s_ease-out_0.3s_forwards]"></div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400 px-4 mb-2 transform opacity-0 animate-[fade-in-up_0.4s_ease-out_0.3s_forwards]">Categories</p>
              <SidebarLink to="/products?category=Men" icon={Tag} label="Men's Collection" delay={0.35} />
              <SidebarLink to="/products?category=Women" icon={Tag} label="Women's Collection" delay={0.4} />
              <SidebarLink to="/products?category=Accessories" icon={Tag} label="Accessories" delay={0.45} />

              {user && (
                <>
                  <div className="h-px bg-neutral-100 my-4 mx-4 transform opacity-0 animate-[fade-in-up_0.4s_ease-out_0.5s_forwards]"></div>
                  <SidebarLink to="/dashboard" icon={User} label="Profile Settings" delay={0.55} />
                  <SidebarLink to="/orders" icon={PackageOpen} label="Order History" delay={0.6} />
                </>
              )}
            </div>

            <div className="mt-10 px-4 transform opacity-0 animate-[fade-in-up_0.5s_ease-out_0.65s_forwards]">
              <div className="flex flex-col gap-4 mb-8 text-neutral-500 text-xs font-light tracking-wide">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 stroke-[1.5]" />
                  <span>Surat, Gujarat, India</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 stroke-[1.5]" />
                  <a href="tel:+919876543210">+91 98765 43210</a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 stroke-[1.5]" />
                  <a href="mailto:support@threadtheory.com">support@threadtheory.com</a>
                </div>
              </div>

              {!user ? (
                <div className="flex flex-col gap-3">
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="w-full bg-neutral-100 py-3.5 rounded-xl text-center text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-900 hover:bg-neutral-200 transition-colors">Log In</Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="w-full bg-neutral-950 py-3.5 rounded-xl text-center text-[11px] font-bold uppercase tracking-[0.2em] text-white hover:bg-neutral-800 transition-colors shadow-lg shadow-neutral-950/20">Create Account</Link>
                </div>
              ) : (
                <button onClick={() => { logout(); setMenuOpen(false); }} className="w-full bg-red-50 text-red-600 py-3.5 rounded-xl text-[13px] font-medium tracking-wide hover:bg-red-100 transition-colors flex justify-center items-center gap-2">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}