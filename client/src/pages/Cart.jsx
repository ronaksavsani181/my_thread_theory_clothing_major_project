import React, { useState, useEffect } from "react";
import { useCart } from "../context/useCart";
import { Link } from "react-router-dom";
import { Minus, Plus, X, AlertTriangle, CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react";
import api from "../services/api";

export default function Cart() {
  // Note: We will calculate our own totalAmount here to perfectly handle the dynamic GST logic
  const { cartItems, removeFromCart, updateQty } = useCart();
  
  // Always scroll to top
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  // 🟢 PREMIUM CENTERED TOAST ALERT STATE
  const [toast, setToast] = useState({ show: false, message: "", type: "error" });
  
  // 🟢 LOADING STATE FOR AJAX CALLS
  const [loadingQtyId, setLoadingQtyId] = useState(null);

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
  };

  // Auto-hide toast
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ ...toast, show: false }), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // 🟢 DYNAMIC GST CALCULATION LOGIC (Indian Tax Slabs 2025)
  // 5% for items <= ₹2500 | 18% for items > ₹2500
  let calculatedSubtotal = 0;
  let calculatedGST = 0;

  cartItems.forEach((item) => {
    const lineItemTotal = item.price * item.qty;
    calculatedSubtotal += lineItemTotal;
    
    // Apply specific GST rate based on the individual unit price
    const gstRate = item.price <= 2500 ? 0.05 : 0.18;
    calculatedGST += (lineItemTotal * gstRate);
  });

  // Rounding GST and Grand Total for clean UI display
  const finalGST = Math.round(calculatedGST);
  const grandTotal = calculatedSubtotal + finalGST;


  // 🟢 ASYNC HELPER: Handle Qty limits & Live Stock Check
  const handleQtyChange = async (id, size, currentQty, amount) => {
    const newQty = currentQty + amount;
    
    if (newQty < 1) return;
    
    // ENFORCE MAX 10 VALIDATION
    if (newQty > 10) {
      showToast("Maximum quantity limit is 10 per piece.", "error");
      return;
    }

    // 🟢 AJAX STOCK CHECK: Seamless, non-jumping loader
    if (amount > 0) {
      setLoadingQtyId(`${id}-${size}`); // Lock this specific item's buttons
      
      try {
        const res = await api.get(`/products/${id}`);
        const availableStock = res.data.stock;

        if (newQty > availableStock) {
          showToast(`Only ${availableStock} pieces available in stock.`, "error");
          setLoadingQtyId(null);
          return; 
        }
      } catch (error) {
        console.error("Stock check failed:", error);
        showToast("Unable to verify stock. Please try again.", "error");
        setLoadingQtyId(null);
        return;
      }
      
      setLoadingQtyId(null); // Unlock buttons after check
    }

    // Update context state
    updateQty(id, size, newQty);
  };

  return (
    <div className="bg-white min-h-[100dvh] font-sans selection:bg-neutral-200 relative overflow-hidden">
      
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
            {toast.type === "error" ? "Limit Reached" : "Updated"}
          </p>
          <p className={`text-xs sm:text-sm font-medium tracking-wide ${toast.type === "error" ? "text-neutral-900" : "text-neutral-200"}`}>
            {toast.message}
          </p>
        </div>
        <button onClick={() => setToast({ ...toast, show: false })} className="shrink-0 p-2 -mr-2 hover:scale-110 transition-transform active:scale-95">
          <X className={`h-4 w-4 stroke-[2] ${toast.type === "error" ? "text-neutral-400" : "text-neutral-400"}`} />
        </button>
      </div>

      {/* =========================================
          CART CONTAINER
          ========================================= */}
      <div className="max-w-[100rem] mx-auto px-5 sm:px-8 lg:px-12 py-24 sm:py-32 lg:py-40">
        
        {/* EDITORIAL HEADER */}
        <div className="flex flex-col items-center mb-16 sm:mb-20 border-b border-neutral-200 pb-8 sm:pb-12 opacity-0 animate-[fade-in-up_0.8s_ease-out_forwards]">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-wide uppercase text-neutral-900 text-center">
            Shopping Bag
          </h1>
          <p className="mt-4 sm:mt-6 text-[9px] sm:text-[10px] font-bold tracking-[0.3em] text-neutral-400 uppercase">
            {cartItems.length} {cartItems.length === 1 ? "Item" : "Items"}
          </p>
        </div>

        {cartItems.length === 0 ? (
          /* =========================================
             LUXURY EMPTY STATE
             ========================================= */
          <div className="text-center py-16 flex flex-col items-center min-h-[40vh] justify-center opacity-0 animate-[fade-in-up_0.8s_ease-out_0.2s_forwards]">
            <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 stroke-[1] text-neutral-200 mb-6 sm:mb-8" />
            <h2 className="text-xl sm:text-2xl font-light tracking-widest text-neutral-900 mb-3 sm:mb-4 uppercase">Your bag is empty</h2>
            <p className="text-xs sm:text-sm font-light tracking-wide text-neutral-500 mb-10 max-w-md mx-auto leading-relaxed px-4">
              Discover our latest collections and find your new signature pieces.
            </p>
            <Link
              to="/products"
              className="group relative overflow-hidden border border-neutral-950 bg-white text-neutral-950 px-10 sm:px-12 py-3.5 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] transition-all duration-500 hover:text-white inline-block"
            >
              <span className="relative z-10">Continue Shopping</span>
              <div className="absolute inset-0 h-full w-full scale-x-0 bg-neutral-950 transition-transform duration-500 ease-[0.25,1,0.5,1] group-hover:scale-x-100 origin-left"></div>
            </Link>
          </div>
        ) : (
          /* =========================================
             SPLIT SCREEN CART LAYOUT
             ========================================= */
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 xl:gap-x-20 lg:items-start">
            
            {/* LEFT COLUMN: ITEM LIST */}
            <div className="lg:col-span-7 xl:col-span-8">
              <ul className="divide-y divide-neutral-100 border-b border-neutral-100">
                {cartItems.map((item, index) => {
                  const isItemLoading = loadingQtyId === `${item._id}-${item.size}`;
                  
                  return (
                  <li 
                    key={`${item._id}-${item.size}-${index}`} 
                    className="flex py-8 sm:py-12 group opacity-0 animate-[fade-in-up_0.6s_ease-out_forwards]"
                    style={{ animationDelay: `${0.15 + (index * 0.1)}s` }} // Cascading animation
                  >
                    
                    {/* 🖼️ Item Image */}
                    <div className="flex-shrink-0 w-28 h-36 sm:w-40 sm:h-56 bg-neutral-50 overflow-hidden relative border border-neutral-100">
                      <Link to={`/products/${item._id}`} className="block w-full h-full">
                        <img
                          src={item.mainimage1 || item.image} 
                          alt={item.title}
                          className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-[1.5s] ease-[0.25,1,0.5,1] group-hover:scale-105"
                        />
                      </Link>
                    </div>

                    {/* Item Details */}
                    <div className="ml-5 sm:ml-8 flex-1 flex flex-col justify-between">
                      <div className="relative">
                        <div className="flex justify-between sm:grid sm:grid-cols-2 gap-4">
                          
                          <div className="pr-6 sm:pr-8">
                            <p className="text-[8px] sm:text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 mb-1.5 sm:mb-2">
                              {item.category || "Thread Theory"}
                            </p>
                            <h3 className="text-xs sm:text-sm md:text-base font-light tracking-wide text-neutral-900 leading-snug hover:text-neutral-500 transition-colors">
                              <Link to={`/products/${item._id}`}>{item.title}</Link>
                            </h3>
                            <p className="mt-2 sm:mt-3 text-[8px] sm:text-[9px] text-neutral-500 uppercase tracking-[0.2em]">
                              Size: <span className="text-neutral-900 font-bold">{item.size}</span>
                            </p>
                            
                            {/* Mobile Max Qty Warning */}
                            {item.qty === 10 && (
                              <p className="text-[8px] font-bold tracking-widest text-red-500 uppercase mt-2 sm:hidden">Max Qty</p>
                            )}
                          </div>
                          
                          <div className="text-right">
                            <p className="text-xs sm:text-sm font-medium tracking-wide text-neutral-900">
                              ₹{item.price.toLocaleString()}
                            </p>
                            <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 mt-1">
                              GST: {item.price <= 2500 ? "5%" : "18%"}
                            </p>
                          </div>
                        </div>

                        {/* Mobile Remove Button (X Icon top right) */}
                        <div className="absolute -top-2 -right-2 sm:hidden">
                          <button 
                            onClick={() => removeFromCart(item._id, item.size)}
                            className="p-2 text-neutral-300 hover:text-neutral-900 transition-colors active:scale-95"
                          >
                            <X className="w-5 h-5 stroke-[1.5]" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-6 sm:mt-8 flex items-end justify-between">
                        
                        {/* 🌟 CUSTOM HIGH-END QUANTITY SELECTOR (No Jump Loader) */}
                        <div>
                          <div className={`flex items-center border w-max bg-white transition-all duration-300 ${isItemLoading ? 'border-neutral-200 opacity-40 pointer-events-none' : 'border-neutral-200 hover:border-neutral-900'}`}>
                            <button
                              type="button"
                              onClick={() => handleQtyChange(item._id, item.size, item.qty, -1)}
                              disabled={item.qty <= 1 || isItemLoading}
                              className="p-2 sm:px-4 sm:py-2.5 transition-colors focus:outline-none text-neutral-400 hover:text-neutral-900 disabled:opacity-30 disabled:hover:text-neutral-400"
                            >
                              <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[1.5]" />
                            </button>
                            
                            <span className="text-[10px] sm:text-[11px] font-medium text-neutral-900 w-6 sm:w-8 text-center flex justify-center">
                              {/* The number stays visible, opacity just drops handled by parent div */}
                              {item.qty}
                            </span>
                            
                            <button
                              type="button"
                              onClick={() => handleQtyChange(item._id, item.size, item.qty, 1)}
                              disabled={item.qty >= 10 || isItemLoading}
                              className="p-2 sm:px-4 sm:py-2.5 transition-colors focus:outline-none text-neutral-400 hover:text-neutral-900 disabled:opacity-30 disabled:hover:text-neutral-400"
                            >
                              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[1.5]" />
                            </button>
                          </div>
                          
                          {/* Desktop Max Qty Warning */}
                          {item.qty === 10 && (
                            <p className="hidden sm:block text-[8px] font-bold tracking-[0.2em] text-red-500 uppercase mt-2">Maximum Reached</p>
                          )}
                        </div>

                        {/* Desktop Remove Text Link */}
                        <div className="hidden sm:block">
                          <button
                            type="button"
                            onClick={() => removeFromCart(item._id, item.size)}
                            className="relative text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 transition-colors duration-300 hover:text-neutral-900 border-b border-transparent hover:border-neutral-900 pb-0.5"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                    </div>
                  </li>
                )})}
              </ul>
            </div>

            {/* RIGHT COLUMN: ORDER SUMMARY WITH GST */}
            <div className="mt-16 lg:mt-0 lg:col-span-5 xl:col-span-4 bg-neutral-50/50 border border-neutral-100 p-6 sm:p-10 sticky top-32 opacity-0 animate-[fade-in-up_0.8s_ease-out_0.5s_forwards]">
              <h2 className="text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase text-neutral-900 mb-8 border-b border-neutral-200 pb-4">
                Order Summary
              </h2>

              <dl className="space-y-6 text-xs sm:text-sm text-neutral-600 mb-8">
                
                {/* SUBTOTAL */}
                <div className="flex justify-between items-center">
                  <dt className="font-light tracking-wide">Subtotal</dt>
                  <dd className="font-medium text-neutral-900">₹{calculatedSubtotal.toLocaleString()}</dd>
                </div>
                
                {/* 🌟 DYNAMIC GST CALCULATION DISPLAY */}
                <div className="flex justify-between items-start">
                  <dt className="font-light tracking-wide flex flex-col">
                    <span>Estimated GST</span>
                    <span className="text-[8px] sm:text-[9px] text-neutral-400 mt-1 uppercase tracking-[0.15em] font-bold">
                      (5% OR 18% APPLIED PER PIECE)
                    </span>
                  </dt>
                  <dd className="font-medium text-neutral-900">
                    ₹{finalGST.toLocaleString()}
                  </dd>
                </div>
                
                {/* SHIPPING */}
                <div className="flex justify-between items-center">
                  <dt className="font-light tracking-wide">Shipping</dt>
                  <dd className="text-neutral-400 italic text-[9px] sm:text-[10px] uppercase tracking-widest">Calculated at checkout</dd>
                </div>
                
                {/* GRAND TOTAL */}
                <div className="flex justify-between items-center pt-6 border-t border-neutral-200">
                  <dt className="text-sm sm:text-base font-light text-neutral-900 tracking-wide">Estimated Total</dt>
                  <dd className="text-base sm:text-lg font-medium text-neutral-900">
                    ₹{grandTotal.toLocaleString()}
                  </dd>
                </div>

              </dl>

              <div className="mt-10">
                <Link
                  to="/checkout"
                  className="w-full flex justify-between items-center bg-neutral-950 text-white px-6 sm:px-8 py-4 sm:py-5 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-neutral-800 transition-all duration-300 active:scale-[0.98] group"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 stroke-[2] transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>

              <div className="mt-6 text-center">
                <Link to="/products" className="inline-block text-[8px] sm:text-[9px] font-bold tracking-[0.2em] uppercase text-neutral-400 hover:text-neutral-900 transition-colors border-b border-transparent hover:border-neutral-900 pb-0.5">
                  or Continue Shopping
                </Link>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Global CSS for Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}