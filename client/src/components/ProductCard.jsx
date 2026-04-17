import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../context/useCart";
import { useWishlist } from "../context/useWishlist";
import { Heart } from "lucide-react";

export default function ProductCard({ product, badgeOverride, hideBadge }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => { setToast({ show: false, message: "", type: "success" }); }, 2500);
  };

  const wishlisted = isInWishlist(product._id);

  /* ---------------- WISHLIST ---------------- */
  const toggleWishlist = (e) => {
    e.preventDefault(); // Prevents navigating to the product page when clicking the heart
    if (wishlisted) {
      removeFromWishlist(product._id);
      showToast("Removed from wishlist");
    } else {
      addToWishlist(product);
      showToast("Saved to wishlist");
    }
  };

  /* ---------------- CART ---------------- */
  const handleCartAction = (e) => {
    e.preventDefault(); // Prevents navigating to the product page
    if (product.sizesAvailable && product.sizesAvailable.length > 0) {
      navigate(`/products/${product._id}`);
    } else {
      addToCart(product, "");
      showToast("Added to your bag");
    }
  };

  /* ---------------- PREMIUM MONOCHROME BADGE LOGIC ---------------- */
  let badgeText = badgeOverride; 
  let badgeClasses = "";

  if (hideBadge) {
    badgeText = null;
  } else if (!badgeText) {
    if (product.isBestSeller) badgeText = "Best Seller";
    else if (product.averageRating >= 4) badgeText = "Top Rated";
    else if (product.isNewArrival) badgeText = "New";
  }

  // Luxury, high-fashion styling (Strictly Monochrome)
  if (badgeText === "Best Seller") {
    badgeClasses = "bg-white text-neutral-900 border border-neutral-200 shadow-[0_2px_10px_rgba(0,0,0,0.05)]";
  } else if (badgeText === "Top Rated") {
    badgeClasses = "bg-neutral-950 text-white border border-neutral-950 shadow-sm";
  } else if (badgeText === "New") {
    badgeClasses = "bg-neutral-100 text-neutral-900 border border-neutral-200 shadow-sm";
  } else if (badgeText) {
    badgeClasses = "bg-white text-neutral-900 border border-neutral-200 shadow-sm";
  }

  return (
    <div className="group flex flex-col cursor-pointer w-full relative font-sans">

      {/* LUXURY TOAST NOTIFICATION */}
      <div
        className={`absolute -top-12 left-1/2 -translate-x-1/2 z-50 px-4 sm:px-5 py-2 sm:py-2.5 rounded-sm shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] backdrop-blur-md transition-all duration-500 ease-[0.25,1,0.5,1] pointer-events-none whitespace-nowrap ${
          toast.show ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        } ${toast.type === "error" ? "bg-red-50 text-red-800 border border-red-100" : "bg-neutral-950/95 text-white"}`}
      >
        <p className="text-[8px] sm:text-[9px] font-bold tracking-[0.25em] uppercase">{toast.message}</p>
      </div>

      {/* IMAGE AREA */}
      <div className="relative w-full aspect-[3/4] bg-neutral-100 overflow-hidden border border-neutral-100">
        
        {/* PREMIUM CONTEXTUAL BADGE */}
        {badgeText && (
          <span className={`absolute top-3 sm:top-4 left-3 sm:left-4 text-[7px] sm:text-[8px] font-bold uppercase tracking-[0.25em] px-2.5 sm:px-3 py-1.5 z-20 ${badgeClasses}`}>
            {badgeText}
          </span>
        )}

        <Link to={`/products/${product._id}`} className="block w-full h-full relative">
          <img
            src={product.mainimage1 || product.image}
            alt={product.title}
            className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-[1.5s] ease-[0.25,1,0.5,1] group-hover:scale-105 ${product.image2 ? "group-hover:opacity-0" : ""}`}
          />
          {product.image2 && (
            <img
              src={product.image2}
              alt={`${product.title} lifestyle view`}
              className="absolute inset-0 w-full h-full object-cover object-center opacity-0 transition-all duration-[1.5s] ease-[0.25,1,0.5,1] group-hover:opacity-100 group-hover:scale-105"
            />
          )}
        </Link>

        {/* WISHLIST BUTTON - Visible on mobile by default, hover-only on desktop */}
        <button
          onClick={toggleWishlist}
          className="absolute top-3 sm:top-4 right-3 sm:right-4 p-2 sm:p-2.5 bg-white/90 backdrop-blur-md rounded-full opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-500 hover:bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] hover:scale-110 active:scale-95 z-20"
        >
          <Heart 
            className={`w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] transition-colors duration-300 ${wishlisted ? "text-red-500 fill-current stroke-red-500" : "text-neutral-900 stroke-[1.5]"}`} 
          />
        </button>

        {/* ADD TO CART HOVER ACTION (Slides up from bottom) */}
        {!product.isOutOfStock && (
          <div className="absolute bottom-0 left-0 w-full translate-y-[101%] group-hover:translate-y-0 transition-transform duration-500 ease-[0.25,1,0.5,1] z-20">
            <button
              onClick={handleCartAction}
              className="block w-full bg-neutral-950/95 backdrop-blur-md text-white py-3.5 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-neutral-800 transition-colors"
            >
              {product.sizesAvailable?.length > 0 ? "Select Size" : "Add To Bag"}
            </button>
          </div>
        )}

        {/* OUT OF STOCK OVERLAY */}
        {product.isOutOfStock && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center z-10">
             <span className="bg-neutral-950 text-white px-5 py-2.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em]">Sold Out</span>
          </div>
        )}
      </div>

      {/* TEXT DETAILS */}
      <div className="pt-4 sm:pt-5 flex flex-col gap-1 sm:gap-1.5 px-1">
        <p className="text-[8px] sm:text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">
          {product.category || "Thread Theory"}
        </p>
        <div className="flex justify-between items-start mt-0.5 sm:mt-1 gap-3 sm:gap-4">
          <Link to={`/products/${product._id}`} className="group/title">
            <h3 className="text-xs sm:text-sm font-light tracking-wide text-neutral-900 leading-snug group-hover/title:text-neutral-500 transition-colors line-clamp-2 pr-2">
              {product.title}
            </h3>
          </Link>
          <p className="text-xs sm:text-sm font-medium tracking-wide text-neutral-900 whitespace-nowrap">
            ₹{product.price?.toLocaleString()}
          </p>
        </div>
      </div>
      
    </div>
  );
}