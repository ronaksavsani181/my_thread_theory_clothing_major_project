import React, { useState, useEffect } from "react";
import { useCart } from "../context/useCart";
import { Link } from "react-router-dom";
import api from "../services/api"; // 🟢 IMPORT API FOR AJAX REQUEST

export default function Cart() {
  const { cartItems, removeFromCart, updateQty, totalAmount } = useCart();
  
  // Always scroll to top
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  // 🟢 PREMIUM TOAST ALERT STATE
  const [toast, setToast] = useState({ show: false, message: "", type: "error" });
  
  // 🟢 LOADING STATE FOR AJAX CALLS
  const [loadingQtyId, setLoadingQtyId] = useState(null);

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
  };

  // Auto-hide toast
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ ...toast, show: false }), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // 🟢 ASYNC HELPER: Handle Qty limits & Live Stock Check
  const handleQtyChange = async (id, size, currentQty, amount) => {
    const newQty = currentQty + amount;
    
    // Prevent dropping below 1
    if (newQty < 1) return;
    
    // ENFORCE MAX 10 VALIDATION
    if (newQty > 10) {
      showToast("Maximum quantity limit is 10 per item.", "error");
      return;
    }

    // 🟢 AJAX STOCK CHECK: Only check backend when INCREASING quantity
    if (amount > 0) {
      setLoadingQtyId(`${id}-${size}`); // Lock this specific item's buttons
      
      try {
        // Fetch current product data from your backend
        const res = await api.get(`/products/${id}`);
        const availableStock = res.data.stock;

        if (newQty > availableStock) {
          showToast(`Only ${availableStock} pieces available in stock.`, "error");
          setLoadingQtyId(null); // Unlock buttons
          return; // Stop the increment
        }
      } catch (error) {
        console.error("Stock check failed:", error);
        showToast("Unable to verify stock at the moment. Please try again.", "error");
        setLoadingQtyId(null);
        return;
      }
      
      setLoadingQtyId(null); // Unlock buttons after successful check
    }

    // Update context state if stock allows it
    updateQty(id, size, newQty);
  };

  return (
    <div className="bg-white min-h-[80vh] font-sans selection:bg-neutral-200 relative overflow-hidden">
      
      {/* 🟢 PREMIUM CUSTOM TOAST ALERT */}
      <div 
        className={`fixed left-1/2 top-24 z-[100] flex w-[90%] max-w-sm -translate-x-1/2 transform items-center gap-2.5 rounded-sm p-3 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] backdrop-blur-xl transition-all duration-500 ease-[0.25,1,0.5,1] ${
          toast.show ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0 pointer-events-none"
        } ${
          toast.type === "error" ? "bg-white/95 border-l-3 border-red-500 text-neutral-800" : "bg-neutral-950/95 text-white"
        }`}
      >
        {toast.type === "error" ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        <p className={`text-[10px] font-medium tracking-wide ${toast.type === "error" ? "text-neutral-700" : "text-neutral-200"}`}>
          {toast.message}
        </p>
        <button onClick={() => setToast({ ...toast, show: false })} className={`ml-auto transition-colors ${toast.type === "error" ? "text-neutral-400 hover:text-neutral-900" : "text-neutral-400 hover:text-white"}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="max-w-[85rem] mx-auto px-6 sm:px-8 lg:px-12 py-20 sm:py-32">
        
        {/* EDITORIAL HEADER */}
        <div className="flex flex-col items-center mb-20 border-b border-neutral-200 pb-10">
          <h1 className="text-4xl md:text-5xl font-light tracking-wide uppercase text-neutral-900">
            Shopping Bag
          </h1>
          <p className="mt-6 text-[10px] font-bold tracking-[0.3em] text-neutral-400 uppercase">
            {cartItems.length} {cartItems.length === 1 ? "Item" : "Items"}
          </p>
        </div>

        {cartItems.length === 0 ? (
          /* LUXURY EMPTY STATE */
          <div className="text-center py-16 flex flex-col items-center min-h-[40vh] justify-center">
            <h2 className="text-2xl font-light tracking-wide text-neutral-900 mb-4 uppercase">Your bag is empty</h2>
            <p className="text-sm font-light tracking-wide text-neutral-500 mb-10 max-w-md mx-auto leading-relaxed">
              Discover our latest collections and find your new signature pieces.
            </p>
            <Link
              to="/products"
              className="group relative overflow-hidden border border-neutral-950 bg-white text-neutral-950 px-12 py-4 text-[10px] font-bold uppercase tracking-[0.25em] transition-all duration-500 hover:text-white"
            >
              <span className="relative z-10">Continue Shopping</span>
              <div className="absolute inset-0 h-full w-full scale-x-0 bg-neutral-950 transition-transform duration-500 ease-[0.25,1,0.5,1] group-hover:scale-x-100 origin-left"></div>
            </Link>
          </div>
        ) : (
          /* SPLIT SCREEN CART LAYOUT */
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-16 lg:items-start">
            
            {/* LEFT COLUMN: ITEM LIST */}
            <div className="lg:col-span-7 xl:col-span-8">
              <ul className="divide-y divide-neutral-200 border-b border-neutral-200">
                {cartItems.map((item, index) => {
                  const isItemLoading = loadingQtyId === `${item._id}-${item.size}`;
                  
                  return (
                  <li key={`${item._id}-${item.size}-${index}`} className="flex py-10 sm:py-12 group">
                    
                    {/* 🖼️ Item Image */}
                    <div className="flex-shrink-0 w-28 h-40 sm:w-36 sm:h-52 bg-neutral-100 overflow-hidden relative border border-neutral-100">
                      <Link to={`/products/${item._id}`} className="block w-full h-full">
                        <img
                          src={item.mainimage1 || item.image} 
                          alt={item.title}
                          className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-[1.5s] ease-[0.25,1,0.5,1] group-hover:scale-105"
                        />
                      </Link>
                    </div>

                    {/* Item Details */}
                    <div className="ml-6 sm:ml-10 flex-1 flex flex-col justify-between">
                      <div className="relative">
                        <div className="flex justify-between sm:grid sm:grid-cols-2 gap-4">
                          <div className="pr-6">
                            <p className="text-[8px] font-bold tracking-[0.25em] uppercase text-neutral-400 mb-2">
                              {item.category || "Thread Theory"}
                            </p>
                            <h3 className="text-sm font-light tracking-wide text-neutral-900 leading-snug hover:text-neutral-500 transition-colors">
                              <Link to={`/products/${item._id}`}>{item.title}</Link>
                            </h3>
                            <p className="mt-3 text-[9px] text-neutral-500 uppercase tracking-[0.2em]">
                              Size: <span className="text-neutral-900 font-bold">{item.size}</span>
                            </p>
                            
                            {/* Mobile QTY Indicator */}
                            {item.qty === 10 && (
                              <p className="text-[8px] font-bold tracking-widest text-red-500 uppercase mt-2 sm:hidden">Max Qty Reached</p>
                            )}
                          </div>
                          
                          <div className="text-right">
                            <p className="text-sm font-medium tracking-wide text-neutral-900">
                              ₹{item.price.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Mobile Remove Button (X Icon top right) */}
                        <div className="absolute -top-2 -right-2 sm:hidden">
                          <button 
                            onClick={() => removeFromCart(item._id, item.size)}
                            className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="mt-6 flex items-end justify-between">
                        
                        {/* Custom High-End Quantity Selector */}
                        <div>
                          <div className={`flex items-center border border-neutral-300 w-max bg-white transition-colors ${!isItemLoading && 'hover:border-neutral-900'} ${isItemLoading ? 'opacity-50' : ''}`}>
                            <button
                              type="button"
                              onClick={() => handleQtyChange(item._id, item.size, item.qty, -1)}
                              disabled={item.qty <= 1 || isItemLoading}
                              className={`px-4 py-2 transition-colors focus:outline-none ${item.qty <= 1 || isItemLoading ? 'text-neutral-200 cursor-not-allowed' : 'text-neutral-500 hover:text-neutral-900'}`}
                            >
                              &minus;
                            </button>
                            <span className="px-2 py-1 text-[10px] font-medium text-neutral-900 w-8 text-center flex justify-center">
                              {isItemLoading ? (
                                <svg className="w-3 h-3 animate-spin text-neutral-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                              ) : (
                                item.qty
                              )}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQtyChange(item._id, item.size, item.qty, 1)}
                              disabled={item.qty >= 10 || isItemLoading}
                              className={`px-4 py-2 transition-colors focus:outline-none ${item.qty >= 10 || isItemLoading ? 'text-neutral-200 cursor-not-allowed' : 'text-neutral-500 hover:text-neutral-900'}`}
                            >
                              &#43;
                            </button>
                          </div>
                          
                          {/* Desktop Max Limit Warning */}
                          {item.qty === 10 && (
                            <p className="hidden sm:block text-[7px] font-bold tracking-widest text-red-500 uppercase mt-2">Max Qty Reached</p>
                          )}
                        </div>

                        {/* Desktop Remove Button */}
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

            {/* RIGHT COLUMN: ORDER SUMMARY */}
            <div className="mt-16 lg:mt-0 lg:col-span-5 xl:col-span-4 bg-neutral-50/50 border border-neutral-100 p-8 sm:p-10 sticky top-32">
              <h2 className="text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-900 mb-8 border-b border-neutral-200 pb-4">
                Order Summary
              </h2>

              <dl className="space-y-6 text-sm text-neutral-600 mb-8">
                <div className="flex justify-between">
                  <dt className="font-light tracking-wide">Subtotal</dt>
                  <dd className="font-medium text-neutral-900">₹{totalAmount.toLocaleString()}</dd>
                </div>
                
                <div className="flex justify-between">
                  <dt className="font-light tracking-wide">Shipping</dt>
                  <dd className="text-neutral-500 italic text-[10px] uppercase tracking-widest">Calculated at checkout</dd>
                </div>
                
                <div className="flex justify-between pt-6 border-t border-neutral-200">
                  <dt className="text-base font-light text-neutral-900 tracking-wide">Total</dt>
                  <dd className="text-lg font-medium text-neutral-900">₹{totalAmount.toLocaleString()}</dd>
                </div>
              </dl>

              <div className="mt-10">
                <Link
                  to="/checkout"
                  className="w-full flex justify-between items-center bg-neutral-950 text-white px-8 py-5 text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-neutral-800 transition-all duration-300 active:scale-[0.98]"
                >
                  <span>Proceed to Checkout</span>
                  <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>

              <div className="mt-6 text-center">
                <Link to="/products" className="inline-block text-[9px] font-bold tracking-[0.2em] uppercase text-neutral-400 hover:text-neutral-900 transition-colors border-b border-transparent hover:border-neutral-900 pb-0.5">
                  or Continue Shopping
                </Link>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}