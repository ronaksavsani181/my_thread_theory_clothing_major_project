import mongoose from "mongoose";

const productHistorySchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    action: {
      type: String,
      enum: ["INSERT", "UPDATE", "DELETE"],
      required: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // admin id
      required: true,
    },
  },
  { timestamps: true }
);

const ProductHistory = mongoose.model(
  "ProductHistory",
  productHistorySchema
);
export default ProductHistory;
