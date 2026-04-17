import { Link, useNavigate } from "react-router-dom";
import { useWishlist } from "../context/useWishlist";
import { useState, useEffect, useRef } from "react";
import { Heart, X, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";

export default function Wishlist() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();

  // Always scroll to top
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  // 🟢 PREMIUM TOAST STATE
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const timerRef = useRef(null);

  // 🟢 CINEMATIC REDIRECTION STATE
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectTarget, setRedirectTarget] = useState(null);

  const showToast = (message, type = "success") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ show: true, message, type });
    timerRef.current = setTimeout(() => setToast({ ...toast, show: false }), 4000);
  };

  const removeItem = (id) => {
    removeFromWishlist(id);
    showToast("Item removed from wishlist", "success");
  };

  // 🟢 CINEMATIC ROUTING HANDLER
  const handleRedirect = (e, path, id = "global") => {
    e.preventDefault();
    setRedirectTarget(id);
    setIsRedirecting(true);
    
    // Wait for the animation to play out before actually navigating
    setTimeout(() => {
      navigate(path);
    }, 800);
  };

  return (
    <div className={`bg-white min-h-[100dvh] font-sans relative selection:bg-neutral-200 overflow-hidden transition-opacity duration-700 ease-[0.25,1,0.5,1] ${isRedirecting ? 'opacity-50' : 'opacity-100'}`}>

      {/* =========================================
          🌟 PREMIUM CENTERED NOTIFICATION POPUP
          ========================================= */}
      <div 
        className={`fixed top-24 left-1/2 z-[100] flex w-[90%] sm:w-auto min-w-[320px] max-w-md -translate-x-1/2 transform items-center gap-3.5 rounded-2xl p-4 sm:p-5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] backdrop-blur-2xl transition-all duration-500 ease-[0.25,1,0.5,1] border ${
          toast.show ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0 pointer-events-none"
        } ${
          toast.type === "error" ? "bg-white/90 border-red-100 text-neutral-900" : "bg-neutral-950/95 border-neutral-800 text-white"
        }`}
      >
        <div className="shrink-0">
          {toast.type === "error" ? (
            <AlertTriangle className="h-5 w-5 text-red-500 stroke-[2]" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-emerald-400 stroke-[2]" />
          )}
        </div>
        <div className="flex-1">
          <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] ${toast.type === "error" ? "text-red-500" : "text-neutral-400"} mb-0.5`}>
            {toast.type === "error" ? "Alert" : "Updated"}
          </p>
          <p className={`text-xs sm:text-sm font-medium tracking-wide ${toast.type === "error" ? "text-neutral-900" : "text-neutral-200"}`}>
            {toast.message}
          </p>
        </div>
        <button onClick={() => {
            setToast({ ...toast, show: false });
            if (timerRef.current) clearTimeout(timerRef.current);
          }} 
          className="shrink-0 p-2 -mr-2 hover:scale-110 transition-transform active:scale-95"
        >
          <X className={`h-4 w-4 stroke-[2] ${toast.type === "error" ? "text-neutral-400" : "text-neutral-400"}`} />
        </button>
      </div>

      <div className="max-w-[100rem] mx-auto px-5 sm:px-8 lg:px-12 py-24 sm:py-32 lg:py-40">

        {/* EDITORIAL HEADER */}
        <div className="flex flex-col items-center mb-16 sm:mb-20 border-b border-neutral-200 pb-8 sm:pb-12 opacity-0 animate-[fade-in-up_0.8s_ease-out_forwards]">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-wide uppercase text-neutral-900 text-center">
            My Wishlist
          </h1>
          <p className="mt-4 sm:mt-6 text-[9px] sm:text-[10px] font-bold tracking-[0.3em] text-neutral-400 uppercase">
            {wishlistItems.length} {wishlistItems.length === 1 ? "Saved Item" : "Saved Items"}
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          /* =========================================
             LUXURY EMPTY STATE
             ========================================= */
          <div className="text-center py-16 flex flex-col items-center min-h-[40vh] justify-center opacity-0 animate-[fade-in-up_0.8s_ease-out_0.2s_forwards]">
            
            <Heart className="w-12 h-12 sm:w-16 sm:h-16 stroke-[1] text-neutral-200 mb-6 sm:mb-8" />

            <h2 className="text-xl sm:text-2xl font-light tracking-widest text-neutral-900 mb-3 sm:mb-4 uppercase">
              No saved items
            </h2>
            <p className="text-xs sm:text-sm font-light tracking-wide text-neutral-500 mb-10 max-w-md mx-auto leading-relaxed px-4">
              Keep track of your favorite pieces by saving them to your wishlist.
            </p>

            {/* 🟢 EMPTY STATE REDIRECT BUTTON */}
            <button
              onClick={(e) => handleRedirect(e, "/products", "discover")}
              disabled={isRedirecting}
              className="group/btn relative overflow-hidden border border-neutral-950 bg-white text-neutral-950 px-10 sm:px-12 py-3.5 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] transition-all duration-500 hover:text-white disabled:opacity-80 active:scale-[0.98]"
            >
              <span className="relative z-10 flex items-center justify-center gap-3 transition-colors duration-500 group-hover/btn:text-white">
                {isRedirecting && redirectTarget === "discover" ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading Edit...
                  </>
                ) : (
                  "Discover Products"
                )}
              </span>
              {!isRedirecting && (
                <div className="absolute inset-0 h-full w-full scale-x-0 bg-neutral-950 transition-transform duration-500 ease-[0.25,1,0.5,1] group-hover/btn:scale-x-100 origin-left"></div>
              )}
            </button>

          </div>
        ) : (
          /* =========================================
             WISHLIST GRID (Fluid & Staggered)
             ========================================= */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-12 sm:gap-x-6 sm:gap-y-16 lg:gap-x-8 lg:gap-y-20">
            {wishlistItems.map((product, index) => (
              <div 
                key={product._id} 
                className="group relative flex flex-col opacity-0 animate-[fade-in-up_0.8s_ease-out_forwards]"
                style={{ animationDelay: `${0.2 + (index * 0.1)}s` }} // Cascading load
              >

                {/* IMAGE AREA */}
                <div className="relative w-full aspect-[3/4] bg-neutral-100 overflow-hidden mb-4 sm:mb-5 border border-neutral-100">
                  <Link
                    to={`/products/${product._id}`}
                    onClick={(e) => handleRedirect(e, `/products/${product._id}`, product._id)}
                    className="block w-full h-full"
                  >
                    <img
                      src={product.mainimage1 || product.image}
                      alt={product.title}
                      className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-[1.5s] ease-[0.25,1,0.5,1] group-hover:scale-105 ${product.image2 ? "group-hover:opacity-0" : ""}`}
                    />
                    {/* Secondary Image Crossfade on Hover */}
                    {product.image2 && (
                      <img
                        src={product.image2}
                        alt={`${product.title} alternate view`}
                        className="absolute inset-0 w-full h-full object-cover object-center opacity-0 transition-all duration-[1.5s] ease-[0.25,1,0.5,1] group-hover:opacity-100 group-hover:scale-105"
                      />
                    )}
                  </Link>

                  {/* 🟢 REMOVE BUTTON (Fixed Mobile UX: Always visible on mobile, fade on desktop) */}
                  <button
                    onClick={(e) => { e.preventDefault(); removeItem(product._id); }}
                    className="absolute top-3 sm:top-4 right-3 sm:right-4 p-2 sm:p-2.5 bg-white/90 backdrop-blur-md rounded-full opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-500 hover:bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] hover:scale-110 active:scale-95 z-20"
                    aria-label="Remove from wishlist"
                  >
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-900 stroke-[2]" />
                  </button>
                </div>

                {/* DETAILS AREA */}
                <div className="flex flex-col gap-1 sm:gap-1.5 flex-1 px-1">
                  
                  <p className="text-[8px] sm:text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">
                    {product.category || "Thread Theory"}
                  </p>

                  <Link 
                    to={`/products/${product._id}`}
                    onClick={(e) => handleRedirect(e, `/products/${product._id}`, product._id)}
                  >
                    <h3 className="text-xs sm:text-sm font-light tracking-wide text-neutral-900 leading-snug hover:text-neutral-500 transition-colors line-clamp-2">
                      {product.title}
                    </h3>
                  </Link>

                  <div className="flex justify-between items-end mt-0.5 sm:mt-1">
                    <p className="text-xs sm:text-sm font-medium tracking-wide text-neutral-900">
                      ₹{product.price?.toLocaleString()}
                    </p>
                  </div>

                </div>

                {/* 🟢 INDIVIDUAL PRODUCT REDIRECT BUTTON */}
                <button
                  onClick={(e) => handleRedirect(e, `/products/${product._id}`, product._id)}
                  disabled={isRedirecting}
                  className="mt-5 sm:mt-6 w-full group/btn relative overflow-hidden border border-neutral-900 bg-transparent text-neutral-900 py-3 sm:py-3.5 text-center text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] transition-all duration-500 hover:text-white disabled:opacity-80 active:scale-[0.98]"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2 transition-colors duration-500 group-hover/btn:text-white">
                    {isRedirecting && redirectTarget === product._id ? (
                       <>
                       <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                       </svg>
                       Loading...
                     </>
                    ) : (
                      "View Options"
                    )}
                  </span>
                  {!isRedirecting && (
                    <div className="absolute inset-0 h-full w-full scale-y-0 bg-neutral-950 transition-transform duration-500 ease-[0.25,1,0.5,1] group-hover/btn:scale-y-100 origin-bottom"></div>
                  )}
                </button>

              </div>
            ))}
          </div>
        )}

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}