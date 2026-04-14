import Order from "../models/Order.js";
import Product from "../models/Product.js";
import ProductHistory from "../models/ProductHistory.js";
import StockHistory from "../models/StockHistory.js";
import User from "../models/User.js";

// ==========================================
// 🛠️ HELPER: DATE FILTER GENERATOR
// ==========================================
const getDateFilter = (range) => {
  let dateFilter = {};
  const now = new Date();
  if (range && range !== 'all') {
    let startDate = new Date();
    if (range === 'daily') startDate.setHours(0, 0, 0, 0); 
    else if (range === 'weekly') startDate.setDate(now.getDate() - 7);
    else if (range === 'monthly') startDate.setDate(now.getDate() - 30);
    else if (range === 'yearly') startDate.setFullYear(now.getFullYear() - 1);
    dateFilter = { createdAt: { $gte: startDate } };
  }
  return dateFilter;
};

// ==========================================
// 🟢 MAIN DASHBOARD STATS WITH FILTER
// ==========================================
export const getAdminStats = async (req, res) => {
  try {
    const { range } = req.query; 
    const dateFilter = getDateFilter(range);

    const orders = await Order.find(dateFilter).populate("userId", "name email").sort({ createdAt: -1 });
    
    // 🟢 FIX: Count true "Active Clients" (Unique users who placed orders in this timeframe)
    const uniqueClients = new Set();
    
    let totalRevenue = 0;
    let itemsSold = 0;

    orders.forEach(order => {
      // Add user ID to Set (Sets automatically ignore duplicates)
      if (order.userId) {
        uniqueClients.add(order.userId._id.toString());
      }
      
      // Calculate revenue and items sold
      if (order.paymentStatus === 'PAID' || order.orderStatus === 'Delivered' || order.orderStatus === 'Processing' || order.orderStatus === 'Shipped') {
         totalRevenue += order.totalAmount || 0;
         order.products.forEach(item => { itemsSold += item.quantity || 0; });
      }
    });

    res.json({
      totalRevenue,
      totalOrders: orders.length,
      itemsSold,
      activeUsers: uniqueClients.size, // Accurately reflects Active Buyers now!
      recentOrders: orders 
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 🔥 TOP SELLING PRODUCTS (Filtered)
// ==========================================
export const topSellingProducts = async (req, res) => {
  try {
    const { range } = req.query;
    const filter = getDateFilter(range);
    const matchStage = Object.keys(filter).length > 0 ? { $match: filter } : { $match: {} };

    const result = await Order.aggregate([
      matchStage,
      { $unwind: "$products" },
      { $group: { _id: "$products.productId", totalSold: { $sum: "$products.quantity" } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
      { $unwind: "$product" },
    ]);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 📈 DYNAMIC SALES TREND (Filtered by Hour/Day/Month)
// ==========================================
export const monthlySalesTrend = async (req, res) => {
  try {
    const { range } = req.query;
    const filter = getDateFilter(range);
    const matchStage = Object.keys(filter).length > 0 ? { $match: filter } : { $match: {} };

    let groupId;
    
    if (range === 'daily') {
      groupId = { $hour: "$createdAt" }; 
    } else if (range === 'weekly' || range === 'monthly') {
      groupId = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }; 
    } else {
      groupId = { $month: "$createdAt" }; 
    }

    const result = await Order.aggregate([
      matchStage,
      { $group: { _id: groupId, totalSales: { $sum: "$totalAmount" } } },
      { $sort: { "_id": 1 } },
    ]);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 🥧 ORDER STATUS PIE (Filtered)
// ==========================================
export const orderStatusStats = async (req, res) => {
  try {
    const { range } = req.query;
    const filter = getDateFilter(range);
    const matchStage = Object.keys(filter).length > 0 ? { $match: filter } : { $match: {} };

    const result = await Order.aggregate([
      matchStage,
      { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 📊 STATIC / UNTOUCHED FUNCTIONS
// ==========================================

export const lastYearSales = async (req, res) => {
  try {
    const lastYear = new Date();
    lastYear.setFullYear(lastYear.getFullYear() - 1);
    const orders = await Order.find({ createdAt: { $gte: lastYear } });
    const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    res.json({ period: "Last 1 Year", totalOrders: orders.length, totalSales });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const lastMonthSales = async (req, res) => {
  try {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const orders = await Order.find({ createdAt: { $gte: lastMonth } });
    const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    res.json({ period: "Last 1 Month", totalOrders: orders.length, totalSales });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const outOfStockProducts = async (req, res) => {
  try {
    const products = await Product.find({ stock: 0 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductHistory = async (req, res) => {
  const history = await ProductHistory.find().populate("productId", "title").populate("changedBy", "name");
  res.json(history);
};

export const getStockHistory = async (req, res) => {
  const history = await StockHistory.find().populate("productId", "title").populate("changedBy", "name");
  res.json(history);
};

// ==========================================
// 👑 UPDATE USER ROLE (Admin Only)
// ==========================================
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    user.role = role;
    await user.save();
    res.json({ message: "Role updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 🚫 TOGGLE SUSPEND USER (Prevents Admin Suspension)
// ==========================================
export const toggleUserBlock = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🟢 PREVENT ADMIN FROM BEING SUSPENDED
    if (user.role === "admin") {
      return res.status(403).json({ message: "Action denied. You cannot suspend an administrator." });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      message: user.isBlocked ? "User account suspended" : "User account activated",
      isBlocked: user.isBlocked,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 🛠️ FIX: DEDICATED STOCK UPDATE LOGIC
// ==========================================
export const updateProductStock = async (req, res) => {
  try {
    const { stock } = req.body;
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.stock = stock;
    await product.save();

    res.json({ message: "Stock updated successfully", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};