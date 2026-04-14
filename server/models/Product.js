import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    mainimage1: { type: String, required: true },
    image2: { type: String, required: true },
    image3: { type: String, required: true },
    image4: { type: String, required: true },
    model3Durl: { type: String },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    sizesAvailable: { type: [String], default: [] },
    stock: { type: Number, required: true },
    season: { type: String, enum: ["Summer", "Winter", "All"], default: "All" },
    
    // 🟢 ADMIN CONTROLLED TAGS
    isNewArrival: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false }, 
    
    // AUTO STATUS
    isOutOfStock: { type: Boolean, default: false },
    
    // RATING SYSTEM (Used for auto-calculating 'Top Rated')
    averageRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;