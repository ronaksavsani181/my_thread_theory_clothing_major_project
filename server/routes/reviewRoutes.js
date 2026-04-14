import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import protect from "../middleware/authMiddleware.js";
import { addReview, getReviewsByProduct } from "../controllers/reviewController.js";

const router = express.Router();

// Setup __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure Upload Directory Exists
const uploadDir = path.join(__dirname, "../public/assets/reviewImages");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Restrict to max 4 images
const upload = multer({ storage: storage });

// Routes
router.get("/:productId", getReviewsByProduct);
router.post("/:productId", protect, upload.array("images", 4), addReview);

export default router;