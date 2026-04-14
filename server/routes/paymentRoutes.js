import express from "express";
import protect from "../middleware/authMiddleware.js";
import { createRazorpayOrder,updatePaymentStatus,getMyPayments } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/create-order", protect, createRazorpayOrder);
router.post("/update-status", protect, updatePaymentStatus);
// USER – PAYMENT HISTORY
router.get("/my-payments", protect, getMyPayments);


export default router;
