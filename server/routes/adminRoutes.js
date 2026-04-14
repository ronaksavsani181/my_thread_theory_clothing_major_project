import express from "express";
import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/roleMiddleware.js";
import User from "../models/User.js";
import Order from "../models/Order.js";

import { getAllReturns, updateReturnStatus } from "../controllers/returnController.js";

import {
  getAdminStats, 
  topSellingProducts,
  lastYearSales,
  outOfStockProducts,
  lastMonthSales,
  getProductHistory,
  getStockHistory,
  monthlySalesTrend,
  orderStatusStats,
  updateProductStock // FIX: Imported new function
} from "../controllers/adminController.js";

import {
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";

const router = express.Router();

// 📊 SALES / PRODUCTS
router.get("/top-selling", protect, adminOnly, topSellingProducts);
router.get("/last-year-sales", protect, adminOnly, lastYearSales);
router.get("/last-month-sales", protect, adminOnly, lastMonthSales);
router.get("/out-of-stock", protect, adminOnly, outOfStockProducts);
router.get("/product-history", protect, adminOnly, getProductHistory);
router.get("/stock-history", protect, adminOnly, getStockHistory);
router.get("/monthly-trend", protect, adminOnly, monthlySalesTrend);
router.get("/order-status", protect, adminOnly, orderStatusStats);

// 📦 DEDICATED STOCK UPDATE ROUTE (FIX)
router.put("/stock/:id", protect, adminOnly, updateProductStock);

// RETURNS
router.get("/admin/all", protect, adminOnly, getAllReturns);
router.put("/admin/:id/status", protect, adminOnly, updateReturnStatus);

// 📦 ORDERS
router.get("/orders/all", protect, adminOnly, getAllOrders);
router.put("/orders/:id/status", protect, adminOnly, updateOrderStatus);

// 📊 DASHBOARD STATS (FIX: Cleaned up duplicate route logic)
router.get("/stats", protect, adminOnly, getAdminStats);

export default router;