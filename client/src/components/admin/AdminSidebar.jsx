import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, ShoppingBag, Package, 
  Ticket, Users, BarChart3, AlertCircle, 
  RotateCcw, Store, X 
} from "lucide-react";
import { useState } from "react";

export default function AdminSidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectTarget, setRedirectTarget] = useState(null);

  const isActive = (path) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (e, path) => {
    e.preventDefault();
    if (location.pathname === path) {
      setSidebarOpen(false);
      return;
    }
    
    setRedirectTarget(path);
    setIsRedirecting(true);
    
    setTimeout(() => {
      navigate(path);
      setSidebarOpen(false);
      setIsRedirecting(false);
      setRedirectTarget(null);
    }, 500);
  };

  const menu = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Products", path: "/admin/products", icon: ShoppingBag },
    { name: "Orders", path: "/admin/orders", icon: Package },
    { name: "Returns", path: "/admin/returns", icon: RotateCcw },
    { name: "Coupons", path: "/admin/coupons", icon: Ticket },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Analytics", path: "/admin/analytics", icon: BarChart3 },
    { name: "Stockouts", path: "/admin/stockouts", icon: AlertCircle },
  ];

  return (
    <div
      className={`fixed inset-y-0 left-0 z-[60] w-64 sm:w-72 bg-neutral-950 text-white min-h-[100dvh] flex flex-col transform transition-transform duration-500 ease-[0.25,1,0.5,1] shadow-[20px_0_40px_rgba(0,0,0,0.3)] lg:relative lg:translate-x-0 lg:shadow-none ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* HEADER */}
      <div className="pt-8 pb-10 px-6 flex items-center justify-between shrink-0 border-b border-neutral-900">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center bg-white text-neutral-950 rounded-sm">
            <span className="font-serif text-xl font-bold">TT</span>
          </div>
          <div>
            <h2 className="text-[11px] font-bold tracking-[0.25em] uppercase text-white">
              Command
            </h2>
            <p className="text-[9px] text-neutral-500 uppercase tracking-widest mt-0.5">Thread Theory</p>
          </div>
        </div>

        {/* Mobile Close Button */}
        <button 
          onClick={() => setSidebarOpen(false)} 
          className="lg:hidden p-2 text-neutral-400 hover:text-white transition-colors bg-white/5 rounded-full active:scale-95"
        >
          <X className="w-5 h-5 stroke-[1.5]" />
        </button>
      </div>

      {/* MENU */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-8">
        <p className="text-[9px] font-bold text-neutral-600 uppercase tracking-[0.3em] mb-6 px-8">
          System Core
        </p>

        <ul className="space-y-1.5 px-4">
          {menu.map((item, i) => {
            const active = isActive(item.path);

            return (
              <li key={i} className={`transform transition-all duration-500 ${sidebarOpen ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0 lg:translate-x-0 lg:opacity-100"}`} style={{ transitionDelay: `${i * 50}ms` }}>
                <a
                  href={item.path}
                  onClick={(e) => handleNavigation(e, item.path)}
                  className={`group flex items-center justify-between px-5 py-3.5 rounded-lg text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300
                  ${
                    active
                      ? "bg-white/10 text-white"
                      : "text-neutral-400 hover:bg-white/5 hover:text-neutral-200"
                  } ${isRedirecting && redirectTarget === item.path ? "animate-pulse opacity-50" : ""}`}
                >
                  <div className="flex items-center gap-4">
                    <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${active ? "stroke-[2] text-white" : "stroke-[1.5] text-neutral-500 group-hover:text-neutral-300"}`} />
                    <span>{item.name}</span>
                  </div>
                  
                  {/* Active Indicator Line */}
                  <div className={`w-1 h-4 rounded-full transition-all duration-300 ${active ? "bg-white scale-y-100" : "bg-transparent scale-y-0 group-hover:bg-white/20 group-hover:scale-y-100"}`}></div>
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      {/* FOOTER */}
      <div className="p-6 border-t border-neutral-900 shrink-0">
        <a
          href="/"
          onClick={(e) => handleNavigation(e, "/")}
          className="group flex items-center justify-center gap-3 w-full bg-white/5 hover:bg-white/10 px-4 py-4 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-300 hover:text-white transition-all active:scale-95"
        >
          <Store className="w-4 h-4 stroke-[1.5] group-hover:scale-110 transition-transform" />
          <span>Return to Store</span>
        </a>
      </div>

      {/* GLOBAL CSS FOR SCROLLBAR */}
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; } 
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      ` }} />
    </div>
  );
}