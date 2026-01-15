import express from "express";
import {
  getAllCategories,
  getAllProducts,
  getProductById,
  getProductsByCategory,
  upsertProduct,
} from "../controllers/product.controller.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/categories/list", getAllCategories);
router.get("/categories/:slug", getProductsByCategory);
router.get("/:id", getProductById);
// router.post("/", upsertProduct); // insert or update

export default router;
