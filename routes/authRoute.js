import express from "express";
import passport from "passport";
import {
  register,
  login,
  sendOtp,
  verifyOtp,
  me,
  socialSuccess,
} from "../controllers/auth.controller.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";

const router = express.Router();

// router.post("/register", register);
// router.post("/login", login);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  socialSuccess
);

router.get("/me", isAuthenticated, me);

export default router;
