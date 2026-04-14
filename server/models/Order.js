import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    couponApplied: { type: String, default: null },
    orderStatus: {
      type: String,
      required: true,
      // 🟢 ADDED "Return Requested" SO THE DATABASE DOESN'T CRASH
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Returned", "Return Requested"], 
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: ["PAID", "FAILED"],
      default: "PAID",
    },
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      addressLine: { type: String, required: true },
      city: { type: String, required: true },
      pincode: { type: String, required: true },
    },
  },
  { timestamps: true },
);

const Order = mongoose.model("Order", orderSchema);
export default Order;