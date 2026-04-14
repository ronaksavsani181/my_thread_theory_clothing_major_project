import User from "../models/User.js";

// 🟢 GET USER PROFILE
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟢 UPDATE USER PROFILE
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if email is being changed and if it's already taken
    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists) {
        return res.status(400).json({ message: "Email is already in use by another account." });
      }
    }

    // Update fields
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    
    // Update Address
    user.address = {
      street: req.body.address?.street || user.address?.street || "",
      city: req.body.address?.city || user.address?.city || "",
      state: req.body.address?.state || user.address?.state || "",
      postalCode: req.body.address?.postalCode || user.address?.postalCode || "",
      country: req.body.address?.country || user.address?.country || "",
    };

    const updatedUser = await user.save();

    res.json({
      message: "Profile updated successfully.",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        role: updatedUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};