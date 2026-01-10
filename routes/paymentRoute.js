// routes/paymentRoute.js
import express from "express";
import {
  initiatePayment,
  handleVegaahCallback,
} from "../controllers/paymentController.js";

const router = express.Router();

// Route: POST /payment/initiate
router.post("/initiate", initiatePayment);
router.post("/callback", handleVegaahCallback);

export default router;
