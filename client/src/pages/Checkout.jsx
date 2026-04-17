import { useState, useEffect, useRef } from "react";
import { useCart } from "../context/useCart";
import { useNavigate, Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2, X, MapPin } from "lucide-react";
import api from "../services/api";

// 🌟 DYNAMIC RAZORPAY LOADER (Prevents "window.Razorpay is not a function" crash)
const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Checkout() {
  const { cartItems, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();

  // 🟢 STEPPER STATE (1: Address, 2: Shipping, 3: Payment)
  const [activeStep, setActiveStep] = useState(1);

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [loading, setLoading] = useState(false);
  const [shippingMethod, setShippingMethod] = useState("standard");
  
  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    addressLine: "",
    city: "",
    pincode: "",
  });

  // 🟢 SAVED DB USER PROFILE FOR AUTOFILL
  const [dbUser, setDbUser] = useState(null);

  // 🟢 LUXURY TOAST STATE
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const timerRef = useRef(null);

  const showToast = (message, type = "success") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ show: true, message, type });
    timerRef.current = setTimeout(() => setToast({ ...toast, show: false }), 4000);
  };

  // 🟢 FETCH USER PROFILE ON MOUNT
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await api.get("/users/profile"); 
        if (res.data) setDbUser(res.data);
      } catch (error) {
        console.log("User not logged in or profile fetch failed.");
      }
    };
    fetchUserProfile();
  }, []);

  // 🟢 AUTO-FILL FUNCTION
  const handleAutoFill = () => {
    if (dbUser) {
      setAddress({
        fullName: dbUser.name || "",
        phone: dbUser.phone || "",
        addressLine: dbUser.address?.street || "",
        city: dbUser.address?.city || "",
        pincode: dbUser.address?.postalCode || "",
      });
      showToast("Address populated from your profile.", "success");
    }
  };

  // 🟢 DYNAMIC GST CALCULATION (5% <= ₹2500 | 18% > ₹2500)
  let calculatedGST = 0;
  cartItems.forEach((item) => {
    const lineItemTotal = item.price * item.qty;
    const gstRate = item.price <= 2500 ? 0.05 : 0.18;
    calculatedGST += (lineItemTotal * gstRate);
  });

  const finalGST = Math.round(calculatedGST);

  // 🌟 FIX: Calculate Final Amount on-the-fly and FORCE integer to prevent Razorpay crashes
  const finalAmount = Math.round(totalAmount + finalGST - discount + shippingCost);

  // 🎟 APPLY COUPON
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      showToast("Please enter a valid code.", "error");
      return;
    }
    try {
      // Use totalAmount for backwards compatibility with your backend logic
      const res = await api.post("/coupons/validate", { code: couponCode, totalAmount });
      setDiscount(res.data.discount);
      showToast("Code applied successfully.", "success");
    } catch (error) {
      showToast(error.response?.data?.message || "Invalid or expired code.", "error");
    }
  };

  // ➡️ STEP 1 TO STEP 2
  const handleContinueToShipping = () => {
    if (!address.fullName || !address.phone || !address.addressLine || !address.city || !address.pincode) {
      showToast("Please complete your delivery details.", "error");
      return;
    }
    setActiveStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ➡️ STEP 2 TO STEP 3
  const handleContinueToPayment = () => {
    if (shippingMethod === "express") setShippingCost(500);
    else setShippingCost(0);
    
    setActiveStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 💳 HANDLE FINAL PAYMENT (BUG FIXED)
  const handlePayment = async () => {
    if (cartItems.length === 0) return showToast("Your bag is empty.", "error");

    try {
      setLoading(true);

      // 🌟 FIX 1: Ensure Razorpay SDK is loaded on the page
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        showToast("Payment gateway failed to load. Please check your connection.", "error");
        setLoading(false);
        return;
      }

      // 🌟 FIX 2: Send perfectly rounded integer to backend
      const res = await api.post("/payments/create-order", { amount: finalAmount });
      const razorpayOrder = res.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: "INR",
        name: "Thread Theory",
        description: "Premium Collection Purchase",
        order_id: razorpayOrder.id,
        handler: async function (response) {
          await api.post("/payments/update-status", {
            razorpayOrderId: razorpayOrder.id,
            razorpayPaymentId: response.razorpay_payment_id,
            products: cartItems.map((item) => ({
              productId: item._id,
              quantity: item.qty,
              price: item.price,
            })),
            address,
          });

          showToast("Payment successful! Order confirmed.", "success");
          clearCart();
          setTimeout(() => navigate("/orders"), 1500);
        },
        theme: { color: "#0a0a0a" },
      };

      const rzp = new window.Razorpay(options);
      
      // Handle window close failure
      rzp.on('payment.failed', function (response){
        console.error(response.error);
        showToast("Payment was cancelled or failed.", "error");
      });

      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      showToast("Secure payment failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // EMPTY STATE
  if (cartItems.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-white px-6 text-center font-sans">
        <svg className="w-12 h-12 text-neutral-200 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <h2 className="text-2xl font-light tracking-wide text-neutral-900 mb-4 uppercase">Your Bag is Empty</h2>
        <p className="text-sm font-light tracking-wide text-neutral-500 mb-10 max-w-md mx-auto leading-relaxed">
          It looks like you haven't added any pieces to your bag yet.
        </p>
        <Link
          to="/products"
          className="group relative overflow-hidden border border-neutral-950 bg-white text-neutral-950 px-12 py-4 text-[10px] font-bold uppercase tracking-[0.25em] transition-all duration-500 hover:text-white"
        >
          <span className="relative z-10">Return to Shop</span>
          <div className="absolute inset-0 h-full w-full scale-x-0 bg-neutral-950 transition-transform duration-500 ease-[0.25,1,0.5,1] group-hover:scale-x-100 origin-left"></div>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen font-sans pb-32 relative selection:bg-neutral-200">
      
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
            {toast.type === "error" ? "Alert" : "Success"}
          </p>
          <p className={`text-xs sm:text-sm font-medium tracking-wide ${toast.type === "error" ? "text-neutral-900" : "text-neutral-200"}`}>
            {toast.message}
          </p>
        </div>
        <button onClick={() => setToast({ ...toast, show: false })} className="shrink-0 p-2 -mr-2 hover:scale-110 transition-transform active:scale-95">
          <X className={`h-4 w-4 stroke-[2] ${toast.type === "error" ? "text-neutral-400" : "text-neutral-400"}`} />
        </button>
      </div>

      <div className="max-w-[100rem] mx-auto px-5 sm:px-8 lg:px-12 pt-24 lg:pt-32">
        
        {/* HEADER */}
        <div className="mb-12 sm:mb-16 border-b border-neutral-200 pb-8 sm:pb-10 flex flex-col items-center text-center opacity-0 animate-[fade-in-up_0.6s_ease-out_forwards]">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wide uppercase text-neutral-900 mb-3 sm:mb-4">
            Secure Checkout
          </h1>
          <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400">
            Complete your purchase in 3 steps
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-12 xl:gap-16 lg:items-start">
          
          {/* LEFT COLUMN: THE WIZARD */}
          <div className="lg:col-span-7 xl:col-span-8 mb-16 lg:mb-0 space-y-6">
            
            {/* ================= STEP 1: DELIVERY ================= */}
            <div className={`border transition-all duration-500 ${activeStep === 1 ? "border-neutral-900 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)]" : "border-neutral-200 bg-neutral-50"}`}>
              
              <div className="flex justify-between items-center p-6 sm:p-8">
                <h2 className={`text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase transition-colors ${activeStep === 1 ? "text-neutral-900" : "text-neutral-400"}`}>
                  1. Delivery Details
                </h2>
                {activeStep > 1 && (
                  <button onClick={() => setActiveStep(1)} className="text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-900 hover:text-neutral-500 transition-colors border-b border-neutral-900 pb-0.5">Edit</button>
                )}
              </div>
              
              {activeStep === 1 && (
                <div className="p-6 sm:p-8 pt-0 space-y-6 sm:space-y-8 animate-fade-in-up">
                  
                  {/* AUTO FILL BUTTON */}
                  {dbUser && (dbUser.address?.street || dbUser.name) && (
                    <div className="mb-4 bg-neutral-50 border border-neutral-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-neutral-400 stroke-[1.5]" />
                        <div>
                          <p className="text-xs font-medium text-neutral-900 tracking-wide">Saved Address Found</p>
                          <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-0.5">Use data from your profile</p>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={handleAutoFill} 
                        className="border border-neutral-900 text-neutral-900 px-6 py-2.5 text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-900 hover:text-white transition-colors"
                      >
                        Auto-Fill
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    <div className="relative group">
                      <label className="block text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-500 mb-2 transition-colors group-focus-within:text-neutral-900">Full Name</label>
                      <input type="text" className="w-full bg-white border border-neutral-300 py-3 sm:py-3.5 px-4 text-xs sm:text-sm font-light text-neutral-900 focus:outline-none focus:border-neutral-900 rounded-none transition-colors" placeholder="Jane Doe" value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} />
                    </div>
                    <div className="relative group">
                      <label className="block text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-500 mb-2 transition-colors group-focus-within:text-neutral-900">Phone Number</label>
                      <input type="tel" className="w-full bg-white border border-neutral-300 py-3 sm:py-3.5 px-4 text-xs sm:text-sm font-light text-neutral-900 focus:outline-none focus:border-neutral-900 rounded-none transition-colors" placeholder="+91 98765 43210" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} />
                    </div>
                  </div>
                  <div className="relative group">
                    <label className="block text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-500 mb-2 transition-colors group-focus-within:text-neutral-900">Street Address</label>
                    <input type="text" className="w-full bg-white border border-neutral-300 py-3 sm:py-3.5 px-4 text-xs sm:text-sm font-light text-neutral-900 focus:outline-none focus:border-neutral-900 rounded-none transition-colors" placeholder="Apartment, suite, unit, etc." value={address.addressLine} onChange={(e) => setAddress({ ...address, addressLine: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    <div className="relative group">
                      <label className="block text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-500 mb-2 transition-colors group-focus-within:text-neutral-900">City</label>
                      <input type="text" className="w-full bg-white border border-neutral-300 py-3 sm:py-3.5 px-4 text-xs sm:text-sm font-light text-neutral-900 focus:outline-none focus:border-neutral-900 rounded-none transition-colors" placeholder="Surat" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
                    </div>
                    <div className="relative group">
                      <label className="block text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-500 mb-2 transition-colors group-focus-within:text-neutral-900">Postal Code</label>
                      <input type="text" className="w-full bg-white border border-neutral-300 py-3 sm:py-3.5 px-4 text-xs sm:text-sm font-light text-neutral-900 focus:outline-none focus:border-neutral-900 rounded-none transition-colors" placeholder="395007" value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} />
                    </div>
                  </div>
                  <button onClick={handleContinueToShipping} className="mt-8 w-full md:w-auto bg-neutral-950 text-white px-10 py-4 text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-neutral-800 transition-all duration-300 active:scale-[0.98]">
                    Continue to Shipping
                  </button>
                </div>
              )}
              {activeStep > 1 && (
                <div className="px-6 sm:px-8 pb-8 text-xs sm:text-sm text-neutral-500 font-light tracking-wide leading-relaxed">
                  <span className="font-medium text-neutral-900">{address.fullName}</span> <br/>
                  {address.addressLine}, {address.city}, {address.pincode} <br/>
                  {address.phone}
                </div>
              )}
            </div>

            {/* ================= STEP 2: SHIPPING ================= */}
            <div className={`border transition-all duration-500 ${activeStep === 2 ? "border-neutral-900 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)]" : "border-neutral-200 bg-neutral-50"}`}>
              <div className="flex justify-between items-center p-6 sm:p-8">
                <h2 className={`text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase transition-colors ${activeStep === 2 ? "text-neutral-900" : "text-neutral-400"}`}>
                  2. Shipping Method
                </h2>
                {activeStep > 2 && (
                  <button onClick={() => setActiveStep(2)} className="text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-900 hover:text-neutral-500 transition-colors border-b border-neutral-900 pb-0.5">Edit</button>
                )}
              </div>

              {activeStep === 2 && (
                <div className="p-6 sm:p-8 pt-0 space-y-4 animate-fade-in-up">
                  
                  <label className={`block border p-5 cursor-pointer transition-all duration-300 ${shippingMethod === 'standard' ? 'border-neutral-900 bg-white shadow-sm' : 'border-neutral-200 bg-white/50 hover:border-neutral-400'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <input type="radio" name="shipping" checked={shippingMethod === 'standard'} onChange={() => setShippingMethod('standard')} className="w-4 h-4 text-neutral-900 focus:ring-neutral-900 accent-neutral-900" />
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-neutral-900 uppercase tracking-widest">Standard Delivery</p>
                          <p className="text-[9px] sm:text-[10px] text-neutral-500 mt-1 uppercase tracking-widest">3-5 Business Days</p>
                        </div>
                      </div>
                      <span className="text-xs sm:text-sm font-light tracking-wide text-neutral-900">Complimentary</span>
                    </div>
                  </label>

                  <label className={`block border p-5 cursor-pointer transition-all duration-300 ${shippingMethod === 'express' ? 'border-neutral-900 bg-white shadow-sm' : 'border-neutral-200 bg-white/50 hover:border-neutral-400'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <input type="radio" name="shipping" checked={shippingMethod === 'express'} onChange={() => setShippingMethod('express')} className="w-4 h-4 text-neutral-900 focus:ring-neutral-900 accent-neutral-900" />
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-neutral-900 uppercase tracking-widest">Express Priority</p>
                          <p className="text-[9px] sm:text-[10px] text-neutral-500 mt-1 uppercase tracking-widest">1-2 Business Days</p>
                        </div>
                      </div>
                      <span className="text-xs sm:text-sm font-medium tracking-wide text-neutral-900">₹500</span>
                    </div>
                  </label>

                  <button onClick={handleContinueToPayment} className="mt-8 w-full md:w-auto bg-neutral-950 text-white px-10 py-4 text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-neutral-800 transition-all duration-300 active:scale-[0.98]">
                    Continue to Payment
                  </button>
                </div>
              )}
              {activeStep > 2 && (
                <div className="px-6 sm:px-8 pb-8 text-xs sm:text-sm text-neutral-500 font-light tracking-wide">
                  {shippingMethod === 'standard' ? 'Standard Delivery (Complimentary)' : 'Express Priority (₹500)'}
                </div>
              )}
            </div>

            {/* ================= STEP 3: PAYMENT ================= */}
            <div className={`border transition-all duration-500 ${activeStep === 3 ? "border-neutral-900 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)]" : "border-neutral-200 bg-neutral-50"}`}>
              <div className="p-6 sm:p-8">
                <h2 className={`text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase transition-colors ${activeStep === 3 ? "text-neutral-900" : "text-neutral-400"}`}>
                  3. Secure Payment
                </h2>
              </div>
              
              {activeStep === 3 && (
                <div className="p-6 sm:p-8 pt-0 animate-fade-in-up">
                  <p className="text-xs sm:text-sm text-neutral-500 font-light tracking-wide leading-relaxed mb-8">
                    Your transaction is encrypted and secure. Click below to open our trusted payment gateway.
                  </p>
                  
                  <button
                    onClick={handlePayment}
                    disabled={loading}
                    className={`w-full py-4.5 sm:py-5 text-[10px] font-bold tracking-[0.25em] uppercase transition-all duration-300 active:scale-[0.98] flex justify-center items-center gap-3 ${
                      loading ? "bg-neutral-200 text-neutral-400 cursor-wait" : "bg-neutral-950 text-white hover:bg-neutral-800 shadow-xl shadow-neutral-950/10"
                    }`}
                  >
                    {loading ? (
                      <svg className="animate-spin h-4 w-4 text-neutral-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      `Pay ₹${finalAmount.toLocaleString()}`
                    )}
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: STICKY ORDER SUMMARY */}
          <div className="lg:col-span-5 xl:col-span-4 relative opacity-0 animate-[fade-in-up_0.8s_ease-out_0.3s_forwards]">
            <div className="sticky top-32 bg-neutral-50/50 border border-neutral-200 p-6 sm:p-8 lg:p-10">
              
              <div className="flex justify-between items-center mb-6 sm:mb-8 border-b border-neutral-200 pb-4">
                <h3 className="text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase text-neutral-900">Order Summary</h3>
                <Link to="/cart" className="text-[8px] sm:text-[9px] font-bold tracking-[0.2em] uppercase text-neutral-400 hover:text-neutral-900 transition-colors border-b border-transparent hover:border-neutral-900 pb-0.5">Edit Bag</Link>
              </div>

              {/* Items List */}
              <div className="space-y-6 mb-8 max-h-[35vh] lg:max-h-[40vh] overflow-y-auto pr-2 no-scrollbar border-b border-neutral-200 pb-6 sm:pb-8">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex gap-4 sm:gap-5 group">
                    <div className="w-16 h-24 sm:w-20 sm:h-28 bg-neutral-100 overflow-hidden shrink-0">
                      <img src={item.mainimage1 || item.image} alt={item.title} className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <p className="text-[7px] sm:text-[8px] font-bold tracking-[0.25em] uppercase text-neutral-400 mb-1">{item.category || "Thread Theory"}</p>
                      <h4 className="text-xs sm:text-sm font-light tracking-wide text-neutral-900 leading-snug line-clamp-2">{item.title}</h4>
                      <p className="text-[9px] sm:text-[10px] text-neutral-500 uppercase tracking-[0.2em] mt-1.5 sm:mt-2">Size: <span className="font-bold text-neutral-900">{item.size}</span> | Qty: <span className="font-bold text-neutral-900">{item.qty}</span></p>
                      <p className="text-xs sm:text-sm text-neutral-900 font-medium tracking-wide mt-1.5 sm:mt-2">₹{(item.price * item.qty).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Logic */}
              <div className="mb-8">
                <div className="flex gap-0 border border-neutral-300 focus-within:border-neutral-900 transition-colors">
                  <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Discount Code" className="w-full bg-white py-3 sm:py-3.5 px-4 text-[9px] sm:text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-900 focus:outline-none placeholder-neutral-400 rounded-none" />
                  <button onClick={applyCoupon} className="bg-neutral-950 text-white px-6 sm:px-8 text-[8px] sm:text-[9px] font-bold tracking-[0.25em] uppercase hover:bg-neutral-800 transition-colors shrink-0">Apply</button>
                </div>
              </div>

              {/* 🌟 PRICE BREAKDOWN WITH GST */}
              <dl className="space-y-4 sm:space-y-5 text-xs sm:text-sm font-light text-neutral-600 tracking-wide">
                
                <div className="flex justify-between items-center">
                  <dt>Subtotal</dt>
                  <dd className="text-neutral-900 font-medium">₹{totalAmount.toLocaleString()}</dd>
                </div>
                
                <div className="flex justify-between items-start">
                  <dt className="flex flex-col">
                    <span>Estimated GST</span>
                    <span className="text-[7px] sm:text-[8px] text-neutral-400 mt-1 uppercase tracking-[0.15em] font-bold">
                      (5% OR 18% APPLIED PER PIECE)
                    </span>
                  </dt>
                  <dd className="text-neutral-900 font-medium">₹{finalGST.toLocaleString()}</dd>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-neutral-900">
                    <dt>Discount applied</dt>
                    <dd className="font-medium">- ₹{discount.toLocaleString()}</dd>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <dt>Shipping</dt>
                  <dd className="text-neutral-900 font-medium">{shippingCost === 0 ? "Complimentary" : `₹${shippingCost}`}</dd>
                </div>

                <div className="flex justify-between pt-5 sm:pt-6 border-t border-neutral-200 items-end mt-5 sm:mt-6">
                  <dt className="text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase text-neutral-900">Total Due</dt>
                  <dd className="text-xl sm:text-2xl font-light text-neutral-900 tracking-tight">₹{finalAmount.toLocaleString()}</dd>
                </div>
              </dl>

            </div>
          </div>

        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}