import express from "express";
import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/roleMiddleware.js";
import { addProduct, getProducts, getProductById, getCategoryCounts,updateProduct,deleteProduct } from "../controllers/productController.js";

const router = express.Router();

// 🔓 USER – GET PRODUCTS
router.get("/", getProducts);
router.get("/category-counts", getCategoryCounts);
router.get("/:id", getProductById);


// 🔒 ADMIN – ADD PRODUCT
router.post("/add-product", protect, adminOnly, addProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

export default router;
