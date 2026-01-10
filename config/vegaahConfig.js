// config/vegaahConfig.js
import "dotenv/config";

export const vegaahConfig = {
  terminalId: process.env.VEGAAH_TERMINAL_ID,
  terminalPass: process.env.VEGAAH_TERMINAL_PASS,
  merchantKey: process.env.VEGAAH_MERCHANT_KEY,
  callbackUrl: process.env.VEGAAH_CALLBACK_URL,
};
