import mongoose from "mongoose";

const stockHistorySchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    oldStock: {
      type: Number,
      required: true,
    },
    newStock: {
      type: Number,
      required: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String, // ORDER / ADMIN UPDATE
    },
  },
  { timestamps: true }
);

const StockHistory = mongoose.model(
  "StockHistory",
  stockHistorySchema
);
export default StockHistory;
