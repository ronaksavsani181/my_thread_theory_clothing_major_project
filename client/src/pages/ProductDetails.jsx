import { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/useAuth";
import { useCart } from "../context/useCart";
import { useWishlist } from "../context/useWishlist";
import { Star, Truck, ShieldCheck, Heart, X, Ruler, ThumbsUp, User } from "lucide-react";
import VisualTryOnButton from "../components/VisualTryOnButton";
import TryOnModal from "../components/VisualTryOn/TryOnModal";
import ProductCard from "../components/ProductCard";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const wishlisted = isInWishlist(product?._id);
  const [activeImage, setActiveImage] = useState("");

  // 🌟 State variables for UI features
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // 🌟 Review States
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  
  // 🌟 Review Eligibility State
  const [canReview, setCanReview] = useState(false);
  const [eligibilityMessage, setEligibilityMessage] = useState("Checking eligibility...");

  // 🌟 Pagination State
  const [currentReviewPage, setCurrentReviewPage] = useState(1);
  const REVIEWS_PER_PAGE = 10;

  // 🌟 Related Products State
  const [relatedProducts, setRelatedProducts] = useState([]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  /* ---------------- FETCH PRODUCT, REVIEWS, RELATED & ELIGIBILITY ---------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
        
        const [prodRes, revRes, allProductsRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/reviews/${id}`).catch(() => ({ data: { reviews: [], averageRating: 0 } })),
          api.get(`/products`).catch(() => ({ data: [] }))
        ]);
        
        const currentProduct = prodRes.data;
        setProduct(currentProduct);
        if (currentProduct.mainimage1) setActiveImage(currentProduct.mainimage1);
        
        setReviews(revRes.data.reviews || []);
        setAvgRating(revRes.data.averageRating || 0);

        if (allProductsRes.data && allProductsRes.data.length > 0) {
          const related = allProductsRes.data.filter(
            (p) => p._id !== id && (p.category === currentProduct.category || p.brand === currentProduct.brand)
          );
          setRelatedProducts(related.slice(0, 6)); 
        }

        // 🌟 Check Review Eligibility
        if (user) {
          try {
            const eligRes = await api.get(`/orders/eligibility/${id}`);
            setCanReview(eligRes.data.eligible);
            setEligibilityMessage(eligRes.data.message || "You can write a review.");
          } catch (error) {
            setCanReview(false);
            setEligibilityMessage("Only verified buyers can review this piece.");
          }
        } else {
          setEligibilityMessage("Please log in to review your purchases.");
        }

      } catch {
        showToast("Unable to locate piece.", "error");
      }
    };
    fetchData();
  }, [id, user]);

  /* ---------------- CALCULATE REVIEW DISTRIBUTION ---------------- */
  const reviewDistribution = useMemo(() => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => { if (dist[r.rating] !== undefined) dist[r.rating]++; });
    return dist;
  }, [reviews]);

  /* ---------------- PAGINATION LOGIC ---------------- */
  const totalReviewPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);
  const paginatedReviews = reviews.slice(
    (currentReviewPage - 1) * REVIEWS_PER_PAGE,
    currentReviewPage * REVIEWS_PER_PAGE
  );

  const handlePageChange = (newPage) => {
    setCurrentReviewPage(newPage);
    // Smooth scroll slightly up to the reviews section header
    document.getElementById("reviews-section")?.scrollIntoView({ behavior: "smooth" });
  };

  /* ---------------- ACTIONS ---------------- */
  const handleAddToCart = () => {
    if (product.sizesAvailable?.length > 0 && !selectedSize) {
      showToast("Please select a size.", "error");
      return;
    }
    addToCart(product, selectedSize);
    showToast("Added to your bag.");
  };

  const handleAddToWishlist = () => {
    if (wishlisted) {
      removeFromWishlist(product._id);
      showToast("Removed from wishlist");
    } else {
      addToWishlist(product);
      showToast("Saved to wishlist");
    }
  };

  const handleViewMore = () => {
    navigate(product?.category ? `/products?category=${encodeURIComponent(product.category)}` : `/products`);
  };

  /* ---------------- SUBMIT REVIEW ---------------- */
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
      setReviews(res.data.reviews);
      setAvgRating(res.data.averageRating);
      
      showToast("Review submitted successfully.");
      setCanReview(false); 
      setEligibilityMessage("Thank you! You have successfully reviewed this piece.");
      setCurrentReviewPage(1); // Reset to first page to see the new review
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

  if (!product) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 animate-pulse">
          Curating Details...
        </p>
      </div>
    );
  }

  const rawImages = [product.image, product.mainimage1, product.image2, product.image3, product.image4];
  const galleryImages = rawImages.filter((img) => img && img.trim() !== "");
  const activeIndex = galleryImages.indexOf(activeImage);

  const handlePrevImage = () => {
    if (galleryImages.length <= 1) return;
    setActiveImage(galleryImages[activeIndex === 0 ? galleryImages.length - 1 : activeIndex - 1]);
  };

  const handleNextImage = () => {
    if (galleryImages.length <= 1) return;
    setActiveImage(galleryImages[activeIndex === galleryImages.length - 1 ? 0 : activeIndex + 1]);
  };

  const has3DModel = product.model3Durl && product.model3Durl.trim() !== "";

  return (
    <div className="bg-white min-h-screen font-sans relative pb-24 selection:bg-neutral-200">
      
      {/* LUXURY TOAST NOTIFICATION */}
      <div 
        className={`fixed left-1/2 top-24 z-[100] flex w-[90%] max-w-sm -translate-x-1/2 transform items-center justify-center gap-3 rounded-sm p-4 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] backdrop-blur-xl transition-all duration-500 ease-[0.25,1,0.5,1] pointer-events-none ${
          toast.show ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"
        } ${toast.type === "error" ? "bg-white/95 border-l-4 border-red-500 text-neutral-800" : "bg-neutral-950/95 text-white"}`}
      >
        <p className={`text-[10px] font-bold tracking-[0.25em] uppercase text-center ${toast.type === "error" ? "text-neutral-700" : "text-neutral-200"}`}>
          {toast.message}
        </p>
      </div>

      <div className="max-w-[85rem] mx-auto px-6 sm:px-8 lg:px-12 pt-8 lg:pt-16">
        
        {/* BREADCRUMBS */}
        <nav className="mb-12 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">
          <Link to="/" className="hover:text-neutral-900 transition-colors">Home</Link>
          <span className="mx-3">/</span>
          <Link to="/products" className="hover:text-neutral-900 transition-colors">Collection</Link>
          <span className="mx-3">/</span>
          <span className="text-neutral-900">{product.category || "Piece"}</span>
        </nav>

        {/* TOP SECTION: GALLERY & DETAILS */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 mb-32">
          
          {/* INTERACTIVE GALLERY */}
          <div className="w-full lg:w-[55%] flex flex-col-reverse lg:flex-row gap-4 lg:gap-6">
            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto no-scrollbar lg:w-20 shrink-0 pb-2 lg:pb-0">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-20 h-28 lg:w-full lg:h-28 shrink-0 bg-neutral-50 overflow-hidden transition-all duration-300 ${
                    activeImage === img ? "border border-neutral-900 opacity-100" : "border border-transparent opacity-50 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover object-center" />
                </button>
              ))}
            </div>

            <div className="flex-1 bg-neutral-50 aspect-[3/4] sm:aspect-[4/5] relative overflow-hidden group">
              <img
                src={activeImage || product.mainimage1 || product.image }
                alt={product.title}
                className="w-full h-full object-cover object-center transition-opacity duration-700"
                key={activeImage}
              />
              {galleryImages.length > 1 && (
                <>
                  <button onClick={handlePrevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white text-neutral-900 p-3 opacity-0 group-hover:opacity-100 transition-all duration-500 shadow-sm">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                  </button>
                  <button onClick={handleNextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white text-neutral-900 p-3 opacity-0 group-hover:opacity-100 transition-all duration-500 shadow-sm">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* PRODUCT DETAILS PANEL */}
          <div className="w-full lg:w-[45%] flex flex-col">
            <div className="mb-10 border-b border-neutral-200 pb-10">
              <h1 className="text-3xl sm:text-4xl font-light tracking-wide uppercase text-neutral-900 mb-6 leading-tight">
                {product.title}
              </h1>
              <div className="flex items-center justify-between">
                <p className="text-xl text-neutral-900 font-medium tracking-wide">
                  ₹{product.price.toLocaleString()}
                </p>
                {avgRating > 0 && (
                  <div className="flex items-center gap-2 bg-neutral-50 px-4 py-2 border border-neutral-100">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-900 mt-0.5">
                      {avgRating.toFixed(1)} <span className="text-neutral-400 font-light">({reviews.length})</span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-12">
              <p className="text-sm text-neutral-600 font-light leading-relaxed tracking-wide">
                {product.description || "Expertly crafted with premium materials. This piece offers a flawless silhouette and uncompromising comfort, designed for the modern wardrobe."}
              </p>
            </div>

            {/* Size Selector & Guide */}
            {product.sizesAvailable?.length > 0 && (
              <div className="mb-12">
                <div className="flex justify-between items-center mb-5">
                  <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-900">
                    Select Size
                  </span>
                  <button 
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-500 hover:text-neutral-900 transition-colors border-b border-neutral-300 hover:border-neutral-900 pb-0.5 flex items-center gap-1.5"
                  >
                    <Ruler className="w-3 h-3" /> Size Guide
                  </button>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                  {product.sizesAvailable.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3.5 text-[10px] font-bold tracking-[0.2em] uppercase transition-all border ${
                        selectedSize === size
                          ? "border-neutral-900 bg-neutral-900 text-white"
                          : "border-neutral-200 text-neutral-900 hover:border-neutral-900"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Call To Actions */}
            <div className="flex flex-col gap-4 mb-12">
              <button
                onClick={handleAddToCart}
                disabled={product.isOutOfStock}
                className={`w-full py-4.5 text-[10px] font-bold tracking-[0.25em] uppercase transition-all duration-300 active:scale-[0.98] ${
                  product.isOutOfStock
                    ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                    : "bg-neutral-950 text-white hover:bg-neutral-800"
                }`}
              >
                {product.isOutOfStock ? "Sold Out" : "Add To Bag"}
              </button>

              <button
                onClick={handleAddToWishlist}
                className={`w-full py-4.5 text-[10px] font-bold tracking-[0.25em] uppercase transition-all duration-300 border flex items-center justify-center gap-3 ${
                  wishlisted
                    ? "border-neutral-200 bg-neutral-50 text-neutral-500"
                    : "border-neutral-200 text-neutral-900 hover:border-neutral-900"
                }`}
              >
                <Heart className={`w-[14px] h-[14px] ${wishlisted ? "fill-current text-red-500" : ""}`} />
                {wishlisted ? "Saved to Wishlist" : "Save To Wishlist"}
              </button>

              {has3DModel && <VisualTryOnButton onClick={() => setIsTryOnOpen(true)} />}
            </div>

            <ul className="space-y-4 pt-8 border-t border-neutral-100 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-500">
              <li className="flex items-center gap-4"><Truck className="w-4 h-4 text-neutral-900" /> Complimentary Express Delivery</li>
              <li className="flex items-center gap-4"><ShieldCheck className="w-4 h-4 text-neutral-900" /> 14-Day Free Returns</li>
            </ul>
          </div>
        </div>

        {/* =========================================
            🌟 UPGRADED: REVIEWS EDITORIAL SECTION 
            ========================================= */}
        <div id="reviews-section" className="border-t border-neutral-200 pt-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            
            {/* LEFT: Distribution Summary & Reviews List */}
            <div className="lg:col-span-7 flex flex-col">
              <h2 className="text-2xl md:text-3xl font-light tracking-wide uppercase text-neutral-900 mb-8">
                Client Reviews
              </h2>
              
              {/* Premium Rating Distribution Block */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 bg-neutral-50 p-8 mb-12 border border-neutral-100 rounded-sm">
                
                <div className="flex flex-col items-center border-b sm:border-b-0 sm:border-r border-neutral-200 pb-6 sm:pb-0 sm:pr-10 w-full sm:w-auto">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-5xl font-medium text-emerald-700 tracking-tight">{avgRating.toFixed(1)}</span>
                    <Star className="w-8 h-8 fill-emerald-700 text-emerald-700" />
                  </div>
                  <p className="text-[10px] font-bold tracking-widest text-neutral-500 mt-2 text-center">
                    {reviews.length} Ratings<br/>{reviews.length} Reviews
                  </p>
                </div>
                
                <div className="flex-1 w-full flex flex-col gap-3">
                  {[
                    { star: 5, label: "Excellent", color: "bg-emerald-600" },
                    { star: 4, label: "Very Good", color: "bg-emerald-500" },
                    { star: 3, label: "Good", color: "bg-yellow-400" },
                    { star: 2, label: "Average", color: "bg-neutral-300" },
                    { star: 1, label: "Poor", color: "bg-red-500" }
                  ].map(({ star, label, color }) => {
                    const count = reviewDistribution[star];
                    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-4">
                        <span className="text-[11px] font-medium text-neutral-700 w-16 shrink-0">{label}</span>
                        <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                          <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
                        </div>
                        <span className="text-[11px] font-medium text-neutral-500 w-6 text-right shrink-0">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Individual Reviews List */}
              <div className="flex flex-col gap-8">
                {reviews.length === 0 ? (
                  <div className="text-center py-10 bg-neutral-50 border border-neutral-100 rounded-sm">
                    <p className="text-sm font-light tracking-wide text-neutral-500">No reviews yet.</p>
                    <p className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 mt-2">Be the first to share your thoughts.</p>
                  </div>
                ) : (
                  <>
                    {paginatedReviews.map((r, i) => (
                      <div key={i} className="py-6 border-b border-neutral-100 last:border-0 group">
                        
                        {/* User Header */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 border border-neutral-200">
                             <User className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-neutral-900 tracking-wide">{r.user?.name || "Verified Buyer"}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex bg-emerald-600 px-1.5 py-0.5 rounded-sm items-center gap-1 shadow-sm">
                                <span className="text-[10px] text-white font-bold leading-none">{r.rating}.0</span>
                                <Star className="w-2.5 h-2.5 text-white fill-white" />
                              </div>
                              <span className="text-neutral-300 text-[10px]">•</span>
                              <span className="text-[10px] text-neutral-400 font-light">Posted on {formatDate(r.createdAt)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Review Body */}
                        <p className="text-sm font-light tracking-wide text-neutral-800 leading-relaxed mb-4">
                          {r.comment}
                        </p>

                        {/* Uploaded Images (If any) */}
                        {r.images && r.images.length > 0 && (
                          <div className="flex flex-wrap gap-3 mb-5">
                            {r.images.map((imgUrl, idx) => (
                              <div key={idx} className="w-16 h-16 sm:w-20 sm:h-20 bg-neutral-100 border border-neutral-200 rounded-sm overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                                 <img src={imgUrl} alt="Review attachment" className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Helpful Footer */}
                        <div className="flex items-center gap-4">
                          <button className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-bold uppercase tracking-wider hover:text-neutral-900 transition-colors">
                            <ThumbsUp className="w-3.5 h-3.5" /> Helpful (0)
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Pagination Controls */}
                    {totalReviewPages > 1 && (
                      <div className="flex items-center justify-between pt-8 mt-4 border-t border-neutral-200">
                        <button 
                          onClick={() => handlePageChange(currentReviewPage - 1)}
                          disabled={currentReviewPage === 1}
                          className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          &larr; Prev
                        </button>
                        
                        <div className="flex items-center gap-2">
                          {Array.from({ length: totalReviewPages }, (_, i) => i + 1).map(page => (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`w-8 h-8 flex items-center justify-center text-[10px] font-bold rounded-sm transition-colors ${currentReviewPage === page ? 'bg-neutral-900 text-white' : 'bg-neutral-50 text-neutral-500 hover:bg-neutral-200'}`}
                            >
                              {page}
                            </button>
                          ))}
                        </div>

                        <button 
                          onClick={() => handlePageChange(currentReviewPage + 1)}
                          disabled={currentReviewPage === totalReviewPages}
                          className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          Next &rarr;
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* RIGHT: Write a Review Form / Eligibility Gate */}
            <div className="lg:col-span-5 relative">
               <div className="sticky top-32 bg-white border border-neutral-200 p-8 sm:p-10 shadow-sm rounded-sm">
                 <h3 className="text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-900 mb-8 border-b border-neutral-200 pb-4">
                   Write a Review
                 </h3>
                 
                 {!user ? (
                   <div className="text-center py-6">
                     <ShieldCheck className="w-8 h-8 text-neutral-300 mx-auto mb-4" />
                     <p className="text-sm font-light tracking-wide text-neutral-500 mb-6">Sign in to share your experience with this piece.</p>
                     <Link to="/login" className="inline-block border border-neutral-900 px-8 py-3 text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors">
                       Sign In
                     </Link>
                   </div>
                 ) : !canReview ? (
                   <div className="text-center py-8 bg-neutral-50 border border-neutral-100 px-6 rounded-sm">
                     <ShieldCheck className="w-10 h-10 text-neutral-300 mx-auto mb-4" />
                     <p className="text-sm font-medium tracking-wide text-neutral-800 mb-2">Verified Purchases Only</p>
                     <p className="text-xs font-light tracking-wide text-neutral-500 leading-relaxed">{eligibilityMessage}</p>
                     <div className="mt-6">
                        <Link to="/orders" className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 hover:text-neutral-900 border-b border-neutral-300 hover:border-neutral-900 pb-0.5 transition-colors">View My Orders</Link>
                     </div>
                   </div>
                 ) : (
                   <form onSubmit={handleSubmitReview} className="flex flex-col gap-6">
                     <div>
                       <label className="block text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-500 mb-3">Rating</label>
                       <div className="flex gap-2">
                         {[1, 2, 3, 4, 5].map((star) => (
                           <button
                             type="button"
                             key={star}
                             onClick={() => setRating(star)}
                             className="focus:outline-none transition-transform hover:scale-110"
                           >
                             <Star className={`w-7 h-7 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "fill-neutral-200 text-neutral-300"}`} />
                           </button>
                         ))}
                       </div>
                     </div>

                     <div>
                       <label className="block text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-500 mb-3">Your Thoughts</label>
                       <textarea
                         rows="4"
                         value={comment}
                         onChange={(e) => setComment(e.target.value)}
                         placeholder="Share details about the fit, quality, and style..."
                         className="w-full bg-neutral-50 border border-neutral-200 p-4 text-sm font-light tracking-wide text-neutral-900 focus:outline-none focus:border-neutral-900 resize-none transition-colors rounded-sm"
                         required
                       ></textarea>
                     </div>

                     <button
                       type="submit"
                       disabled={isSubmittingReview}
                       className="mt-2 w-full bg-neutral-950 text-white py-4 text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-neutral-800 transition-colors disabled:bg-neutral-300 rounded-sm"
                     >
                       {isSubmittingReview ? "Publishing..." : "Publish Review"}
                     </button>
                     
                     <p className="text-center text-[9px] text-neutral-400 font-medium tracking-widest uppercase mt-2">
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
          <div className="border-t border-neutral-200 pt-20 mt-20">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-light tracking-wide uppercase text-neutral-900 mb-2">
                  You May Also Like
                </h2>
                <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-500">
                  Curated based on your selection
                </p>
              </div>
              <button
                onClick={handleViewMore}
                className="hidden md:inline-block border-b border-neutral-900 pb-1 text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-900 hover:text-neutral-500 hover:border-neutral-500 transition-colors"
              >
                View More {product.category}
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-12 sm:gap-x-6 sm:gap-y-16">
              {relatedProducts.map((relatedPiece) => (
                <ProductCard key={relatedPiece._id} product={relatedPiece} />
              ))}
            </div>

            <div className="mt-16 flex justify-center w-full">
              <button
                onClick={handleViewMore}
                className="w-full md:w-auto border border-neutral-900 px-10 py-4 text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors"
              >
                Explore The Edit
              </button>
            </div>
          </div>
        )}

      </div>

      {/* SIZE GUIDE MODAL */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white max-w-3xl w-full relative overflow-hidden shadow-2xl animate-fade-in-up rounded-sm">
            <button onClick={() => setIsSizeGuideOpen(false)} className="absolute top-6 right-6 text-neutral-400 hover:text-neutral-900 transition-colors z-10"><X className="w-6 h-6" /></button>
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-1/3 bg-neutral-50 p-10 flex flex-col items-center justify-center border-r border-neutral-100">
                <Ruler className="w-12 h-12 text-neutral-300 mb-6" />
                <h3 className="text-lg font-light tracking-widest uppercase text-neutral-900 mb-2 text-center">Measurement Guide</h3>
                <p className="text-[10px] text-neutral-500 text-center uppercase tracking-widest leading-relaxed">Use a flexible measuring tape to find your perfect fit.</p>
                <img src="https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=400" alt="Tailor measuring tape" className="mt-8 w-32 h-32 object-cover rounded-full border-4 border-white shadow-sm"/>
              </div>
              <div className="w-full md:w-2/3 p-8 sm:p-12">
                <h2 className="text-2xl font-light tracking-wide uppercase text-neutral-900 mb-8 border-b border-neutral-200 pb-4">Standard Sizing</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm font-light text-neutral-600">
                    <thead className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 border-b border-neutral-200">
                      <tr><th className="py-4 pr-4">Size</th><th className="py-4 px-4">Chest (in)</th><th className="py-4 px-4">Waist (in)</th><th className="py-4 pl-4">Hips (in)</th></tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"><td className="py-4 pr-4 font-bold text-neutral-900">XS</td><td className="py-4 px-4">32 - 34</td><td className="py-4 px-4">26 - 28</td><td className="py-4 pl-4">34 - 36</td></tr>
                      <tr className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"><td className="py-4 pr-4 font-bold text-neutral-900">S</td><td className="py-4 px-4">35 - 37</td><td className="py-4 px-4">29 - 31</td><td className="py-4 pl-4">37 - 39</td></tr>
                      <tr className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"><td className="py-4 pr-4 font-bold text-neutral-900">M</td><td className="py-4 px-4">38 - 40</td><td className="py-4 px-4">32 - 34</td><td className="py-4 pl-4">40 - 42</td></tr>
                      <tr className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"><td className="py-4 pr-4 font-bold text-neutral-900">L</td><td className="py-4 px-4">41 - 43</td><td className="py-4 px-4">35 - 37</td><td className="py-4 pl-4">43 - 45</td></tr>
                      <tr className="hover:bg-neutral-50 transition-colors"><td className="py-4 pr-4 font-bold text-neutral-900">XL</td><td className="py-4 px-4">44 - 46</td><td className="py-4 px-4">38 - 40</td><td className="py-4 pl-4">46 - 48</td></tr>
                    </tbody>
                  </table>
                </div>
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
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.4s ease-out forwards; }
      ` }} />
    </div>
  );
}