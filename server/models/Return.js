import mongoose from "mongoose";

const returnSchema = new mongoose.Schema(
{
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },

  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  quantity: {
    type: Number,
    required: true,
  },

  reason: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    enum: ["Pending","Approved","Rejected","Refunded"],
    default: "Pending",
  },

  adminNote:{
    type:String
  }

},
{ timestamps:true }
);

export default mongoose.model("Return", returnSchema);