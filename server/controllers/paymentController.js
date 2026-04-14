import Razorpay from "razorpay";
import Payment from "../models/Payment.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import StockHistory from "../models/StockHistory.js";

// 💳 CREATE RAZORPAY ORDER
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    await Payment.create({
      userId: req.user._id,
      razorpayOrderId: razorpayOrder.id,
      amount,
      status: "CREATED",
    });

    res.json(razorpayOrder);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 🔥 PAYMENT SUCCESS → CREATE ORDER + REDUCE STOCK
export const updatePaymentStatus = async (req, res) => {
  try {

    const { razorpayOrderId, razorpayPaymentId, products, address } = req.body;

    const payment = await Payment.findOne({ razorpayOrderId });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Update payment status
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.status = "PAID";
    await payment.save();

    let totalAmount = payment.amount;
    let orderProducts = [];

    // 🔎 Validate stock again
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
    }

    // 📦 CREATE ORDER
    const order = await Order.create({
      userId: req.user._id,
      products: orderProducts,
      shippingAddress: address,
      totalAmount,
      orderStatus: "Pending",
      paymentStatus: "PAID",
    });

    // 🔻 REDUCE STOCK
    for (let item of orderProducts) {

      const product = await Product.findById(item.productId);

      const oldStock = product.stock;

      const updatedProduct = await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      if (updatedProduct.stock <= 0) {
        updatedProduct.isOutOfStock = true;
        await updatedProduct.save();
      }

      // 📊 STOCK HISTORY
      await StockHistory.create({
        productId: item.productId,
        oldStock,
        newStock: updatedProduct.stock,
        changedBy: req.user._id,
        reason: "ORDER",
      });
    }

    // Link payment → order
    payment.orderId = order._id;
    await payment.save();

    res.json({
      message: "Payment successful, order created",
      order,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message,
    });

  }
};



// 📜 USER PAYMENT HISTORY
export const getMyPayments = async (req, res) => {
  try {

    const payments = await Payment.find({
      userId: req.user._id,
    })
      .populate("orderId", "_id totalAmount orderStatus")
      .sort({ createdAt: -1 });

    res.json(payments);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};