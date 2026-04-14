import { Link } from "react-router-dom";
import { useWishlist } from "../context/useWishlist";
import { useState } from "react";

export default function Wishlist() {
  const { wishlistItems, removeFromWishlist } = useWishlist();

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success"
  });

  const showToast = (message, type = "success") => {
    setToast({
      show: true,
      message,
      type
    });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 2500);
  };

  const removeItem = (id) => {
    removeFromWishlist(id);
    showToast("Item removed from wishlist");
  };

  return (
    <div className="bg-white min-h-[80vh] font-sans relative selection:bg-neutral-200">

      {/* LUXURY TOAST NOTIFICATION (Matching Global Style) */}
      <div 
        className={`fixed left-1/2 top-24 z-[100] flex w-[90%] max-w-sm -translate-x-1/2 transform items-center justify-center gap-3 rounded-sm p-4 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] backdrop-blur-xl transition-all duration-500 ease-[0.25,1,0.5,1] pointer-events-none ${
          toast.show ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"
        } ${
          toast.type === "error" ? "bg-white/95 border-l-4 border-red-500 text-neutral-800" : "bg-neutral-950/95 text-white"
        }`}
      >
        <p className={`text-[10px] font-bold tracking-[0.25em] uppercase text-center ${toast.type === "error" ? "text-neutral-700" : "text-neutral-200"}`}>
          {toast.message}
        </p>
      </div>

      <div className="max-w-[85rem] mx-auto px-6 sm:px-8 lg:px-12 py-20 sm:py-32">

        {/* HEADER */}
        <div className="flex flex-col items-center mb-20 border-b border-neutral-200 pb-10">
          <h1 className="text-4xl md:text-5xl font-light tracking-wide uppercase text-neutral-900">
            My Wishlist
          </h1>
          <p className="mt-6 text-[10px] font-bold tracking-[0.3em] text-neutral-400 uppercase">
            {wishlistItems.length}{" "}
            {wishlistItems.length === 1 ? "Saved Item" : "Saved Items"}
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          /* EMPTY STATE */
          <div className="text-center py-16 flex flex-col items-center min-h-[40vh] justify-center">
            
            <svg
              className="w-12 h-12 text-neutral-200 mb-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>

            <h2 className="text-2xl font-light tracking-wide text-neutral-900 mb-4 uppercase">
              No saved items
            </h2>
            <p className="text-sm font-light tracking-wide text-neutral-500 mb-10 max-w-md mx-auto leading-relaxed">
              Keep track of your favorite pieces by saving them to your wishlist.
            </p>

            <Link
              to="/products"
              className="group relative overflow-hidden border border-neutral-950 bg-white text-neutral-950 px-12 py-4 text-[10px] font-bold uppercase tracking-[0.25em] transition-all duration-500 hover:text-white"
            >
              <span className="relative z-10">Discover Products</span>
              <div className="absolute inset-0 h-full w-full scale-x-0 bg-neutral-950 transition-transform duration-500 ease-[0.25,1,0.5,1] group-hover:scale-x-100 origin-left"></div>
            </Link>

          </div>
        ) : (
          /* WISHLIST GRID */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-16">
            {wishlistItems.map((product) => (
              <div key={product._id} className="group relative flex flex-col">

                {/* IMAGE AREA */}
                <div className="relative w-full aspect-[3/4] bg-neutral-100 overflow-hidden mb-5">
                  <Link
                    to={`/products/${product._id}`}
                    className="block w-full h-full"
                  >
                    <img
                      src={product.mainimage1 || product.image}
                      alt={product.title}
                      className="w-full h-full object-cover object-center transition-transform duration-[1.5s] ease-[0.25,1,0.5,1] group-hover:scale-110"
                    />
                  </Link>

                  {/* REMOVE BUTTON (X) */}
                  <button
                    onClick={() => removeItem(product._id)}
                    className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 hover:bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] hover:scale-110 z-10"
                    aria-label="Remove from wishlist"
                  >
                    <svg
                      className="w-4 h-4 text-neutral-900"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* DETAILS AREA */}
                <div className="flex flex-col gap-1.5 flex-1 px-1">
                  
                  <p className="text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">
                    {product.category || "Thread Theory"}
                  </p>

                  <Link to={`/products/${product._id}`}>
                    <h3 className="text-sm font-light tracking-wide text-neutral-900 leading-snug hover:text-neutral-500 transition-colors line-clamp-2">
                      {product.title}
                    </h3>
                  </Link>

                  <div className="flex justify-between items-end mt-1">
                    <p className="text-sm font-medium tracking-wide text-neutral-900">
                      ₹{product.price?.toLocaleString()}
                    </p>
                  </div>

                </div>

                {/* VIEW OPTIONS BUTTON */}
                <Link
                  to={`/products/${product._id}`}
                  className="mt-6 w-full group/btn relative overflow-hidden border border-neutral-900 bg-transparent text-neutral-900 py-3.5 text-center text-[10px] font-bold uppercase tracking-[0.25em] transition-all duration-500 hover:text-white"
                >
                  <span className="relative z-10">View Options</span>
                  <div className="absolute inset-0 h-full w-full scale-y-0 bg-neutral-950 transition-transform duration-500 ease-[0.25,1,0.5,1] group-hover/btn:scale-y-100 origin-bottom"></div>
                </Link>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}