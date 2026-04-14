import Return from "../models/Return.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

// 🟢 1. USER: REQUEST A RETURN
export const requestReturn = async (req, res) => {
  try {
    const { orderId, productId, quantity, reason } = req.body;
    const userId = req.user._id;

    // Validate Order
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.userId.toString() !== userId.toString()) return res.status(403).json({ message: "Not authorized" });

    // Prevent duplicate returns for the SAME product
    const existingReturn = await Return.findOne({ orderId, productId });
    if (existingReturn) return res.status(400).json({ message: "A return request is already in progress for this item." });

    // Create the Return Request
    const newReturn = await Return.create({
      orderId, productId, userId, quantity, reason, status: "Pending"
    });

    // 🟢 SYNC: Update the main Order status
    order.orderStatus = "Return Requested";
    await order.save();

    res.status(201).json({ message: "Return request submitted successfully.", returnRequest: newReturn });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟢 2. USER: GET MY RETURNS
export const getMyReturns = async (req, res) => {
  try {
    const returns = await Return.find({ userId: req.user._id })
      .populate("productId", "title mainimage1 price category season") 
      .populate("orderId", "_id createdAt")
      .sort({ createdAt: -1 });

    res.json(returns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟢 3. ADMIN: GET ALL RETURNS
export const getAllReturns = async (req, res) => {
  try {
    const returns = await Return.find()
      .populate("userId", "name email")
      .populate("productId", "title mainimage1")
      .populate("orderId", "_id")
      .sort({ createdAt: -1 });

    res.json(returns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟢 4. ADMIN: UPDATE RETURN STATUS (WITH SYNC & STOCK MATH)
export const updateReturnStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    
    const returnReq = await Return.findById(req.params.id);
    if (!returnReq) return res.status(404).json({ message: "Return request not found" });

    const previousStatus = returnReq.status;
    returnReq.status = status;
    if (adminNote) returnReq.adminNote = adminNote;

    // 🟢 SYNC WITH MAIN ORDER TABLE
    const order = await Order.findById(returnReq.orderId);
    if (order) {
       if (status === "Approved" || status === "Refunded") {
           order.orderStatus = "Returned"; 
       } else if (status === "Rejected") {
           order.orderStatus = "Delivered"; // Revert to delivered if rejected
       }
       await order.save();
    }

    // 🟢 INVENTORY MATH: Put stock back ONLY if refunded
    if (status === "Refunded" && previousStatus !== "Refunded") {
       await Product.findByIdAndUpdate(returnReq.productId, {
          $inc: { stock: returnReq.quantity }, 
       });
    }

    await returnReq.save();
    res.json({ message: `Return status updated to ${status}`, returnReq });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};