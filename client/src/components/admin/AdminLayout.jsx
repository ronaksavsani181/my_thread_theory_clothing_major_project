import { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, LayoutDashboard, Package, ShoppingBag, Users, BarChart3, LogOut } from "lucide-react";
import { useAuth } from "../../context/useAuth";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectTarget, setRedirectTarget] = useState(null);
  const { user, logout } = useAuth();

  // Trigger initial fade-in for the whole layout
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Prevent background scrolling when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [sidebarOpen]);

  const isActive = (path) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  const handleMobileNav = (e, path, id) => {
    e.preventDefault();
    if (location.pathname === path) return;
    
    setRedirectTarget(id);
    setIsRedirecting(true);
    setTimeout(() => {
      navigate(path);
      setIsRedirecting(false);
      setRedirectTarget(null);
    }, 500);
  };

  return (
    <div className={`flex min-h-[100dvh] bg-neutral-50 overflow-hidden font-sans selection:bg-neutral-200 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>

      {/* =========================================
          MOBILE OVERLAY (Backdrop Blur)
          ========================================= */}
      <div
        className={`fixed inset-0 bg-neutral-950/60 backdrop-blur-sm z-[50] lg:hidden transition-opacity duration-500 ease-[0.25,1,0.5,1] ${
          sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* =========================================
          SIDEBAR COMPONENT (Desktop & Sliding Mobile)
          ========================================= */}
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* =========================================
          MAIN CONTENT AREA
          ========================================= */}
      <div className={`flex-1 flex flex-col min-w-0 h-[100dvh] overflow-y-auto relative transition-opacity duration-500 ${isRedirecting ? 'opacity-50' : 'opacity-100'}`}>

        {/* =========================================
            🟢 ADMIN TOP NAVBAR (Desktop & Mobile)
            ========================================= */}
        <div className="flex items-center justify-between px-5 sm:px-8 py-4 bg-white/90 backdrop-blur-xl border-b border-neutral-200 sticky top-0 z-40 shadow-sm">
          
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-neutral-900 active:scale-95 transition-transform">
              <Menu className="w-6 h-6 stroke-[1.5]" />
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-900">Command Center</span>
              <span className="text-[8px] font-bold tracking-[0.2em] uppercase text-neutral-400 mt-0.5">Thread Theory Admin</span>
            </div>
          </div>

          {/* Desktop Right Actions */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden sm:flex items-center gap-3">
              <div className="w-8 h-8 bg-neutral-900 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                {user?.name?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-900">{user?.name || "Admin"}</span>
                <span className="text-[8px] tracking-widest uppercase text-emerald-600 font-bold">System Admin</span>
              </div>
            </div>
            <div className="w-px h-6 bg-neutral-200 hidden sm:block"></div>
            <button onClick={logout} className="p-2 text-neutral-400 hover:text-red-500 transition-colors" title="Log Out">
              <LogOut className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>
        </div>

        {/* 📄 CONTENT WRAPPER */}
        <main className="flex-1 w-full max-w-[120rem] mx-auto pb-24 lg:pb-12">
          {children}
        </main>

        {/* =========================================
            📱 EXCLUSIVE ADMIN MOBILE BOTTOM BAR
            ========================================= */}
        <div className="lg:hidden fixed bottom-0 left-0 w-full bg-neutral-950 text-neutral-400 border-t border-neutral-900 z-[40] pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_30px_rgba(0,0,0,0.2)]">
          <div className="flex justify-around items-center h-[70px] px-2">
            
            {/* 1. Dashboard */}
            <Link 
              to="/admin" 
              onClick={(e) => handleMobileNav(e, "/admin", "dashboard")}
              className="flex flex-col items-center justify-center w-full h-full gap-1 group"
            >
              <div className={`p-1.5 rounded-full transition-colors ${isActive('/admin') ? 'text-white' : 'group-hover:text-white'}`}>
                {isRedirecting && redirectTarget === 'dashboard' ? (
                  <svg className="animate-spin w-[22px] h-[22px] text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                  <LayoutDashboard className={`w-[22px] h-[22px] ${isActive('/admin') ? 'stroke-[2]' : 'stroke-[1.5]'}`} />
                )}
              </div>
              <span className={`text-[9px] font-medium tracking-wide ${isActive('/admin') ? 'text-white' : ''}`}>Dash</span>
            </Link>

            {/* 2. Orders */}
            <Link 
              to="/admin/orders" 
              onClick={(e) => handleMobileNav(e, "/admin/orders", "orders")}
              className="flex flex-col items-center justify-center w-full h-full gap-1 group"
            >
              <div className={`p-1.5 rounded-full transition-colors ${isActive('/admin/orders') ? 'text-white' : 'group-hover:text-white'}`}>
                {isRedirecting && redirectTarget === 'orders' ? (
                  <svg className="animate-spin w-[22px] h-[22px] text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                  <Package className={`w-[22px] h-[22px] ${isActive('/admin/orders') ? 'stroke-[2]' : 'stroke-[1.5]'}`} />
                )}
              </div>
              <span className={`text-[9px] font-medium tracking-wide ${isActive('/admin/orders') ? 'text-white' : ''}`}>Orders</span>
            </Link>

            {/* 3. Products (CENTERED) */}
            <Link 
              to="/admin/products" 
              onClick={(e) => handleMobileNav(e, "/admin/products", "products")}
              className="flex flex-col items-center justify-center w-full h-full gap-1 group"
            >
              <div className={`p-1.5 rounded-full transition-colors ${isActive('/admin/products') ? 'text-white' : 'group-hover:text-white'}`}>
                {isRedirecting && redirectTarget === 'products' ? (
                  <svg className="animate-spin w-[22px] h-[22px] text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                  <ShoppingBag className={`w-[22px] h-[22px] ${isActive('/admin/products') ? 'stroke-[2]' : 'stroke-[1.5]'}`} />
                )}
              </div>
              <span className={`text-[9px] font-medium tracking-wide ${isActive('/admin/products') ? 'text-white' : ''}`}>Products</span>
            </Link>

            {/* 4. Users */}
            <Link 
              to="/admin/users" 
              onClick={(e) => handleMobileNav(e, "/admin/users", "users")}
              className="flex flex-col items-center justify-center w-full h-full gap-1 group"
            >
              <div className={`p-1.5 rounded-full transition-colors ${isActive('/admin/users') ? 'text-white' : 'group-hover:text-white'}`}>
                {isRedirecting && redirectTarget === 'users' ? (
                  <svg className="animate-spin w-[22px] h-[22px] text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                  <Users className={`w-[22px] h-[22px] ${isActive('/admin/users') ? 'stroke-[2]' : 'stroke-[1.5]'}`} />
                )}
              </div>
              <span className={`text-[9px] font-medium tracking-wide ${isActive('/admin/users') ? 'text-white' : ''}`}>Users</span>
            </Link>

            {/* 5. Analytics */}
            <Link 
              to="/admin/analytics" 
              onClick={(e) => handleMobileNav(e, "/admin/analytics", "analytics")}
              className="flex flex-col items-center justify-center w-full h-full gap-1 group"
            >
              <div className={`p-1.5 rounded-full transition-colors ${isActive('/admin/analytics') ? 'text-white' : 'group-hover:text-white'}`}>
                {isRedirecting && redirectTarget === 'analytics' ? (
                  <svg className="animate-spin w-[22px] h-[22px] text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                  <BarChart3 className={`w-[22px] h-[22px] ${isActive('/admin/analytics') ? 'stroke-[2]' : 'stroke-[1.5]'}`} />
                )}
              </div>
              <span className={`text-[9px] font-medium tracking-wide ${isActive('/admin/analytics') ? 'text-white' : ''}`}>Analysis</span>
            </Link>

          </div>
        </div>

      </div>
    </div>
  );
}