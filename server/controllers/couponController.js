import Coupon from "../models/Coupon.js";

// 🎟 CREATE COUPON (ADMIN)
export const createCoupon = async (req, res) => {
  try {
    const { code, discountPercent, expiryDate } = req.body;

    if (!code || !discountPercent || !expiryDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const couponExists = await Coupon.findOne({ code });
    if (couponExists) {
      return res.status(400).json({ message: "Coupon already exists" });
    }

    const coupon = await Coupon.create({
      code,
      discountPercent,
      expiryDate,
    });

    res.status(201).json({
      message: "Coupon created successfully",
      coupon,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// 🎟 VALIDATE COUPON (USER)
export const validateCoupon = async (req, res) => {
  try {
    const { code, totalAmount } = req.body;

    const coupon = await Coupon.findOne({ code });

    if (!coupon) {
      return res.status(400).json({ message: "Invalid coupon code" });
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ message: "Coupon expired" });
    }

    const discount =
      (totalAmount * coupon.discountPercent) / 100;

    const finalAmount = totalAmount - discount;

    res.json({
      valid: true,
      discount,
      finalAmount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// 📋 GET ALL COUPONS (ADMIN)
export const getAllCoupons = async (req, res) => {
  const coupons = await Coupon.find().sort({
    createdAt: -1,
  });

  res.json(coupons);
};

// 🗑 DELETE COUPON
export const deleteCoupon = async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);

  res.json({
    message: "Coupon deleted",
  });
};
