import express from "express";
import User from "../models/User.js";
import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/roleMiddleware.js";
import { updateUserRole } from "../controllers/adminController.js"; 
// 🟢 IMPORT NEW PROFILE CONTROLLERS
import { getUserProfile, updateUserProfile } from "../controllers/userController.js";
import { toggleUserBlock } from "../controllers/adminController.js";
const router = express.Router();

// 🟢 USER PROFILE ROUTES
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);


// 🟢 GET ALL USERS (ADMIN)
router.get("/admin/all", protect, adminOnly, async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

// 👑 UPDATE ROLE (ADMIN)
router.put("/role/:id", protect, adminOnly, updateUserRole);

// 🚫 BLOCK / UNBLOCK (ADMIN)
router.put("/block/:id", protect, adminOnly, toggleUserBlock ,async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  user.isBlocked = !user.isBlocked;
  await user.save();
  res.json({ message: "User status updated", isBlocked: user.isBlocked });
});

// 🗑️ DELETE (ADMIN)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
});

export default router;