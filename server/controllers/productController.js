import Product from "../models/Product.js";
import ProductHistory from "../models/ProductHistory.js";

// ➕ ADD PRODUCT (ADMIN)
export const addProduct = async (req, res) => {
  try {
    const {
      title,
      brand,
      description,
      price,
      category,
      sizesAvailable,
      stock,
      season,
      mainimage1,
      image2,
      image3,
      image4,
      model3Durl,
      // 🌟 ADDED NEW ADMIN TAGS
      isNewArrival,
      isBestSeller
    } = req.body;

    if (!title || !brand || !price || !category || !mainimage1 || !image2 || !image3 || !image4 || stock === undefined) {
      return res.status(400).json({ message: "Required fields missing (Make sure Brand is included)" });
    }

    const product = await Product.create({
      title,
      brand,
      description,
      price,
      category,
      sizesAvailable,
      stock,
      season,
      mainimage1,
      image2,
      image3,
      image4,
      model3Durl,
      isOutOfStock: stock === 0,
      // 🌟 SAVE NEW TAGS (Defaults to false if not provided)
      isNewArrival: isNewArrival || false,
      isBestSeller: isBestSeller || false,
    });

    res.status(201).json({
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📦 GET ALL PRODUCTS (USER SIDE)
export const getProducts = async (req, res) => {
  try {
    const { category, brand } = req.query;

    let query = {};

    if (category) {
      query.category = {
        $regex: `^${category}$`,
        $options: "i",
      };
    }
    if (brand) {
      query.brand = {
        $regex: `^${brand}$`,
        $options: "i",
      };
    }

    const products = await Product.find(query);

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 🟢 Update all fields
    product.title = req.body.title ?? product.title;
    product.brand = req.body.brand ?? product.brand;
    product.description = req.body.description ?? product.description;
    product.price = req.body.price ?? product.price;
    product.category = req.body.category ?? product.category;
    product.sizesAvailable = req.body.sizesAvailable ?? product.sizesAvailable;
    product.stock = req.body.stock ?? product.stock;
    product.season = req.body.season ?? product.season;
    product.mainimage1 = req.body.mainimage1 ?? product.mainimage1;
    product.image2 = req.body.image2 ?? product.image2;
    product.image3 = req.body.image3 ?? product.image3;
    product.image4 = req.body.image4 ?? product.image4; 
    product.model3Durl = req.body.model3Durl ?? product.model3Durl;
    
    // 🌟 UPDATE NEW ADMIN TAGS
    product.isNewArrival = req.body.isNewArrival ?? product.isNewArrival;
    product.isBestSeller = req.body.isBestSeller ?? product.isBestSeller;

    // 🟢 Auto stock status
    product.isOutOfStock = product.stock === 0;

    await product.save();

    // 📝 History log
    await ProductHistory.create({
      productId: product._id,
      action: "UPDATE",
      changedBy: req.user._id,
    });

    res.json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.deleteOne();

    await ProductHistory.create({
      productId: product._id,
      action: "DELETE",
      changedBy: req.user._id,
    });

    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.json(product);
};

// 📊 CATEGORY PRODUCT COUNT
export const getCategoryCounts = async (req, res) => {
  try {
    const counts = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json(counts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};