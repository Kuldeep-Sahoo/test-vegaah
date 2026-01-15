import crypto from "crypto";
import { vegaahConfig } from "../config/vegaahConfig.js";

export const generateSignature = ({ referenceId, amount, currency }) => {
  if (!referenceId || !amount || !currency) {
    throw new Error("Signature generation failed: Missing required fields");
  }

  const data = `${referenceId}|${vegaahConfig.terminalId}|${vegaahConfig.terminalPass}|${vegaahConfig.merchantKey}|${amount}|${currency}`;

  return crypto.createHash("sha256").update(data).digest("hex");
};
