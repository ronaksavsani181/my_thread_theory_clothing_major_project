import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { Star, UploadCloud, Link as LinkIcon, X, CheckCircle, ArrowLeft, ArrowRight, ThumbsUp, User } from "lucide-react";

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // 🟢 CINEMATIC ROUTING STATE
  const [isRedirecting, setIsRedirecting] = useState(false);

  // 🟢 RETURN MODAL STATES
  const [itemToReturn, setItemToReturn] = useState(null);
  const [returnReason, setReturnReason] = useState("");
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [returnSuccess, setReturnSuccess] = useState(false);

  // 🌟 REVIEW MODAL STATES
  const [itemToReview, setItemToReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  
  // 🌟 IMAGE UPLOAD STATES
  const [reviewImages, setReviewImages] = useState([]); // Stores actual Files or String URLs
  const [reviewImagePreviews, setReviewImagePreviews] = useState([]); // Stores object URLs for UI
  const [imageUrlInput, setImageUrlInput] = useState("");
  const fileInputRef = useRef(null);
  const timerRef = useRef(null);

  const showToast = (message, type = "success") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ show: true, message, type });
    timerRef.current = setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
  };

  const handleRedirect = (e, path) => {
    if (e) e.preventDefault();
    setIsRedirecting(true);
    setTimeout(() => {
      navigate(path);
    }, 800);
  };

  const fetchOrder = async () => {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' }); 
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data);
    } catch (error) {
      showToast("Failed to load order details.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // Lock body scroll when modals open
  useEffect(() => {
    if (itemToReturn || itemToReview || returnSuccess) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [itemToReturn, itemToReview, returnSuccess]);


  /* =========================================================
     RETURN LOGIC
     ========================================================= */
  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!returnReason) return showToast("Please select a reason for return.", "error");
    setSubmittingReturn(true);
    try {
      const productId = itemToReturn.productId._id || itemToReturn.productId;
      await api.post("/returns/request", {
        orderId: order._id,
        productId: productId,
        quantity: itemToReturn.quantity,
        reason: returnReason,
      });
      setItemToReturn(null);
      setReturnReason("");
      setReturnSuccess(true);
      
      // Cinematic redirect after success
      setTimeout(() => {
        setIsRedirecting(true);
        setTimeout(() => navigate("/my-returns"), 800);
      }, 2000);

    } catch (error) {
      showToast(error.response?.data?.message || "Failed to submit return request.", "error");
    } finally {
      setSubmittingReturn(false);
    }
  };

  /* =========================================================
     REVIEW LOGIC & IMAGE UPLOAD
     ========================================================= */
  const closeReviewModal = () => {
    if (submittingReview) return;
    setItemToReview(null);
    setReviewRating(5);
    setReviewComment("");
    setReviewImages([]);
    setReviewImagePreviews([]);
    setImageUrlInput("");
  };

  const handleLocalImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (reviewImages.length + files.length > 4) {
      return showToast("You can only upload up to 4 images.", "error");
    }
    
    const newFiles = [];
    const newPreviews = [];
    
    files.forEach(file => {
      newFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    setReviewImages(prev => [...prev, ...newFiles]);
    setReviewImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    if (reviewImages.length >= 4) {
      return showToast("Maximum 4 images allowed.", "error");
    }
    setReviewImages(prev => [...prev, imageUrlInput]);
    setReviewImagePreviews(prev => [...prev, imageUrlInput]);
    setImageUrlInput("");
  };

  const removeImage = (index) => {
    setReviewImages(prev => prev.filter((_, i) => i !== index));
    setReviewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return showToast("Please write a review.", "error");

    setSubmittingReview(true);
    try {
      const productId = itemToReview.productId._id || itemToReview.productId;
      
      const formData = new FormData();
      formData.append("rating", reviewRating);
      formData.append("comment", reviewComment);
      
      reviewImages.forEach(img => {
        if (typeof img === "string") {
          formData.append("imageUrls", img); 
        } else {
          formData.append("images", img); 
        }
      });

      await api.post(`/reviews/${productId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      showToast("Review published successfully!", "success");
      closeReviewModal();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to submit review.", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase();
  };

  /* =========================================================
     LOADING & ERROR STATES
     ========================================================= */
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white text-center">
        <div className="flex flex-col items-center gap-4">
           <svg className="animate-spin h-6 w-6 text-neutral-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
           <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-neutral-400">
            Retrieving Records...
          </p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={`min-h-[85vh] flex flex-col items-center justify-center bg-white px-6 text-center font-sans transition-opacity duration-700 ${isRedirecting ? 'opacity-50' : 'opacity-100'}`}>
        <svg className="w-12 h-12 text-neutral-200 mb-8 stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <h2 className="text-2xl sm:text-3xl font-light tracking-wide text-neutral-900 mb-4 uppercase">Order Not Found</h2>
        <button onClick={(e) => handleRedirect(e, '/orders')} className="group relative overflow-hidden border border-neutral-950 bg-white text-neutral-950 px-10 py-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] hover:text-white transition-colors active:scale-95 mt-6">
          <span className="relative z-10 transition-colors duration-500 flex items-center justify-center gap-2">
            {isRedirecting ? "Redirecting..." : "Return to History"}
          </span>
          {!isRedirecting && <div className="absolute inset-0 h-full w-full scale-x-0 bg-neutral-950 transition-transform duration-500 ease-[0.25,1,0.5,1] group-hover:scale-x-100 origin-left"></div>}
        </button>
      </div>
    );
  }

  /* =========================================================
     🟢 DYNAMIC GST CALCULATION (5% <= ₹2500 | 18% > ₹2500)
     ========================================================= */
  let calculatedSubtotal = 0;
  let calculatedGST = 0;

  if (order && order.products) {
    order.products.forEach((item) => {
      const lineItemTotal = item.price * item.quantity;
      calculatedSubtotal += lineItemTotal;
      
      const gstRate = item.price <= 2500 ? 0.05 : 0.18;
      calculatedGST += (lineItemTotal * gstRate);
    });
  }

  const finalGST = Math.round(calculatedGST);

  return (
    <div className={`bg-white min-h-[100dvh] font-sans pb-32 relative selection:bg-neutral-200 transition-opacity duration-700 ease-[0.25,1,0.5,1] overflow-hidden ${isRedirecting ? 'opacity-50' : 'opacity-100'}`}>
      
      {/* LUXURY TOAST NOTIFICATION */}
      <div 
        className={`fixed top-24 left-1/2 z-[100] flex w-[90%] sm:w-auto min-w-[320px] max-w-md -translate-x-1/2 transform items-center gap-3.5 rounded-2xl p-4 sm:p-5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] backdrop-blur-2xl transition-all duration-500 ease-[0.25,1,0.5,1] border ${
          toast.show ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0 pointer-events-none"
        } ${
          toast.type === "error" ? "bg-white/90 border-red-100 text-neutral-900" : "bg-neutral-950/95 border-neutral-800 text-white"
        }`}
      >
        <div className="flex-1 text-left">
          <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] ${toast.type === "error" ? "text-red-500" : "text-emerald-400"} mb-0.5`}>
            {toast.type === "error" ? "Notice" : "Success"}
          </p>
          <p className={`text-xs sm:text-sm font-medium tracking-wide ${toast.type === "error" ? "text-neutral-900" : "text-neutral-200"}`}>
            {toast.message}
          </p>
        </div>
        <button onClick={() => { setToast({ ...toast, show: false }); if (timerRef.current) clearTimeout(timerRef.current); }} className="shrink-0 p-2 -mr-2 hover:scale-110 transition-transform active:scale-95">
          <X className={`h-4 w-4 stroke-[2] ${toast.type === "error" ? "text-neutral-400" : "text-neutral-400"}`} />
        </button>
      </div>

      {/* RETURN SUCCESS POPUP */}
      <div className={`fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 bg-neutral-950/80 backdrop-blur-md transition-all duration-700 ease-[0.25,1,0.5,1] ${returnSuccess ? "opacity-100 visible" : "opacity-0 invisible"}`}>
         <div className={`bg-white p-10 sm:p-14 text-center max-w-md w-full shadow-2xl transform transition-transform duration-700 ease-[0.25,1,0.5,1] rounded-sm ${returnSuccess ? "scale-100 translate-y-0" : "scale-95 translate-y-12"}`}>
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
               <CheckCircle className="w-10 h-10 stroke-[1.5]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-light uppercase tracking-wide mb-4 text-neutral-900">Return Placed</h2>
            <p className="text-sm sm:text-base text-neutral-500 mb-10 font-light tracking-wide leading-relaxed px-2">Your return is currently in processing. Our team will review it shortly.</p>
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 flex items-center justify-center gap-3 animate-pulse w-full">
              <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Redirecting...
            </p>
         </div>
      </div>

      <div className="max-w-[70rem] mx-auto px-5 sm:px-8 lg:px-12 pt-28 sm:pt-36">
        
        {/* BACK LINK */}
        <button onClick={(e) => handleRedirect(e, '/orders')} className="inline-flex items-center gap-2 text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400 hover:text-neutral-900 transition-colors mb-10 sm:mb-12 group border-b border-transparent hover:border-neutral-900 pb-0.5 opacity-0 animate-[fade-in-up_0.6s_ease-out_forwards]">
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[1.5] transition-transform duration-300 group-hover:-translate-x-1" /> Back to Orders
        </button>

        {/* =========================================
            HEADER SECTION
            ========================================= */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-neutral-200 pb-10 sm:pb-12 mb-12 sm:mb-16 gap-8 opacity-0 animate-[fade-in-up_0.8s_ease-out_forwards]">
          <div className="text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wide uppercase text-neutral-900 mb-3 sm:mb-4">
              Order <span className="font-medium tracking-widest text-2xl sm:text-3xl text-neutral-500">#{order._id.slice(-6).toUpperCase()}</span>
            </h1>
            <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400">Placed on {formatDate(order.createdAt)}</p>
          </div>
          
          <div className="flex flex-wrap gap-8 sm:gap-12">
            <div className="flex flex-col text-left">
              <span className="text-[8px] sm:text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 mb-2 sm:mb-3">Payment</span>
              <span className="text-[10px] sm:text-xs font-bold text-neutral-900 uppercase tracking-[0.2em]">{order.paymentStatus || "PAID"}</span>
            </div>
            <div className="w-px bg-neutral-200"></div>
            <div className="flex flex-col text-left">
              <span className="text-[8px] sm:text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 mb-2 sm:mb-3">Status</span>
              <div className="flex items-center gap-2.5">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${order.orderStatus === 'Delivered' ? 'bg-emerald-500' : order.orderStatus === 'Cancelled' || order.orderStatus === 'Returned' ? 'bg-red-500' : order.orderStatus === 'Return Requested' ? 'bg-amber-500 animate-pulse' : 'bg-neutral-900'}`}></span>
                <span className="text-[10px] sm:text-xs font-bold text-neutral-900 uppercase tracking-[0.2em]">{order.orderStatus || "PROCESSING"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================
            INVOICE DETAILS GRID
            ========================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 mb-16 sm:mb-24 opacity-0 animate-[fade-in-up_0.8s_ease-out_0.2s_forwards]">
          
          {/* Summary Block */}
          <div className="bg-neutral-50/50 border border-neutral-100 p-6 sm:p-8 lg:p-12 shadow-[0_5px_20px_-10px_rgba(0,0,0,0.05)]">
            <h2 className="text-[9px] sm:text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-900 mb-6 sm:mb-8 border-b border-neutral-200 pb-4 text-left">Order Details</h2>
            <div className="space-y-4 sm:space-y-6 text-xs sm:text-sm font-light text-neutral-600 tracking-wide text-left">
              <div className="flex justify-between items-center"><span>Reference</span><span className="text-neutral-900 font-medium tracking-widest">{order._id.slice(-8).toUpperCase()}</span></div>
              <div className="flex justify-between items-center"><span>Date</span><span className="text-neutral-900 font-medium">{new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span></div>
              <div className="flex justify-between items-center"><span>Total Items</span><span className="text-neutral-900 font-medium">{order.products?.length || 0}</span></div>
            </div>
          </div>

          {/* Address Block */}
          {order.shippingAddress && (
            <div className="bg-neutral-50/50 border border-neutral-100 p-6 sm:p-8 lg:p-12 shadow-[0_5px_20px_-10px_rgba(0,0,0,0.05)]">
              <h2 className="text-[9px] sm:text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-900 mb-6 sm:mb-8 border-b border-neutral-200 pb-4 text-left">Delivery Address</h2>
              <div className="text-xs sm:text-sm font-light text-neutral-600 tracking-wide leading-[1.8] text-left">
                <p className="text-neutral-900 font-medium mb-2 uppercase tracking-wider">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.addressLine}</p>
                <p>{order.shippingAddress.city} - {order.shippingAddress.pincode}</p>
                <p className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-neutral-200 text-[10px] sm:text-xs">Tel: <span className="font-medium text-neutral-900">{order.shippingAddress.phone}</span></p>
              </div>
            </div>
          )}
        </div>

        {/* =========================================
            ITEMIZED LIST WITH INLINE ACTION BUTTONS
            ========================================= */}
        <div className="mb-16 sm:mb-24 opacity-0 animate-[fade-in-up_0.8s_ease-out_0.4s_forwards]">
          <h2 className="text-xl sm:text-2xl font-light tracking-wide uppercase text-neutral-900 mb-8 sm:mb-10 text-left">Purchased Pieces</h2>
          
          <div className="border-t border-neutral-200">
            {order.products.map((item, index) => {
              const productData = item.productId || {};
              const imageUrl = productData.image || productData.mainimage1 || productData.image2 || null;
              const productTitle = productData.title || "Archived Product";

              return (
                <div key={index} className="flex flex-col sm:flex-row py-8 sm:py-10 lg:py-12 border-b border-neutral-200 group text-left">
                  
                  {/* Image */}
                  <div className="flex-shrink-0 w-24 h-36 sm:w-28 sm:h-40 lg:w-32 lg:h-48 bg-neutral-100 overflow-hidden relative border border-neutral-100 mb-6 sm:mb-0">
                    {imageUrl ? (
                      <Link to={productData._id ? `/products/${productData._id}` : "#"}>
                         <img src={imageUrl} alt={productTitle} className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-[1.5s] ease-[0.25,1,0.5,1] group-hover:scale-105" />
                      </Link>
                    ) : (
                      <div className="w-full h-full bg-neutral-200"></div>
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="sm:ml-8 lg:ml-12 flex-1 flex flex-col justify-between">
                    <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-6 w-full">
                      
                      <div className="flex-1">
                        <p className="text-[7px] sm:text-[8px] font-bold tracking-[0.25em] uppercase text-neutral-400 mb-2">{productData.category || "Thread Theory"}</p>
                        <h3 className="text-sm sm:text-base font-light tracking-wide text-neutral-900 leading-[1.3] max-w-sm">
                          {productData._id ? <Link to={`/products/${productData._id}`} className="hover:text-neutral-500 transition-colors">{productTitle}</Link> : <span>{productTitle}</span>}
                        </h3>
                        <p className="mt-3 sm:mt-4 text-[9px] sm:text-[10px] text-neutral-500 uppercase tracking-[0.2em]">Qty: <span className="font-bold text-neutral-900">{item.quantity}</span></p>
                        <p className="text-[10px] sm:text-xs text-neutral-400 font-light tracking-wide mt-2">₹{item.price.toLocaleString()} each</p>
                        
                        {/* 🌟 PER ITEM GST BREAKDOWN */}
                        <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 mt-1">
                          GST: {item.price <= 2500 ? "5%" : "18%"}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-start sm:items-end justify-between gap-5 shrink-0">
                        <p className="text-base sm:text-lg font-medium tracking-wide text-neutral-900 sm:text-right">₹{(item.price * item.quantity).toLocaleString()}</p>
                        
                        {/* 🌟 ACTION BUTTONS (RETURN + REVIEW) */}
                        {order.orderStatus === "Delivered" && (
                          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-auto w-full sm:w-auto">
                            
                            <button 
                              onClick={() => setItemToReturn(item)}
                              className="group/btn relative overflow-hidden flex items-center justify-center border border-neutral-900 bg-transparent text-neutral-900 px-6 sm:px-8 py-3 sm:py-3.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.25em] transition-all duration-500 hover:text-white active:scale-[0.98]"
                            >
                              <span className="relative z-10 transition-colors duration-500">Return Item</span>
                              <div className="absolute inset-0 h-full w-full scale-x-0 bg-neutral-900 transition-transform duration-500 ease-[0.25,1,0.5,1] group-hover/btn:scale-x-100 origin-left"></div>
                            </button>

                            <button 
                              onClick={() => setItemToReview(item)}
                              className="group/btn2 relative overflow-hidden flex items-center justify-center border border-neutral-900 bg-neutral-950 text-white px-6 sm:px-8 py-3 sm:py-3.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.25em] transition-all duration-500 hover:text-neutral-900 active:scale-[0.98]"
                            >
                              <span className="relative z-10 transition-colors duration-500 group-hover/btn2:text-neutral-900">Write Review</span>
                              <div className="absolute inset-0 h-full w-full scale-x-0 bg-white transition-transform duration-500 ease-[0.25,1,0.5,1] group-hover/btn2:scale-x-100 origin-left"></div>
                            </button>

                          </div>
                        )}
                        {(order.orderStatus === "Return Requested" || order.orderStatus === "Returned") && (
                          <button 
                            onClick={(e) => handleRedirect(e, "/my-returns")}
                            className="text-[9px] font-bold uppercase tracking-[0.25em] text-red-600 hover:text-red-800 transition-colors border-b border-transparent hover:border-red-600 pb-0.5 mt-auto flex items-center gap-1.5"
                          >
                            Return Details <ArrowRight className="w-3 h-3 stroke-[2]" />
                          </button>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================
            TOTALS CALCULATION WITH GST
            ========================================= */}
        <div className="flex justify-end opacity-0 animate-[fade-in-up_0.8s_ease-out_0.6s_forwards]">
          <div className="w-full sm:w-[70%] lg:w-[45%] bg-neutral-50/50 border border-neutral-100 p-6 sm:p-8 lg:p-12 shadow-[0_5px_20px_-10px_rgba(0,0,0,0.05)]">
            <h2 className="text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase text-neutral-900 mb-8 border-b border-neutral-200 pb-4 text-left">
              Payment Summary
            </h2>
            <dl className="space-y-5 sm:space-y-6 text-xs sm:text-sm font-light text-neutral-600 tracking-wide text-left">
              
              <div className="flex justify-between items-center">
                <dt className="font-light tracking-wide">Subtotal</dt>
                <dd className="text-neutral-900 font-medium">₹{calculatedSubtotal.toLocaleString()}</dd>
              </div>
              
              {/* 🌟 DYNAMIC GST CALCULATION DISPLAY */}
              <div className="flex justify-between items-start">
                <dt className="font-light tracking-wide flex flex-col text-left">
                  <span>Estimated GST</span>
                  <span className="text-[7px] sm:text-[8px] text-neutral-400 mt-1 uppercase tracking-[0.15em] font-bold">
                    (5% OR 18% APPLIED PER PIECE)
                  </span>
                </dt>
                <dd className="text-neutral-900 font-medium">₹{finalGST.toLocaleString()}</dd>
              </div>

              <div className="flex justify-between items-center">
                <dt className="font-light tracking-wide">Shipping</dt>
                <dd className="text-neutral-400 italic text-[9px] sm:text-[10px] uppercase tracking-widest font-medium">Complimentary</dd>
              </div>
              
              <div className="flex justify-between pt-5 sm:pt-6 border-t border-neutral-200 items-end mt-5 sm:mt-6">
                <dt className="text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase text-neutral-900">Total Paid</dt>
                <dd className="text-2xl sm:text-3xl font-light tracking-tight text-neutral-900 leading-none">₹{order.totalAmount?.toLocaleString()}</dd>
              </div>
            </dl>
          </div>
        </div>

      </div>

      {/* ========================================================
          REQUEST RETURN MODAL (Item Specific)
          ======================================================== */}
      {itemToReturn && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 transition-opacity duration-500">
          <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm" onClick={() => !submittingReturn && setItemToReturn(null)}></div>
          
          <div className="bg-white w-full max-w-lg shadow-2xl relative transform animate-[fade-in-up_0.4s_ease-out_forwards] rounded-sm text-left">
            
            <div className="p-5 sm:p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
              <h3 className="text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase text-neutral-900">Request Return</h3>
              <button onClick={() => !submittingReturn && setItemToReturn(null)} className="text-neutral-400 hover:text-neutral-900 p-1 active:scale-95 transition-transform">
                <X className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>

            <form onSubmit={handleReturnSubmit} className="p-6 sm:p-8 space-y-6 sm:space-y-8">
              
              <div className="flex items-center gap-4 bg-neutral-50/50 p-4 border border-neutral-100 rounded-sm">
                 <div className="w-14 h-20 sm:w-16 sm:h-24 bg-neutral-200 shrink-0 border border-neutral-100">
                    <img src={itemToReturn.productId?.mainimage1 || itemToReturn.productId?.image2} className="w-full h-full object-cover" alt="item" />
                 </div>
                 <div className="flex-1">
                   <p className="text-xs sm:text-sm font-medium text-neutral-900 line-clamp-2 leading-relaxed">{itemToReturn.productId?.title}</p>
                   <p className="text-[9px] sm:text-[10px] text-neutral-500 mt-2 uppercase tracking-[0.2em] font-bold">Qty: {itemToReturn.quantity}</p>
                 </div>
              </div>

              <div className="relative group">
                <label className="block text-[9px] sm:text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-500 mb-3 sm:mb-4 text-left">Select Reason</label>
                <div className="relative border-b border-neutral-300 hover:border-neutral-900 transition-colors">
                  <select 
                    value={returnReason} 
                    onChange={(e) => setReturnReason(e.target.value)}
                    required
                    className="appearance-none w-full bg-transparent py-3 text-sm font-light text-neutral-900 focus:outline-none cursor-pointer"
                  >
                    <option value="" disabled>Choose a reason...</option>
                    <option value="Sizing issue - Too small">Sizing issue - Too small</option>
                    <option value="Sizing issue - Too large">Sizing issue - Too large</option>
                    <option value="Defective or damaged piece">Defective or damaged piece</option>
                    <option value="Item not as described">Item not as described</option>
                    <option value="Changed my mind">Changed my mind</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-neutral-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button 
                  type="button" 
                  onClick={() => !submittingReturn && setItemToReturn(null)} 
                  className="w-full sm:w-1/2 border border-neutral-300 bg-white text-neutral-900 py-4 sm:py-4.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-neutral-50 active:scale-[0.98] transition-all rounded-sm flex items-center justify-center"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submittingReturn}
                  className="group/btn relative overflow-hidden w-full sm:w-1/2 bg-neutral-950 border border-neutral-950 text-white py-4 sm:py-4.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed rounded-sm flex items-center justify-center"
                >
                  <span className="relative z-10 transition-colors duration-500 group-hover/btn:text-white">
                    {submittingReturn ? "Submitting..." : "Submit Request"}
                  </span>
                  {!submittingReturn && <div className="absolute inset-0 h-full w-full scale-x-0 bg-neutral-800 transition-transform duration-500 ease-[0.25,1,0.5,1] group-hover/btn:scale-x-100 origin-left"></div>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          🌟 REVIEW MODAL WITH IMAGE UPLOAD
          ======================================================== */}
      {itemToReview && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 transition-opacity duration-500">
          <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm" onClick={closeReviewModal}></div>
          
          <div className="bg-white w-full max-w-xl shadow-2xl relative transform animate-[fade-in-up_0.4s_ease-out_forwards] rounded-sm text-left">
            <div className="p-5 sm:p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
              <h3 className="text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase text-neutral-900">Share Your Experience</h3>
              <button onClick={closeReviewModal} className="text-neutral-400 hover:text-neutral-900 p-1 active:scale-95 transition-transform"><X className="w-5 h-5 stroke-[1.5]" /></button>
            </div>

            <form onSubmit={handleReviewSubmit} className="p-6 sm:p-8 space-y-6 sm:space-y-8 max-h-[80vh] overflow-y-auto no-scrollbar">
              
              <div className="flex items-center gap-4 sm:gap-5 bg-neutral-50/50 p-4 sm:p-5 border border-neutral-100 rounded-sm">
                 <div className="w-14 h-20 sm:w-16 sm:h-24 bg-neutral-200 shrink-0 border border-neutral-100">
                    <img src={itemToReview.productId?.mainimage1 || itemToReview.productId?.image2} className="w-full h-full object-cover" alt="item" />
                 </div>
                 <div>
                   <p className="text-xs sm:text-sm font-medium text-neutral-900 leading-relaxed line-clamp-2">{itemToReview.productId?.title}</p>
                 </div>
              </div>

              {/* RATING */}
              <div>
                <label className="block text-[9px] sm:text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-500 mb-3 sm:mb-4 text-left">Rating</label>
                <div className="flex gap-2.5 sm:gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button type="button" key={star} onClick={() => setReviewRating(star)} className="focus:outline-none transition-transform hover:scale-110 active:scale-95 flex items-center justify-center">
                      <Star className={`w-8 h-8 sm:w-9 sm:h-9 ${star <= reviewRating ? "fill-emerald-600 text-emerald-600" : "fill-neutral-100 text-neutral-200"}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* COMMENT */}
              <div>
                <label className="block text-[9px] sm:text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-500 mb-3 sm:mb-4 text-left">Your Thoughts</label>
                <textarea
                  rows="4"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="How was the fit, quality, and style?"
                  className="w-full bg-white border border-neutral-200 p-4 sm:p-5 text-sm font-light tracking-wide text-neutral-900 focus:outline-none focus:border-neutral-900 resize-none transition-colors shadow-sm placeholder:text-neutral-400"
                  required
                ></textarea>
              </div>

              {/* IMAGE UPLOAD SECTION */}
              <div>
                <label className="block text-[9px] sm:text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-500 mb-3 sm:mb-4 text-left">Add Photos (Max 4)</label>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
                  {/* Hidden File Input */}
                  <input type="file" ref={fileInputRef} onChange={handleLocalImageUpload} accept="image/*" multiple className="hidden" />
                  
                  {/* Upload Local Button */}
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="flex-1 border border-dashed border-neutral-300 hover:border-neutral-900 hover:bg-neutral-50 text-neutral-600 flex items-center justify-center gap-2 py-3 sm:py-3.5 text-[9px] font-bold uppercase tracking-widest transition-colors rounded-sm active:scale-[0.98]">
                    <UploadCloud className="w-4 h-4 stroke-[1.5]" /> Browse Device
                  </button>

                  {/* Or Input Link */}
                  <div className="flex-1 flex border border-neutral-200 overflow-hidden focus-within:border-neutral-900 transition-colors rounded-sm shadow-sm">
                    <div className="pl-3 sm:pl-4 flex items-center justify-center text-neutral-400"><LinkIcon className="w-4 h-4 stroke-[1.5]" /></div>
                    <input 
                      type="url" 
                      value={imageUrlInput} 
                      onChange={(e) => setImageUrlInput(e.target.value)} 
                      placeholder="Paste image URL..." 
                      className="w-full py-3 px-3 text-xs font-light focus:outline-none placeholder:text-neutral-400"
                    />
                    <button type="button" onClick={handleAddImageUrl} className="bg-neutral-100 hover:bg-neutral-200 text-neutral-900 px-4 sm:px-5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center">Add</button>
                  </div>
                </div>

                {/* Previews */}
                {reviewImagePreviews.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-4">
                    {reviewImagePreviews.map((src, index) => (
                      <div key={index} className="relative w-20 h-20 sm:w-24 sm:h-24 border border-neutral-200 rounded-sm overflow-hidden group shadow-sm">
                        <img src={src} alt={`upload-${index}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <button type="button" onClick={() => removeImage(index)} className="absolute inset-0 bg-neutral-950/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                          <X className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-4 flex flex-col sm:flex-row gap-3 sm:gap-4 mt-auto">
                <button type="button" onClick={closeReviewModal} className="w-full sm:w-1/2 border border-neutral-300 text-neutral-900 py-4 sm:py-4.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-neutral-50 transition-all rounded-sm flex items-center justify-center active:scale-[0.98]">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submittingReview} 
                  className="group/btn relative overflow-hidden w-full sm:w-1/2 bg-neutral-950 border border-neutral-950 text-white py-4 sm:py-4.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] transition-all disabled:opacity-70 rounded-sm flex items-center justify-center active:scale-[0.98]"
                >
                  <span className="relative z-10 transition-colors duration-500 group-hover/btn:text-white">
                    {submittingReview ? "Publishing..." : "Publish Review"}
                  </span>
                  {!submittingReview && <div className="absolute inset-0 h-full w-full scale-x-0 bg-neutral-800 transition-transform duration-500 ease-[0.25,1,0.5,1] group-hover/btn:scale-x-100 origin-left"></div>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GLOBAL SCROLLBAR & ANIMATION CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; } 
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
      ` }} />
    </div>
  );
}