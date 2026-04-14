import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import StockHistory from "../models/StockHistory.js";


// 🛒 PLACE ORDER
export const placeOrder = async (req, res) => {
  try {

    const { products, couponCode } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let totalAmount = 0;
    let appliedCoupon = null;
    let orderProducts = [];

    // 1️⃣ Validate products & calculate total
    for (let item of products) {

      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `${product.title} is out of stock`,
        });
      }

      orderProducts.push({
        productId: product._id,
        quantity: item.quantity,
        price: product.price,
      });

      totalAmount += product.price * item.quantity;
    }

    // 2️⃣ Apply Coupon
    if (couponCode) {

      const coupon = await Coupon.findOne({ code: couponCode });

      if (coupon && new Date(coupon.expiryDate) >= new Date()) {

        const discount =
          (totalAmount * coupon.discountPercent) / 100;

        totalAmount -= discount;
        appliedCoupon = coupon.code;
      }
    }

    // 3️⃣ Create Order
    const order = await Order.create({
      userId: req.user._id,
      products: orderProducts,
      totalAmount,
      couponApplied: appliedCoupon,
      orderStatus: "Pending",
    });

    // 4️⃣ Update Stock
    for (let item of products) {

      const product = await Product.findById(item.productId);

      const oldStock = product.stock;

      // Atomic stock decrease
      const updatedProduct = await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      // If stock finished
      if (updatedProduct.stock <= 0) {
        updatedProduct.isOutOfStock = true;
        await updatedProduct.save();
      }

      // Save stock history
      await StockHistory.create({
        productId: item.productId,
        oldStock,
        newStock: updatedProduct.stock,
        changedBy: req.user._id,
        reason: "ORDER",
      });
    }

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};



// 📜 USER ORDER HISTORY
export const getMyOrders = async (req, res) => {
  try {

    const orders = await Order.find({
      userId: req.user._id,
    })
      .populate(
        "products.productId",
        "title price mainimage1 category"
      )
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};



// 📦 ADMIN – GET ALL ORDERS
export const getAllOrders = async (req, res) => {
  try {

    const orders = await Order.find()
      .populate("userId", "name email")
      .populate(
        "products.productId",
        "title mainimage1 category price"
      )
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};



// 📄 GET SINGLE ORDER
export const getOrderById = async (req, res) => {
  try {

    const order = await Order.findById(req.params.id)
      .populate(
        "products.productId",
        "title price mainimage1 category"
      )
      .populate("userId", "name email");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Security check
    if (
      order.userId._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    res.json(order);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};



export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    // Allow either parameter name depending on how the route was defined
    const orderId = req.params.id || req.params.orderId; 

    // 1. Find the exact order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const currentStatus = order.orderStatus;

    // 2. Logic: If changing TO "Returned/Cancelled" -> Add stock back
    if (
      (status === "Returned" || status === "Cancelled") &&
      currentStatus !== "Returned" &&
      currentStatus !== "Cancelled"
    ) {
      for (const item of order.products) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity }, 
        });
      }
    }

    // 3. Logic: If changing FROM "Returned/Cancelled" back to an active state -> Deduct stock again
    if (
      (currentStatus === "Returned" || currentStatus === "Cancelled") &&
      (status === "Pending" || status === "Processing" || status === "Shipped" || status === "Delivered")
    ) {
      for (const item of order.products) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity }, 
        });
      }
    }

    // 4. Update and Save
    order.orderStatus = status;
    
    if (status === 'Delivered') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
    }

    await order.save();

    res.json({ message: `Order status successfully updated to ${status}`, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};