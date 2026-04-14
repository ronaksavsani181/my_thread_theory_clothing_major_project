import Wishlist from "../models/Wishlist.js";

// ❤️ ADD TO WISHLIST
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    const wishlist = await Wishlist.create({
      userId: req.user._id,
      productId,
    });

    res.status(201).json({
      message: "Product added to wishlist",
      wishlist,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Already in wishlist" });
    }
    res.status(500).json({ message: error.message });
  }
};

// ❌ REMOVE FROM WISHLIST
export const removeFromWishlist = async (req, res) => {
  await Wishlist.findOneAndDelete({
    userId: req.user._id,
    productId: req.params.productId,
  });

  res.json({ message: "Removed from wishlist" });
};

// 📃 GET MY WISHLIST
export const getWishlist = async (req, res) => {
  const wishlist = await Wishlist.find({ userId: req.user._id })
    .populate("productId", "title price image description isOutOfStock");

  res.json(wishlist);
};
