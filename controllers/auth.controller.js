import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/user.model.js";
import { sendOtpMail } from "../services/mail.service.js";
import { generateOTP } from "../utils/otp.js";

const generateToken = (user) =>
  jwt.sign({ id: user.id, email: user.email }, process.env.SECRET_KEY, {
    expiresIn: process.env.TOKEN_EXPIRE,
  });

/// ================= REGISTER =================
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "All fields required" });

    const exist = await User.findByEmail(email);
    if (exist) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    const token = generateToken(user);
    res.status(201).json({ success: true, token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Register failed" });
  }
};

/// ================= LOGIN =================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "All fields required" });

    const user = await User.findByEmail(email);
    if (!user || !user.password)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    await User.setLoggedIn(user.id, true);

    const token = generateToken(user);
    res.json({ success: true, token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
};

/// ================= SEND OTP =================
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    let user = await User.findByEmail(email);

    if (!user) {
      user = await User.create({
        username: null,
        email,
        password: null,
      });
    }

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    await User.saveOTP(email, otp, expiry);

    await sendOtpMail(email, otp);

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "OTP send failed" });
  }
};

/// ================= VERIFY OTP =================
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findByEmail(email);
    if (!user || user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (new Date(user.otp_expiry) < new Date())
      return res.status(400).json({ message: "OTP expired" });

    await User.verifyUser(email);
    await User.setLoggedIn(user.id, true);

    const updatedUser = await User.findById(user.id);

    const token = generateToken(updatedUser);
    res.json({ success: true, token, user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "OTP verification failed" });
  }
};

/// ================= SOCIAL SUCCESS =================
export const socialSuccess = (req, res) => {
  try {
    const token = generateToken(req.user);
    res.redirect(`${process.env.CLIENT_URL}/auth-success?token=${token}`);
  } catch (err) {
    res.redirect(`${process.env.CLIENT_URL}/login?error=social_failed`);
  }
};

/// ================= ME =================
export const me = (req, res) => {
  res.json({
    success: true,
    user: req.user,
    message: "User Authenticated Successfully",
  });
};
