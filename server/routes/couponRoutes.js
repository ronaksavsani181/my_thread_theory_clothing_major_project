import express from "express";
import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/roleMiddleware.js";
import { createCoupon ,validateCoupon ,getAllCoupons,deleteCoupon } from "../controllers/couponController.js";

const router = express.Router();

// 🔒 ADMIN ONLY
router.post("/create", protect, adminOnly, createCoupon);
// 🔒 PROTECTED ROUTE
router.post("/validate", protect, validateCoupon);
router.get("/admin/all", protect, adminOnly, getAllCoupons);
router.delete("/:id", protect, adminOnly, deleteCoupon);
export default router;
