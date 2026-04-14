import express from "express";
import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/roleMiddleware.js";
import { placeOrder, updateOrderStatus, getMyOrders, getAllOrders , getOrderById} from "../controllers/orderController.js";

const router = express.Router();

// USER
router.post("/place", protect, placeOrder);


router.get("/my-orders", protect, getMyOrders);
// ADMIN
router.get("/admin/all", protect, adminOnly, getAllOrders);
router.put("/status/:id", protect, adminOnly, updateOrderStatus);
// USER / ADMIN – ORDER DETAILS
router.get("/:id", protect, getOrderById);


export default router;
