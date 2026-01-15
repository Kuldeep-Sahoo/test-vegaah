import { Product } from "../models/product.model.js";

export const getAllProducts = async (req, res) => {
  try {
    const category = req.query.category || null;

    const page = req.query.page ? parseInt(req.query.page) : null;
    const perPage = req.query.per_page ? parseInt(req.query.per_page) : null;

    let products;

    // ✅ case 1: no pagination → return ALL
    if (!page && !perPage) {
      products = await Product.getAll({ category });
    }
    // ✅ case 2: pagination
    else {
      const limit = perPage || 10;
      const offset = ((page || 1) - 1) * limit;

      products = await Product.getAll({ category, limit, offset });
    }

    res.json(products);
  } catch (err) {
    console.error("GET PRODUCTS ERROR 👉", err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};


export const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch product" });
  }
};

export const upsertProduct = async (req, res) => {
  try {
    const p = req.body;

    const product = {
      ...p,
      prices: JSON.stringify(p.prices),
      images: JSON.stringify(p.images),
      categories: JSON.stringify(p.categories),
      tags: JSON.stringify(p.tags),
      brands: JSON.stringify(p.brands),
      attributes: JSON.stringify(p.attributes),
      variations: JSON.stringify(p.variations),
      grouped_products: JSON.stringify(p.grouped_products),
      stock_availability: JSON.stringify(p.stock_availability),
      add_to_cart: JSON.stringify(p.add_to_cart),
      extensions: JSON.stringify(p.extensions),
    };

    const saved = await Product.upsert(product);

    res.json({
      message: "Product saved successfully",
      product: saved,
    });
  } catch (err) {
    console.error("UPSERT ERROR 👉", err); // VERY IMPORTANT
    res.status(500).json({ message: "Product save failed" });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Product.getAllCategories();
    res.json(categories);
  } catch (err) {
    console.error("GET CATEGORIES ERROR 👉", err);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const { slug } = req.params;

    const products = await Product.getByCategory(slug);

    res.json(products);
  } catch (err) {
    console.error("GET CATEGORY PRODUCTS ERROR 👉", err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};
