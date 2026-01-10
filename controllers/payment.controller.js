import CryptoJS from "crypto-js";
import { v4 as uuidv4 } from "uuid";

// TEMP STORAGE (replace with DB later)
const orders = new Map();

// ---------- HELPERS ----------

const encryptData = (data, merchantKey) => {
  const key = CryptoJS.enc.Hex.parse(merchantKey);

  const encrypted = CryptoJS.AES.encrypt(data, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });

  return encrypted.toString();
};

const decryptData = (encryptedData, merchantKey) => {
  const key = CryptoJS.enc.Hex.parse(merchantKey);

  const formatted = encryptedData.replace(/\s/g, "+");
  const decoded = CryptoJS.enc.Base64.parse(formatted);

  const decrypted = CryptoJS.AES.decrypt({ ciphertext: decoded }, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
};

// ---------- CONTROLLERS ----------

// 1. CREATE ORDER
export const createOrder = async (req, res) => {
  const { amount } = req.body;

  const orderId = uuidv4();

  orders.set(orderId, {
    orderId,
    amount,
    status: "PENDING",
  });

  res.json({ orderId, amount });
};

// 2. INITIATE PAYMENT
export const initiatePayment = async (req, res) => {
  const { orderId } = req.body;

  const order = orders.get(orderId);
  if (!order) return res.status(404).json({ message: "Order not found" });

  const payload = JSON.stringify({
    terminalId: process.env.VEGAA_TERMINAL_ID,
    terminalPass: process.env.VEGAA_TERMINAL_PASS,
    amount: order.amount,
    orderId,
    callbackUrl:
      "https://1xppdrp0-8000.inc1.devtunnels.ms//payment/vegaa/callback",
  });

  const encrypted = encryptData(payload, process.env.VEGAA_MERCHANT_KEY);

  const paymentUrl = `${process.env.VEGAA_URL}?data=${encodeURIComponent(
    encrypted
  )}&termId=${process.env.VEGAA_TERMINAL_ID}`;

  res.json({ paymentUrl });
};

// 3. VEGAA CALLBACK
export const vegaaCallback = async (req, res) => {
  try {
    const raw = Object.keys(req.body)[0]; // gateway format

    const data = raw.split("&termId=")[0];
    const decoded = decodeURIComponent(data);

    const decrypted = decryptData(decoded, process.env.VEGAA_MERCHANT_KEY);
    const result = JSON.parse(decrypted);

    const { orderId, responseCode } = result;

    if (orders.has(orderId)) {
      orders.get(orderId).status = responseCode === "00" ? "SUCCESS" : "FAILED";
    }

    res.send("OK");
  } catch (err) {
    console.error("Vegaa callback error:", err);
    res.send("FAIL");
  }
};

// 4. STATUS CHECK
export const paymentStatus = async (req, res) => {
  const { orderId } = req.params;

  const order = orders.get(orderId);
  if (!order) return res.status(404).json({ message: "Not found" });

  res.json(order);
};
