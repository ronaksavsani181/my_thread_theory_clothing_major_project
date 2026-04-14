import express from "express";
import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/roleMiddleware.js";
import { requestReturn, getAllReturns, updateReturnStatus, getMyReturns } from "../controllers/returnController.js";

const router = express.Router();

// 🟢 USER ROUTES
router.post("/request", protect, requestReturn);
router.get("/my-returns", protect, getMyReturns); // Add this line!

// 🔴 ADMIN ROUTES
router.get("/admin/all", protect, adminOnly, getAllReturns);
router.put("/admin/:id/status", protect, adminOnly, updateReturnStatus);

export default router;