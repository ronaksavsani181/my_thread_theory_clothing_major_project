import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { Star, UploadCloud, Link as LinkIcon, X, CheckCircle } from "lucide-react";

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

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

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const fetchOrder = async () => {
    try {
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
      setTimeout(() => navigate("/my-returns"), 2500);
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

      showToast("Review published successfully!");
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 animate-pulse">Retrieving Records...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center bg-white px-6 text-center font-sans">
        <svg className="w-12 h-12 text-neutral-200 mb-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <h2 className="text-2xl font-light tracking-wide text-neutral-900 mb-4 uppercase">Order Not Found</h2>
        <Link to="/orders" className="group relative border border-neutral-950 bg-white text-neutral-950 px-12 py-4 text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-neutral-900 hover:text-white transition-colors">
          Return to History
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen font-sans pb-32 relative selection:bg-neutral-200">
      
      {/* LUXURY TOAST NOTIFICATION */}
      <div className={`fixed left-1/2 top-24 z-[100] flex w-[90%] max-w-sm -translate-x-1/2 transform items-center justify-center gap-3 rounded-sm p-4 shadow-2xl transition-all duration-500 pointer-events-none ${toast.show ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"} ${toast.type === "error" ? "bg-white border-l-4 border-red-500 text-neutral-800" : "bg-neutral-950 text-white"}`}>
        <p className={`text-[10px] font-bold tracking-[0.25em] uppercase text-center ${toast.type === "error" ? "text-neutral-700" : "text-neutral-200"}`}>{toast.message}</p>
      </div>

      {/* RETURN SUCCESS POPUP */}
      <div className={`fixed inset-0 z-[150] flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md transition-all duration-500 ${returnSuccess ? "opacity-100 visible" : "opacity-0 invisible"}`}>
         <div className={`bg-white p-10 text-center max-w-sm w-full shadow-2xl transform transition-transform duration-500 ${returnSuccess ? "scale-100 translate-y-0" : "scale-95 translate-y-8"}`}>
            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
               <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-light uppercase tracking-wide mb-2 text-neutral-900">Return Placed</h2>
            <p className="text-xs text-neutral-500 mb-8 font-light tracking-wide">Your return is currently in processing. Our team will review it shortly.</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 animate-pulse">Redirecting...</p>
         </div>
      </div>

      <div className="max-w-[70rem] mx-auto px-5 sm:px-8 lg:px-12 pt-28 sm:pt-36">
        
        <Link to="/orders" className="inline-flex items-center gap-3 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 hover:text-neutral-900 transition-colors mb-12 sm:mb-16 group">
          <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg> Back to Orders
        </Link>

        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-neutral-200 pb-10 sm:pb-12 mb-12 sm:mb-16 gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wide uppercase text-neutral-900 mb-3 sm:mb-4">
              Order <span className="font-medium tracking-widest text-2xl sm:text-3xl text-neutral-500">#{order._id.slice(-6).toUpperCase()}</span>
            </h1>
            <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400">Placed on {formatDate(order.createdAt)}</p>
          </div>
          
          <div className="flex flex-wrap gap-8 sm:gap-12">
            <div className="flex flex-col">
              <span className="text-[8px] sm:text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 mb-2 sm:mb-3">Payment</span>
              <span className="text-[10px] sm:text-xs font-bold text-neutral-900 uppercase tracking-[0.2em]">{order.paymentStatus || "PAID"}</span>
            </div>
            <div className="w-px bg-neutral-200"></div>
            <div className="flex flex-col">
              <span className="text-[8px] sm:text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 mb-2 sm:mb-3">Status</span>
              <div className="flex items-center gap-2.5">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${order.orderStatus === 'Delivered' ? 'bg-emerald-500' : order.orderStatus === 'Cancelled' || order.orderStatus === 'Returned' ? 'bg-red-500' : order.orderStatus === 'Return Requested' ? 'bg-amber-500 animate-pulse' : 'bg-neutral-900'}`}></span>
                <span className="text-[10px] sm:text-xs font-bold text-neutral-900 uppercase tracking-[0.2em]">{order.orderStatus || "PROCESSING"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* INVOICE DETAILS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 mb-16 sm:mb-24">
          <div className="bg-neutral-50/50 border border-neutral-100 p-6 sm:p-8 lg:p-12">
            <h2 className="text-[9px] sm:text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-900 mb-6 sm:mb-8 border-b border-neutral-200 pb-4">Order Summary</h2>
            <div className="space-y-4 sm:space-y-6 text-xs sm:text-sm font-light text-neutral-600 tracking-wide">
              <div className="flex justify-between items-center"><span>Reference</span><span className="text-neutral-900 font-medium tracking-widest">{order._id.slice(-8).toUpperCase()}</span></div>
              <div className="flex justify-between items-center"><span>Date</span><span className="text-neutral-900 font-medium">{new Date(order.createdAt).toLocaleDateString()}</span></div>
              <div className="flex justify-between items-center"><span>Total Items</span><span className="text-neutral-900 font-medium">{order.products?.length || 0}</span></div>
            </div>
          </div>

          {order.shippingAddress && (
            <div className="bg-neutral-50/50 border border-neutral-100 p-6 sm:p-8 lg:p-12">
              <h2 className="text-[9px] sm:text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-900 mb-6 sm:mb-8 border-b border-neutral-200 pb-4">Delivery Address</h2>
              <div className="text-xs sm:text-sm font-light text-neutral-600 tracking-wide leading-relaxed">
                <p className="text-neutral-900 font-medium mb-2">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.addressLine}</p>
                <p>{order.shippingAddress.city} - {order.shippingAddress.pincode}</p>
                <p className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-neutral-200 text-[10px] sm:text-xs">Tel: <span className="font-medium text-neutral-900">{order.shippingAddress.phone}</span></p>
              </div>
            </div>
          )}
        </div>

        {/* ITEMIZED LIST WITH INLINE ACTION BUTTONS */}
        <div className="mb-16 sm:mb-24">
          <h2 className="text-xl sm:text-2xl font-light tracking-wide uppercase text-neutral-900 mb-8 sm:mb-10">Purchased Pieces</h2>
          
          <div className="border-t border-neutral-200">
            {order.products.map((item, index) => {
              const productData = item.productId || {};
              const imageUrl = productData.image || productData.mainimage1 || productData.image2 || null;
              const productTitle = productData.title || "Archived Product";

              return (
                <div key={index} className="flex flex-col sm:flex-row py-8 sm:py-10 lg:py-12 border-b border-neutral-200 group">
                  
                  {/* Image */}
                  <div className="flex-shrink-0 w-24 h-36 sm:w-28 sm:h-40 lg:w-32 lg:h-48 bg-neutral-100 overflow-hidden relative border border-neutral-100 mb-6 sm:mb-0">
                    {imageUrl ? <img src={imageUrl} alt={productTitle} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105" /> : <div className="w-full h-full bg-neutral-200"></div>}
                  </div>
                  
                  {/* Info */}
                  <div className="sm:ml-8 lg:ml-12 flex-1 flex flex-col justify-between">
                    <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-6">
                      
                      <div>
                        <p className="text-[7px] sm:text-[8px] font-bold tracking-[0.25em] uppercase text-neutral-400 mb-2">{productData.category || "Thread Theory"}</p>
                        <h3 className="text-sm sm:text-base font-light tracking-wide text-neutral-900 leading-snug">
                          {productData._id ? <Link to={`/products/${productData._id}`} className="hover:text-neutral-500 transition-colors">{productTitle}</Link> : <span>{productTitle}</span>}
                        </h3>
                        <p className="mt-3 sm:mt-4 text-[9px] sm:text-[10px] text-neutral-500 uppercase tracking-[0.2em]">Qty: <span className="font-bold text-neutral-900">{item.quantity}</span></p>
                        <p className="text-[10px] sm:text-xs text-neutral-400 font-light tracking-wide mt-2">₹{item.price.toLocaleString()} each</p>
                      </div>
                      
                      <div className="flex flex-col items-start sm:items-end justify-between gap-4">
                        <p className="text-base font-medium tracking-wide text-neutral-900 sm:text-right">₹{(item.price * item.quantity).toLocaleString()}</p>
                        
                        {/* 🌟 ACTION BUTTONS (RETURN + REVIEW) */}
                        {order.orderStatus === "Delivered" && (
                          <div className="flex flex-col sm:flex-row gap-3 mt-auto w-full sm:w-auto">
                            
                            <button 
                              onClick={() => setItemToReturn(item)}
                              className="group/btn relative overflow-hidden border border-neutral-900 bg-transparent text-neutral-900 px-6 sm:px-8 py-2.5 sm:py-3 text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-500 hover:text-white"
                            >
                              <span className="relative z-10">Return Item</span>
                              <div className="absolute inset-0 h-full w-full scale-x-0 bg-neutral-900 transition-transform duration-500 ease-[0.25,1,0.5,1] group-hover/btn:scale-x-100 origin-left"></div>
                            </button>

                            <button 
                              onClick={() => setItemToReview(item)}
                              className="group/btn2 relative overflow-hidden border border-neutral-900 bg-neutral-950 text-white px-6 sm:px-8 py-2.5 sm:py-3 text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-500 hover:text-neutral-900"
                            >
                              <span className="relative z-10">Write Review</span>
                              <div className="absolute inset-0 h-full w-full scale-x-0 bg-white transition-transform duration-500 ease-[0.25,1,0.5,1] group-hover/btn2:scale-x-100 origin-left"></div>
                            </button>

                          </div>
                        )}
                        {(order.orderStatus === "Return Requested" || order.orderStatus === "Returned") && (
                          <Link 
                            to="/my-returns"
                            className="text-[9px] font-bold uppercase tracking-[0.2em] text-red-600 hover:text-red-700 transition-colors border-b border-transparent hover:border-red-600 pb-0.5 mt-auto"
                          >
                            Return Details
                          </Link>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TOTALS CALCULATION */}
        <div className="flex justify-end">
          <div className="w-full sm:w-[70%] lg:w-[45%] bg-neutral-50/50 border border-neutral-100 p-6 sm:p-8 lg:p-12">
            <dl className="space-y-4 sm:space-y-6 text-xs sm:text-sm font-light text-neutral-600 tracking-wide">
              <div className="flex justify-between pb-4 sm:pb-6 border-b border-neutral-200">
                <dt className="uppercase text-[9px] sm:text-[10px] font-bold tracking-[0.25em] text-neutral-500">Subtotal</dt>
                <dd className="text-neutral-900 font-medium">₹{order.totalAmount?.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between pb-4 sm:pb-6 border-b border-neutral-200">
                <dt className="uppercase text-[9px] sm:text-[10px] font-bold tracking-[0.25em] text-neutral-500">Shipping</dt>
                <dd className="text-neutral-900 uppercase text-[8px] sm:text-[10px] font-bold tracking-[0.25em]">Complimentary</dd>
              </div>
              <div className="flex justify-between pt-2 sm:pt-4 items-end">
                <dt className="text-[9px] sm:text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-900">Total</dt>
                <dd className="text-2xl sm:text-3xl font-light tracking-tight text-neutral-900">₹{order.totalAmount?.toLocaleString()}</dd>
              </div>
            </dl>
          </div>
        </div>

      </div>

      {/* ========================================================
          REQUEST RETURN MODAL (Item Specific)
          ======================================================== */}
      <div className={`fixed inset-0 z-[120] flex items-center justify-center p-4 transition-all duration-500 ${itemToReturn ? "opacity-100 visible" : "opacity-0 invisible"}`}>
        <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm" onClick={() => !submittingReturn && setItemToReturn(null)}></div>
        
        <div className={`bg-white w-full max-w-lg shadow-2xl relative transform transition-transform duration-500 rounded-sm ${itemToReturn ? "scale-100 translate-y-0" : "scale-95 translate-y-8"}`}>
          
          <div className="p-5 sm:p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
            <h3 className="text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase text-neutral-900">Request Return</h3>
            <button onClick={() => !submittingReturn && setItemToReturn(null)} className="text-neutral-400 hover:text-neutral-900 p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {itemToReturn && (
            <form onSubmit={handleReturnSubmit} className="p-6 sm:p-8 space-y-6 sm:space-y-8">
              
              <div className="flex items-center gap-4 bg-neutral-50/50 p-4 border border-neutral-100 rounded-sm">
                 <div className="w-12 h-16 bg-neutral-200 shrink-0">
                    <img src={itemToReturn.productId?.mainimage1 || itemToReturn.productId?.image2} className="w-full h-full object-cover" alt="item" />
                 </div>
                 <div>
                   <p className="text-xs font-medium text-neutral-900 line-clamp-2">{itemToReturn.productId?.title}</p>
                   <p className="text-[9px] text-neutral-500 mt-1 uppercase tracking-widest">Qty: {itemToReturn.quantity}</p>
                 </div>
              </div>

              <div className="relative group">
                <label className="block text-[8px] sm:text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 mb-3">Select Reason</label>
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
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3 sm:gap-4">
                <button 
                  type="button" 
                  onClick={() => !submittingReturn && setItemToReturn(null)} 
                  className="w-full border border-neutral-300 bg-white text-neutral-900 py-3.5 sm:py-4 text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-50 active:scale-[0.98] transition-all rounded-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submittingReturn}
                  className="w-full bg-neutral-950 text-white py-3.5 sm:py-4 text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed rounded-sm"
                >
                  {submittingReturn ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ========================================================
          🌟 REVIEW MODAL WITH IMAGE UPLOAD
          ======================================================== */}
      <div className={`fixed inset-0 z-[120] flex items-center justify-center p-4 transition-all duration-500 ${itemToReview ? "opacity-100 visible" : "opacity-0 invisible"}`}>
        <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm" onClick={closeReviewModal}></div>
        
        <div className={`bg-white w-full max-w-xl shadow-2xl relative transform transition-transform duration-500 rounded-sm ${itemToReview ? "scale-100 translate-y-0" : "scale-95 translate-y-8"}`}>
          <div className="p-5 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
            <h3 className="text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-900">Share Your Experience</h3>
            <button onClick={closeReviewModal} className="text-neutral-400 hover:text-neutral-900 p-1"><X className="w-5 h-5" /></button>
          </div>

          {itemToReview && (
            <form onSubmit={handleReviewSubmit} className="p-6 space-y-6 max-h-[85vh] overflow-y-auto">
              
              <div className="flex items-center gap-4 bg-neutral-50/50 p-4 border border-neutral-100 rounded-sm">
                 <div className="w-12 h-16 bg-neutral-200 shrink-0">
                    <img src={itemToReview.productId?.mainimage1 || itemToReview.productId?.image2} className="w-full h-full object-cover" alt="item" />
                 </div>
                 <div>
                   <p className="text-xs font-medium text-neutral-900">{itemToReview.productId?.title}</p>
                 </div>
              </div>

              {/* RATING */}
              <div>
                <label className="block text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 mb-3">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button type="button" key={star} onClick={() => setReviewRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                      <Star className={`w-7 h-7 ${star <= reviewRating ? "fill-yellow-400 text-yellow-400" : "fill-neutral-100 text-neutral-200"}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* COMMENT */}
              <div>
                <label className="block text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 mb-3">Your Thoughts</label>
                <textarea
                  rows="4"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="How was the fit, quality, and style?"
                  className="w-full bg-white border border-neutral-200 p-4 text-sm font-light tracking-wide text-neutral-900 focus:outline-none focus:border-neutral-900 resize-none transition-colors"
                  required
                ></textarea>
              </div>

              {/* IMAGE UPLOAD SECTION */}
              <div>
                <label className="block text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 mb-3">Add Photos (Max 4)</label>
                
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  {/* Hidden File Input */}
                  <input type="file" ref={fileInputRef} onChange={handleLocalImageUpload} accept="image/*" multiple className="hidden" />
                  
                  {/* Upload Local Button */}
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="flex-1 border border-dashed border-neutral-300 hover:border-neutral-900 hover:bg-neutral-50 text-neutral-600 flex items-center justify-center gap-2 py-3 text-[9px] font-bold uppercase tracking-widest transition-colors">
                    <UploadCloud className="w-4 h-4" /> Browse Device
                  </button>

                  {/* Or Input Link */}
                  <div className="flex-1 flex border border-neutral-200 overflow-hidden focus-within:border-neutral-900 transition-colors">
                    <div className="pl-3 flex items-center justify-center text-neutral-400"><LinkIcon className="w-4 h-4" /></div>
                    <input 
                      type="url" 
                      value={imageUrlInput} 
                      onChange={(e) => setImageUrlInput(e.target.value)} 
                      placeholder="Paste image URL..." 
                      className="w-full py-3 px-3 text-xs font-light focus:outline-none"
                    />
                    <button type="button" onClick={handleAddImageUrl} className="bg-neutral-100 hover:bg-neutral-200 text-neutral-900 px-4 text-[9px] font-bold uppercase tracking-widest transition-colors">Add</button>
                  </div>
                </div>

                {/* Previews */}
                {reviewImagePreviews.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-4">
                    {reviewImagePreviews.map((src, index) => (
                      <div key={index} className="relative w-20 h-20 border border-neutral-200 rounded-sm overflow-hidden group">
                        <img src={src} alt={`upload-${index}`} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeImage(index)} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={closeReviewModal} className="w-full border border-neutral-300 text-neutral-900 py-3.5 text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-50 transition-all rounded-sm">
                  Cancel
                </button>
                <button type="submit" disabled={submittingReview} className="w-full bg-neutral-950 text-white py-3.5 text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all disabled:opacity-70 rounded-sm">
                  {submittingReview ? "Publishing..." : "Publish Review"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

    </div>
  );
}