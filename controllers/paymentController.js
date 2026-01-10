import crypto from "crypto";
import axios from "axios";
import { vegaahConfig } from "../config/vegaahConfig.js";

// ✅ SIGNATURE (as per your successful test → SHA256 HASH, not HMAC)
const generateSignature = (referenceId, amount, currency) => {
  const data = `${referenceId}|${vegaahConfig.terminalId}|${vegaahConfig.terminalPass}|${vegaahConfig.merchantKey}|${amount}|${currency}`;

  return crypto.createHash("sha256").update(data).digest("hex");
};

// 1️⃣ INITIATE PAYMENT
export const initiatePayment = async (req, res) => {
  try {
    const {
      amount = "1000.00",
      email = "test@gmail.com",
      description = "Order Payment",
    } = req.body;

    const referenceId = `ORDER-${Date.now()}`;
    const currency = "INR";

    const signature = generateSignature(referenceId, amount, currency);

    const payload = {
      referenceId,
      terminalId: vegaahConfig.terminalId,
      password: vegaahConfig.terminalPass,
      signature,
      paymentType: "1",
      amount,
      currency,
      order: {
        orderId: referenceId,
        description,
      },
      customer: {
        customerEmail: email,
        billingAddressStreet: "Patia",
        billingAddressCity: "Bhubaneswar",
        billingAddressState: "Odisha",
        billingAddressPostalCode: "751024",
        billingAddressCountry: "IN",
      },
      additionalDetails: {
        userData: JSON.stringify({
          receiptUrl: `${vegaahConfig.callbackUrl}/payment/callback`,
        }),
      },
    };

    console.log("📤 Vegaah Payload:", payload);

    const response = await axios.post(
      "https://test-vegaah.concertosoft.com/vegaahpayments/v2/payments/pay-request",
      payload,
      { headers: { "Content-Type": "application/json" } }
    );

    console.log("📥 Vegaah Response:", response.data);

    if (response.data.responseCode === "001") {
      const paymentUrl =
        response.data.paymentLink.linkUrl + response.data.transactionId;

      return res.json({
        success: true,
        paymentUrl,
        transactionId: response.data.transactionId,
        message: response.data.responseDescription,
      });
    }

    return res.status(400).json({
      success: false,
      error: response.data.responseDescription,
      code: response.data.responseCode,
    });
  } catch (error) {
    console.error("❌ Vegaah Error:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
};

// 2️⃣ Handle Vegaah callback
export const handleVegaahCallback = async (req, res) => {
  try {
    const { encryptedResponse } = req.body;
    if (!encryptedResponse) return res.status(400).send("No data received");

    // Decrypt response (example, adjust as per Vegaah docs)
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(vegaahConfig.secretKey, "hex"),
      Buffer.from(vegaahConfig.iv, "hex")
    );
    let decrypted = decipher.update(encryptedResponse, "base64", "utf8");
    decrypted += decipher.final("utf8");

    const paymentData = JSON.parse(decrypted);
    console.log("💰 Vegaah Callback Data:", paymentData);

    res.status(200).send("SUCCESS");
  } catch (err) {
    console.error("Error in Vegaah callback:", err.message);
    res.status(500).send("ERROR");
  }
};