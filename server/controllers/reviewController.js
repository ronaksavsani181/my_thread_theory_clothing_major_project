import Review from "../models/Review.js";
import Product from "../models/Product.js";

/* ===============================
   ADD OR UPDATE REVIEW (USER)
================================ */
export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { productId } = req.params;

    if (!rating) {
      return res.status(400).json({ message: "Rating is required" });
    }

    // Check product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 🌟 MERGE UPLOADED FILES & IMAGE URLs
    let finalImages = [];

    // 1. Process Local Uploaded Files
    if (req.files && req.files.length > 0) {
      const uploadedUrls = req.files.map((file) => `/assets/reviewImages/${file.filename}`);
      finalImages = finalImages.concat(uploadedUrls);
    }

    // 2. Process User-provided String URLs
    if (req.body.imageUrls) {
      const urlArray = Array.isArray(req.body.imageUrls) ? req.body.imageUrls : [req.body.imageUrls];
      finalImages = finalImages.concat(urlArray);
    }

    // Support both ID formats depending on auth middleware
    const userId = req.user._id || req.user.id;

    // Check existing review
    let review = await Review.findOne({ userId, productId });

    if (review) {
      // Update existing review
      review.rating = Number(rating);
      review.comment = comment;
      if (finalImages.length > 0) {
        review.images = finalImages; 
      }
      await review.save();
    } else {
      // Create new review
      review = await Review.create({
        userId,
        productId,
        rating: Number(rating),
        comment,
        images: finalImages,
      });
    }

    // Recalculate average rating
    const reviews = await Review.find({ productId });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);

    product.numReviews = reviews.length;
    product.averageRating = reviews.length > 0 ? (totalRating / reviews.length) : 0;
    await product.save();

    res.status(201).json({
      message: "Review submitted successfully",
      review,
      averageRating: product.averageRating,
    });
  } catch (error) {
    console.error("Add Review Error:", error);
    res.status(500).json({ message: error.message || "Failed to add review" });
  }
};

/* ===============================
   GET REVIEWS OF PRODUCT
================================ */
export const getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ productId })
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    const averageRating = reviews.length === 0
        ? 0
        : reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    res.json({
      reviews: reviews.map((r) => ({
        _id: r._id,
        rating: r.rating,
        comment: r.comment,
        images: r.images || [], 
        // 🌟 CRITICAL FIX: If a user was deleted, r.userId is null. This prevents server crash!
        user: { name: r.userId?.name || "Verified Buyer" }, 
        createdAt: r.createdAt, 
      })),
      averageRating,
    });
  } catch (error) {
    console.error("Get Reviews Error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch reviews" });
  }
};