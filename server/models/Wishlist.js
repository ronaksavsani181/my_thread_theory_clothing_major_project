import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true }
);

// One product once per user
wishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

export default mongoose.model("Wishlist", wishlistSchema);
