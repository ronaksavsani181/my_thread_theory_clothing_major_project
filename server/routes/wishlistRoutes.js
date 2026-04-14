import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from "../controllers/wishlistController.js";

const router = express.Router();

router.post("/", protect, addToWishlist);
router.delete("/:productId", protect, removeFromWishlist);
router.get("/", protect, getWishlist);

export default router;
