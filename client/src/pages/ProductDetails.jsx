import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/useAuth";
import { useCart } from "../context/useCart";
import { useWishlist } from "../context/useWishlist";
// 🌟 FIX: Added AlertTriangle and CheckCircle2 to the imports
import { Star, Truck, ShieldCheck, Heart, X, Ruler, ThumbsUp, User, ArrowRight, ChevronRight, ChevronLeft, AlertTriangle, CheckCircle2 } from "lucide-react";
import VisualTryOnButton from "../components/VisualTryOnButton.jsx";
import TryOnModal from "../components/TempFolder/TryOnModal.jsx";
import ProductCard from "../components/ProductCard.jsx";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // 🌟 Safe Context Destructuring (Prevents crashes if contexts aren't wrapped)
  const authContext = useAuth() || {};
  const user = authContext.user;
  
  const cartContext = useCart() || {};
  const addToCart = cartContext.addToCart;
  
  const wishlistContext = useWishlist() || {};
  const addToWishlist = wishlistContext.addToWishlist;
  const removeFromWishlist = wishlistContext.removeFromWishlist;
  const isInWishlist = wishlistContext.isInWishlist;

  // 🌟 Core States
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [productError, setProductError] = useState(false);
  
  const [selectedSize, setSelectedSize] = useState("");
  const [activeImage, setActiveImage] = useState("");
  const [isFading, setIsFading] = useState(false); 

  // 🌟 UI States
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const timerRef = useRef(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // 🌟 Review States
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [eligibilityMessage, setEligibilityMessage] = useState("Checking eligibility...");
  const [currentReviewPage, setCurrentReviewPage] = useState(1);
  const REVIEWS_PER_PAGE = 10;

  // 🌟 Related Products State
  const [relatedProducts, setRelatedProducts] = useState([]);

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

  /* ---------------- 1. FETCH PRODUCT DATA (BULLETPROOF) ---------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsRedirecting(false);
        setLoading(true);
        setProductError(false);
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
        
        const [prodRes, revRes, allProductsRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/reviews/${id}`).catch(() => ({ data: { reviews: [], averageRating: 0 } })),
          api.get(`/products`).catch(() => ({ data: [] }))
        ]);
        
        const currentProduct = prodRes.data;
        if (!currentProduct) throw new Error("Product not found");

        setProduct(currentProduct);
        
        // Safely set initial image
        if (currentProduct.mainimage1) setActiveImage(currentProduct.mainimage1);
        else if (currentProduct.image) setActiveImage(currentProduct.image);
        else setActiveImage("https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop");
        
        setReviews(Array.isArray(revRes.data?.reviews) ? revRes.data.reviews : []);
        setAvgRating(Number(revRes.data?.averageRating || 0));

        // Safely filter related products
        const allProds = Array.isArray(allProductsRes.data) ? allProductsRes.data : [];
        const related = allProds.filter(
          (p) => p._id !== id && (p.category === currentProduct.category || p.brand === currentProduct.brand)
        );
        setRelatedProducts(related.slice(0, 4)); 

        // Check Review Eligibility
        if (user) {
          try {
            const eligRes = await api.get(`/orders/eligibility/${id}`);
            setCanReview(eligRes.data?.eligible || false);
            setEligibilityMessage(eligRes.data?.message || "You can write a review.");
          } catch (error) {
            setCanReview(false);
            setEligibilityMessage("Only verified buyers can review this piece.");
          }
        } else {
          setEligibilityMessage("Please log in to review your purchases.");
        }

      } catch (error) {
        console.error("Error loading product:", error);
        setProductError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  // Lock body scroll when modal open
  useEffect(() => {
    if (isSizeGuideOpen || isTryOnOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isSizeGuideOpen, isTryOnOpen]);

  /* ---------------- 2. CALCULATE REVIEW DISTRIBUTION ---------------- */
  const reviewDistribution = useMemo(() => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    (reviews || []).forEach(r => { if (r && dist[r.rating] !== undefined) dist[r.rating]++; });
    return dist;
  }, [reviews]);

  const totalReviewPages = Math.ceil((reviews?.length || 0) / REVIEWS_PER_PAGE);
  const paginatedReviews = (reviews || []).slice(
    (currentReviewPage - 1) * REVIEWS_PER_PAGE,
    currentReviewPage * REVIEWS_PER_PAGE
  );

  const handlePageChange = (newPage) => {
    setCurrentReviewPage(newPage);
    document.getElementById("reviews-section")?.scrollIntoView({ behavior: "smooth" });
  };

  /* ---------------- 3. SUBMIT REVIEW HANDLER ---------------- */
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      showToast("Review cannot be empty.", "error");
      return;
    }
    setIsSubmittingReview(true);
    try {
      await api.post(`/reviews/${id}`, { rating, comment });
      setComment("");
      setRating(5);
      
      const res = await api.get(`/reviews/${id}`);
      setReviews(Array.isArray(res.data?.reviews) ? res.data.reviews : []);
      setAvgRating(Number(res.data?.averageRating || 0));
      
      showToast("Review submitted successfully.");
      setCanReview(false); 
      setEligibilityMessage("Thank you! You have successfully reviewed this piece.");
      setCurrentReviewPage(1); 
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to submit review.", "error");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  /* ====================================================================
     🚨 CRITICAL RENDER GUARDS (Prevents White Screen of Death) 🚨
     Do not move derived variables above these return statements!
     ==================================================================== */
  
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white text-center">
        <div className="flex flex-col items-center gap-4">
           <svg className="animate-spin h-6 w-6 text-neutral-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
           <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-neutral-400">
            Curating Details...
          </p>
        </div>
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-neutral-50 text-center px-6">
        <h2 className="text-2xl sm:text-3xl font-light uppercase tracking-wide text-neutral-900 mb-4">Piece Not Found</h2>
        <p className="text-sm font-light text-neutral-500 mb-8 max-w-sm">This item may have been removed or the link is incorrect.</p>
        <Link to="/products" className="border border-neutral-900 bg-white text-neutral-900 px-8 py-3.5 text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-neutral-900 hover:text-white transition-all active:scale-95">
          Return to Collection
        </Link>
      </div>
    );
  }

  /* ---------------- 4. SAFE DERIVED DATA (Guaranteed Product is Loaded) ---------------- */
  
  const wishlisted = typeof isInWishlist === 'function' ? isInWishlist(product._id) : false;
  const availableSizes = Array.isArray(product.sizesAvailable) ? product.sizesAvailable : [];
  const has3DModel = typeof product.model3Durl === 'string' && product.model3Durl.trim() !== "";

  // Safe Gallery Logic
  const rawImages = [product.mainimage1, product.image, product.image2, product.image3, product.image4];
  const galleryImages = rawImages.filter((img) => typeof img === 'string' && img.trim() !== "");
  const activeIndex = galleryImages.indexOf(activeImage);
  const displayImage = activeImage || galleryImages[0] || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop";

  const changeImage = (img) => {
    if (img === activeImage) return;
    setIsFading(true);
    setTimeout(() => {
      setActiveImage(img);
      setIsFading(false);
    }, 150); 
  };

  const handlePrevImage = () => {
    if (galleryImages.length <= 1) return;
    changeImage(galleryImages[activeIndex <= 0 ? galleryImages.length - 1 : activeIndex - 1]);
  };

  const handleNextImage = () => {
    if (galleryImages.length <= 1) return;
    changeImage(galleryImages[activeIndex === galleryImages.length - 1 ? 0 : activeIndex + 1]);
  };

  /* ---------------- 5. SAFE ACTIONS ---------------- */
  const handleAddToCart = () => {
    if (availableSizes.length > 0 && !selectedSize) {
      showToast("Please select a size.", "error");
      return;
    }
    if (typeof addToCart === 'function') {
      addToCart(product, selectedSize);
      showToast("Added to your bag.");
    }
  };

  const handleAddToWishlist = () => {
    if (wishlisted) {
      if (typeof removeFromWishlist === 'function') removeFromWishlist(product._id);
      showToast("Removed from wishlist", "success");
    } else {
      if (typeof addToWishlist === 'function') addToWishlist(product);
      showToast("Saved to wishlist", "success");
    }
  };

  return (
    <div className={`bg-white min-h-[100dvh] font-sans relative pb-32 selection:bg-neutral-200 overflow-hidden transition-opacity duration-700 ease-[0.25,1,0.5,1] ${isRedirecting ? 'opacity-50' : 'opacity-100'}`}>
      
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

      <div className="max-w-[100rem] mx-auto px-0 sm:px-8 lg:px-12 pt-20 lg:pt-32">
        
        {/* BREADCRUMBS */}
        <nav className="hidden sm:flex items-center mt-10 mb-10 text-[9px] sm:text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-400 animate-[fade-in-up_0.6s_ease-out_forwards] opacity-0 px-5 sm:px-0">
          <button onClick={(e) => handleRedirect(e, '/')} className="hover:text-neutral-900 transition-colors">Home</button>
          <span className="mx-3">/</span>
          <button onClick={(e) => handleRedirect(e, '/products')} className="hover:text-neutral-900 transition-colors">Collection</button>
          <span className="mx-3">/</span>
          <span className="text-neutral-900">{product.category || "Piece"}</span>
        </nav>

        {/* =========================================
            TOP SECTION: GALLERY & DETAILS
            ========================================= */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 xl:gap-24 mb-24 lg:mb-40 items-start">
          
          {/* 🖼️ INTERACTIVE GALLERY */}
          <div className="w-full lg:w-[60%] flex flex-col-reverse lg:flex-row gap-3 sm:gap-4 lg:gap-6 opacity-0 animate-[fade-in-up_0.8s_ease-out_forwards]">
            
            {/* THUMBNAILS */}
            {galleryImages.length > 1 && (
              <div className="flex lg:flex-col gap-2.5 sm:gap-4 overflow-x-auto lg:overflow-y-auto no-scrollbar lg:w-20 xl:w-24 shrink-0 px-5 sm:px-0 pb-2 lg:pb-0">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => changeImage(img)}
                    className={`relative w-16 h-20 sm:w-20 sm:h-28 lg:w-full lg:h-32 xl:h-36 shrink-0 bg-neutral-100 overflow-hidden transition-all duration-300 flex items-center justify-center ${
                      activeImage === img ? "border border-neutral-900 opacity-100" : "border border-transparent opacity-50 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover object-center" />
                  </button>
                ))}
              </div>
            )}

            {/* MAIN IMAGE VIEWPORT */}
            <div className="flex-1 bg-neutral-50 aspect-[3/4] sm:aspect-[4/5] relative overflow-hidden group w-full cursor-crosshair">
              <img
                src={displayImage}
                alt={product.title || "Product Image"}
                className={`w-full h-full object-cover object-center transition-opacity duration-300 ${isFading ? 'opacity-50' : 'opacity-100'}`}
              />
              {galleryImages.length > 1 && (
                <>
                  <button onClick={handlePrevImage} className="absolute flex items-center justify-center left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md text-neutral-900 p-3 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-500 shadow-[0_5px_15px_rgba(0,0,0,0.1)] hover:scale-110 active:scale-95">
                    <ChevronLeft className="w-5 h-5 stroke-[1.5]" />
                  </button>
                  <button onClick={handleNextImage} className="absolute flex items-center justify-center right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md text-neutral-900 p-3 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-500 shadow-[0_5px_15px_rgba(0,0,0,0.1)] hover:scale-110 active:scale-95">
                    <ChevronRight className="w-5 h-5 stroke-[1.5]" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* 📝 PRODUCT DETAILS PANEL */}
          <div className="w-full lg:w-[40%] flex flex-col px-5 sm:px-0 lg:sticky lg:top-32 opacity-0 animate-[fade-in-up_0.8s_ease-out_0.2s_forwards]">
            
            <div className="mb-8 sm:mb-10 border-b border-neutral-200 pb-8 sm:pb-10 text-left">
              <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-400 mb-3 sm:mb-4">
                {product.brand || "Thread Theory"} • {product.category || "Apparel"}
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-wide uppercase text-neutral-900 mb-6 leading-[1.1]">
                {product.title}
              </h1>
              
              <div className="flex items-center justify-between">
                <p className="text-xl sm:text-2xl text-neutral-900 font-medium tracking-wide">
                  ₹{Number(product.price || 0).toLocaleString()}
                </p>
                {avgRating > 0 && (
                  <div className="flex items-center justify-center gap-2 bg-neutral-50 px-4 py-2 border border-neutral-100 rounded-sm">
                    <Star className="w-3.5 h-3.5 fill-emerald-700 text-emerald-700" />
                    <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-900 mt-0.5">
                      {Number(avgRating).toFixed(1)} <span className="text-neutral-400 font-light">({reviews.length})</span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-10 sm:mb-12 text-left">
              <p className="text-sm sm:text-base text-neutral-500 font-light leading-[1.8] tracking-wide">
                {product.description || "Expertly crafted with premium materials. This piece offers a flawless silhouette and uncompromising comfort, designed for the modern wardrobe."}
              </p>
            </div>

            {/* Size Selector */}
            {availableSizes.length > 0 && (
              <div className="mb-10 sm:mb-12">
                <div className="flex justify-between items-center mb-5">
                  <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-900">
                    Select Size
                  </span>
                  <button 
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="text-[9px] sm:text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-400 hover:text-neutral-900 transition-colors border-b border-transparent hover:border-neutral-900 pb-0.5 flex items-center justify-center gap-1.5"
                  >
                    <Ruler className="w-3.5 h-3.5 stroke-[1.5]" /> Size Guide
                  </button>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3.5 sm:py-4 flex items-center justify-center text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase transition-all border ${
                        selectedSize === size
                          ? "border-neutral-900 bg-neutral-900 text-white shadow-md"
                          : "border-neutral-200 bg-neutral-50 text-neutral-900 hover:border-neutral-900 hover:bg-white"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Call To Actions */}
            <div className="flex flex-col gap-4 mb-10 sm:mb-12">
              <button
                onClick={handleAddToCart}
                disabled={product.isOutOfStock}
                className={`group/btn relative overflow-hidden flex items-center justify-center w-full py-4.5 sm:py-5 text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase transition-all duration-500 active:scale-[0.98] border border-neutral-950 ${
                  product.isOutOfStock
                    ? "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed"
                    : "bg-neutral-950 text-white hover:text-white"
                }`}
              >
                <span className="relative z-10 transition-colors duration-500 text-center">
                  {product.isOutOfStock ? "Sold Out" : "Add To Bag"}
                </span>
                {!product.isOutOfStock && (
                  <div className="absolute inset-0 h-full w-full scale-y-0 bg-neutral-800 transition-transform duration-500 ease-[0.25,1,0.5,1] group-hover/btn:scale-y-100 origin-bottom"></div>
                )}
              </button>

              <button
                onClick={handleAddToWishlist}
                className={`group/btn relative overflow-hidden flex items-center justify-center w-full py-4 sm:py-4.5 text-[9px] sm:text-[10px] font-bold tracking-[0.25em] uppercase transition-all duration-500 border gap-3 active:scale-[0.98] ${
                  wishlisted
                    ? "border-neutral-200 bg-neutral-50 text-neutral-500"
                    : "border-neutral-200 text-neutral-900 hover:border-neutral-900"
                }`}
              >
                <span className="relative z-10 flex items-center justify-center gap-3 transition-colors duration-500">
                  <Heart className={`w-4 h-4 stroke-[1.5] ${wishlisted ? "fill-current text-red-500 stroke-red-500" : "group-hover/btn:text-white"}`} />
                  <span className={`text-center ${!wishlisted ? "group-hover/btn:text-white" : ""}`}>{wishlisted ? "Saved to Wishlist" : "Save To Wishlist"}</span>
                </span>
                {!wishlisted && (
                  <div className="absolute inset-0 h-full w-full scale-y-0 bg-neutral-900 transition-transform duration-500 ease-[0.25,1,0.5,1] group-hover/btn:scale-y-100 origin-bottom"></div>
                )}
              </button>

              {has3DModel && <VisualTryOnButton onClick={() => setIsTryOnOpen(true)} />}
            </div>

            {/* USPs */}
            <ul className="space-y-4 sm:space-y-5 pt-8 sm:pt-10 border-t border-neutral-100 text-[9px] sm:text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-500">
              <li className="flex items-center gap-4 text-left"><Truck className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-900 stroke-[1.5] shrink-0" /> Complimentary Express Delivery</li>
              <li className="flex items-center gap-4 text-left"><ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-900 stroke-[1.5] shrink-0" /> 14-Day Free Returns</li>
            </ul>
          </div>
        </div>

        {/* =========================================
            🌟 REVIEWS EDITORIAL SECTION 
            ========================================= */}
        <div id="reviews-section" className="border-t border-neutral-200 pt-20 sm:pt-28 px-5 sm:px-0 opacity-0 animate-[fade-in-up_0.8s_ease-out_0.4s_forwards]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-24">
            
            {/* LEFT: Distribution Summary & Reviews List */}
            <div className="lg:col-span-7 flex flex-col text-left">
              <h2 className="text-3xl sm:text-4xl font-light tracking-wide uppercase text-neutral-900 mb-8 sm:mb-12 text-left">
                Client Reviews
              </h2>
              
              {/* Premium Rating Distribution Block */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 sm:gap-10 bg-neutral-50 p-8 sm:p-10 mb-12 sm:mb-16 border border-neutral-100 rounded-sm">
                
                <div className="flex flex-col items-center sm:items-start border-b sm:border-b-0 sm:border-r border-neutral-200 pb-8 sm:pb-0 sm:pr-10 w-full sm:w-auto">
                  <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                    <span className="text-5xl sm:text-6xl font-medium text-emerald-700 tracking-tight leading-none">{Number(avgRating).toFixed(1)}</span>
                    <Star className="w-8 h-8 sm:w-10 sm:h-10 fill-emerald-700 text-emerald-700" />
                  </div>
                  <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.25em] text-neutral-400 mt-2 text-center sm:text-left uppercase w-full">
                    {reviews.length} Ratings<br/>{reviews.length} Reviews
                  </p>
                </div>
                
                <div className="flex-1 w-full flex flex-col gap-3.5 sm:gap-4">
                  {[
                    { star: 5, label: "Excellent", color: "bg-emerald-600" },
                    { star: 4, label: "Very Good", color: "bg-emerald-400" },
                    { star: 3, label: "Good", color: "bg-yellow-400" },
                    { star: 2, label: "Average", color: "bg-neutral-300" },
                    { star: 1, label: "Poor", color: "bg-red-400" }
                  ].map(({ star, label, color }) => {
                    const count = reviewDistribution[star];
                    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center justify-between gap-4 sm:gap-5 w-full">
                        <span className="text-[10px] sm:text-xs font-medium uppercase tracking-widest text-neutral-500 w-16 sm:w-20 shrink-0 text-left">{label}</span>
                        <div className="flex-1 h-1.5 sm:h-2 bg-neutral-200 rounded-full overflow-hidden">
                          <div className={`h-full ${color} rounded-full transition-all duration-1000 ease-[0.25,1,0.5,1]`} style={{ width: `${percentage}%` }}></div>
                        </div>
                        <span className="text-[10px] sm:text-xs font-bold text-neutral-400 w-6 text-right shrink-0">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Individual Reviews List */}
              <div className="flex flex-col gap-8 sm:gap-10">
                {reviews.length === 0 ? (
                  <div className="text-center py-16 bg-neutral-50 border border-neutral-100 rounded-sm">
                    <p className="text-sm font-light tracking-wide text-neutral-500 mb-2">No reviews yet.</p>
                    <p className="text-[10px] font-bold tracking-widest uppercase text-neutral-400">Be the first to share your thoughts.</p>
                  </div>
                ) : (
                  <>
                    {paginatedReviews.map((r, i) => (
                      <div key={i} className="py-6 sm:py-8 border-b border-neutral-100 last:border-0 group text-left">
                        
                        <div className="flex items-center justify-start gap-4 mb-5 sm:mb-6">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 border border-neutral-200 shrink-0">
                             <User className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5]" />
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-neutral-900 tracking-wide uppercase text-left">{r.user?.name || "Verified Buyer"}</p>
                            <div className="flex flex-wrap items-center justify-start gap-2 sm:gap-3 mt-1.5">
                              <div className="flex bg-emerald-600 px-2 py-0.5 rounded-sm items-center justify-center gap-1.5 shadow-sm">
                                <span className="text-[10px] text-white font-bold leading-none mt-0.5">{r.rating || 5}.0</span>
                                <Star className="w-2.5 h-2.5 text-white fill-white" />
                              </div>
                              <span className="text-neutral-300 text-[10px] hidden sm:inline">•</span>
                              <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.15em] text-neutral-400 uppercase text-left">Posted on {formatDate(r.createdAt)}</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm sm:text-base font-light tracking-wide text-neutral-600 leading-[1.8] mb-6 text-left">
                          {r.comment}
                        </p>

                        <div className="flex items-center justify-start gap-4">
                          <button className="flex items-center justify-center gap-1.5 text-[9px] sm:text-[10px] text-neutral-400 font-bold uppercase tracking-[0.2em] hover:text-neutral-900 transition-colors">
                            <ThumbsUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[1.5]" /> Helpful (0)
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Pagination Controls */}
                    {totalReviewPages > 1 && (
                      <div className="flex items-center justify-between pt-8 mt-6 border-t border-neutral-200">
                        <button 
                          onClick={() => handlePageChange(currentReviewPage - 1)}
                          disabled={currentReviewPage === 1}
                          className="flex items-center justify-center text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-500 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          &larr; Prev
                        </button>
                        
                        <div className="flex items-center justify-center gap-1 sm:gap-2">
                          {Array.from({ length: totalReviewPages }, (_, i) => i + 1).map(page => (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-[10px] sm:text-xs font-bold rounded-sm transition-colors ${currentReviewPage === page ? 'bg-neutral-900 text-white' : 'bg-transparent text-neutral-500 hover:bg-neutral-100'}`}
                            >
                              {page}
                            </button>
                          ))}
                        </div>

                        <button 
                          onClick={() => handlePageChange(currentReviewPage + 1)}
                          disabled={currentReviewPage === totalReviewPages}
                          className="flex items-center justify-center text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-500 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          Next &rarr;
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* RIGHT: Write a Review Form (Sticky) */}
            <div className="lg:col-span-5 relative mt-16 lg:mt-0">
               <div className="lg:sticky lg:top-32 bg-neutral-50 border border-neutral-100 p-8 sm:p-12 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] rounded-sm text-left">
                 <h3 className="text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase text-neutral-900 mb-8 sm:mb-10 border-b border-neutral-200 pb-4 text-left">
                   Write a Review
                 </h3>
                 
                 {!user ? (
                   <div className="text-center py-10 flex flex-col items-center">
                     <ShieldCheck className="w-10 h-10 text-neutral-300 mb-6 stroke-[1.5]" />
                     <p className="text-sm sm:text-base font-light tracking-wide text-neutral-500 mb-8 text-center">Sign in to share your experience with this piece.</p>
                     <button onClick={(e) => handleRedirect(e, '/login')} className="flex items-center justify-center border border-neutral-900 px-10 py-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors w-max mx-auto">
                       Sign In
                     </button>
                   </div>
                 ) : !canReview ? (
                   <div className="text-center py-10 bg-white border border-neutral-100 px-6 sm:px-8 rounded-sm shadow-sm flex flex-col items-center">
                     <ShieldCheck className="w-10 h-10 sm:w-12 sm:h-12 text-neutral-300 mb-6 stroke-[1.5]" />
                     <p className="text-sm sm:text-base font-medium tracking-wide text-neutral-800 mb-3 text-center">Verified Purchases Only</p>
                     <p className="text-xs sm:text-sm font-light tracking-wide text-neutral-500 leading-relaxed max-w-xs text-center">{eligibilityMessage}</p>
                     <div className="mt-8 w-full flex justify-center">
                        <button onClick={(e) => handleRedirect(e, '/orders')} className="flex items-center justify-center text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 hover:text-neutral-900 border-b border-neutral-300 hover:border-neutral-900 pb-0.5 transition-colors">
                          View My Orders
                        </button>
                     </div>
                   </div>
                 ) : (
                   <form onSubmit={handleSubmitReview} className="flex flex-col gap-6 sm:gap-8">
                     <div>
                       <label className="block text-[9px] sm:text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-500 mb-3 sm:mb-4 text-left">Rating</label>
                       <div className="flex items-center justify-start gap-3">
                         {[1, 2, 3, 4, 5].map((star) => (
                           <button
                             type="button"
                             key={star}
                             onClick={() => setRating(star)}
                             className="flex items-center justify-center focus:outline-none transition-transform hover:scale-110 active:scale-95"
                           >
                             <Star className={`w-8 h-8 sm:w-10 sm:h-10 ${star <= rating ? "fill-emerald-600 text-emerald-600" : "fill-neutral-200 text-neutral-200"}`} />
                           </button>
                         ))}
                       </div>
                     </div>

                     <div>
                       <label className="block text-[9px] sm:text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-500 mb-3 sm:mb-4 text-left">Your Thoughts</label>
                       <textarea
                         rows="5"
                         value={comment}
                         onChange={(e) => setComment(e.target.value)}
                         placeholder="Share details about the fit, quality, and style..."
                         className="w-full bg-white border border-neutral-200 p-5 text-sm font-light tracking-wide text-neutral-900 focus:outline-none focus:border-neutral-900 resize-none transition-colors rounded-sm shadow-sm text-left placeholder:text-neutral-400"
                         required
                       ></textarea>
                     </div>

                     <button
                       type="submit"
                       disabled={isSubmittingReview}
                       className="group/btn relative overflow-hidden flex items-center justify-center mt-2 w-full bg-neutral-950 text-white py-4.5 sm:py-5 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] transition-all duration-500 disabled:bg-neutral-300 disabled:cursor-not-allowed rounded-sm text-center"
                     >
                       <span className="relative z-10 transition-colors duration-500 group-hover/btn:text-white">
                         {isSubmittingReview ? "Publishing..." : "Publish Review"}
                       </span>
                       {!isSubmittingReview && (
                         <div className="absolute inset-0 h-full w-full scale-y-0 bg-neutral-800 transition-transform duration-500 ease-[0.25,1,0.5,1] group-hover/btn:scale-y-100 origin-bottom"></div>
                       )}
                     </button>
                     
                     <p className="text-center text-[8px] sm:text-[9px] text-neutral-400 font-bold tracking-[0.2em] uppercase mt-2 w-full text-center">
                       By submitting, you agree to our review guidelines.
                     </p>
                   </form>
                 )}
               </div>
            </div>

          </div>
        </div>

        {/* =========================================
            RELATED PRODUCTS SECTION 
            ========================================= */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-neutral-200 pt-16 sm:pt-24 mt-16 sm:mt-24 opacity-0 animate-[fade-in-up_0.8s_ease-out_0.6s_forwards] w-full px-5 sm:px-0">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 sm:gap-6 mb-10 sm:mb-12">
              <div className="text-left w-full md:w-auto">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-wide uppercase text-neutral-900 mb-2 sm:mb-3 text-left">
                  You May Also Like
                </h2>
                <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400 text-left">
                  Curated based on your selection
                </p>
              </div>
              <button
                onClick={(e) => handleRedirect(e, product.category ? `/products?category=${encodeURIComponent(product.category)}` : `/products`)}
                className="hidden md:inline-flex items-center justify-center gap-2 border-b border-neutral-900 pb-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-900 hover:text-neutral-500 hover:border-neutral-500 transition-colors group shrink-0"
              >
                View More {product.category}
                <ArrowRight className="w-3.5 h-3.5 stroke-[2] transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-10 sm:gap-x-6 sm:gap-y-16">
              {relatedProducts.map((relatedPiece, idx) => (
                <div key={relatedPiece._id} style={{ animationDelay: `${idx * 150}ms` }} className="opacity-0 animate-[fade-in-up_0.8s_ease-out_forwards]">
                  <ProductCard product={relatedPiece} />
                </div>
              ))}
            </div>

            <div className="mt-12 sm:mt-16 flex items-center justify-center w-full md:hidden">
              <button
                onClick={(e) => handleRedirect(e, product.category ? `/products?category=${encodeURIComponent(product.category)}` : `/products`)}
                className="flex items-center justify-center w-full border border-neutral-900 bg-white px-10 py-4 text-[9px] font-bold uppercase tracking-[0.25em] text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors active:scale-95 text-center"
              >
                Explore The Edit
              </button>
            </div>
          </div>
        )}

      </div>

      {/* =========================================
          SIZE GUIDE MODAL
          ========================================= */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-neutral-950/60 backdrop-blur-md transition-opacity">
          <div className="bg-white max-w-4xl w-full relative overflow-hidden shadow-2xl animate-[fade-in-up_0.4s_ease-out_forwards] rounded-sm flex flex-col md:flex-row">
            
            <button onClick={() => setIsSizeGuideOpen(false)} className="absolute flex items-center justify-center top-5 right-5 sm:top-6 sm:right-6 text-neutral-400 hover:text-neutral-900 transition-colors z-10 bg-white/80 backdrop-blur-sm rounded-full p-2"><X className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5]" /></button>
            
            <div className="w-full md:w-1/3 bg-neutral-50 p-8 sm:p-12 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-neutral-100 text-center">
              <Ruler className="w-10 h-10 sm:w-12 sm:h-12 text-neutral-300 mb-5 sm:mb-6 stroke-[1.5]" />
              <h3 className="text-base sm:text-lg font-light tracking-widest uppercase text-neutral-900 mb-2 sm:mb-3 w-full text-center">Measurement Guide</h3>
              <p className="text-[9px] sm:text-[10px] text-neutral-500 text-center uppercase tracking-widest leading-[1.8] max-w-[200px]">Use a flexible measuring tape to find your perfect fit.</p>
            </div>
            
            <div className="w-full md:w-2/3 p-6 sm:p-10 lg:p-12 text-left">
              <h2 className="text-xl sm:text-2xl font-light tracking-wide uppercase text-neutral-900 mb-6 sm:mb-8 border-b border-neutral-200 pb-4 text-center sm:text-left">Standard Sizing</h2>
              <div className="overflow-x-auto no-scrollbar w-full">
                <table className="w-full text-left text-xs sm:text-sm font-light text-neutral-600 min-w-[400px]">
                  <thead className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.25em] text-neutral-400 border-b border-neutral-200 text-left">
                    <tr><th className="py-4 pr-4">Size</th><th className="py-4 px-4">Chest (in)</th><th className="py-4 px-4">Waist (in)</th><th className="py-4 pl-4">Hips (in)</th></tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors text-left"><td className="py-4 sm:py-5 pr-4 font-bold text-neutral-900">XS</td><td className="py-4 sm:py-5 px-4">32 - 34</td><td className="py-4 sm:py-5 px-4">26 - 28</td><td className="py-4 sm:py-5 pl-4">34 - 36</td></tr>
                    <tr className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors text-left"><td className="py-4 sm:py-5 pr-4 font-bold text-neutral-900">S</td><td className="py-4 sm:py-5 px-4">35 - 37</td><td className="py-4 sm:py-5 px-4">29 - 31</td><td className="py-4 sm:py-5 pl-4">37 - 39</td></tr>
                    <tr className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors text-left"><td className="py-4 sm:py-5 pr-4 font-bold text-neutral-900">M</td><td className="py-4 sm:py-5 px-4">38 - 40</td><td className="py-4 sm:py-5 px-4">32 - 34</td><td className="py-4 sm:py-5 pl-4">40 - 42</td></tr>
                    <tr className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors text-left"><td className="py-4 sm:py-5 pr-4 font-bold text-neutral-900">L</td><td className="py-4 sm:py-5 px-4">41 - 43</td><td className="py-4 sm:py-5 px-4">35 - 37</td><td className="py-4 sm:py-5 pl-4">43 - 45</td></tr>
                    <tr className="hover:bg-neutral-50 transition-colors text-left"><td className="py-4 sm:py-5 pr-4 font-bold text-neutral-900">XL</td><td className="py-4 sm:py-5 px-4">44 - 46</td><td className="py-4 sm:py-5 px-4">38 - 40</td><td className="py-4 sm:py-5 pl-4">46 - 48</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
            
          </div>
        </div>
      )}

      {/* AR Modal */}
      {isTryOnOpen && has3DModel && (
        <TryOnModal isOpen={isTryOnOpen} onClose={() => setIsTryOnOpen(false)} product={product} />
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; } 
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
      ` }} />
    </div>
  );
}