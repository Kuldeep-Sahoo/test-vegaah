import express from "express";
import "dotenv/config";
import cors from "cors";
import "./config/passport.js";
import connectDB from "./database/pgsqDB.js";
import authRoute from "./routes/authRoute.js";
import paymentRoute from "./routes/paymentRoute.js";
import productRoute from "./routes/productRoute.js";
import orderRoute from "./routes/orderRoute.js";
import { swaggerUiServe, swaggerUiSetup } from "./utils/swagger.js";

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

app.use(cors({ origin: "*", credentials: true }));

app.use("/auth", authRoute);
app.use("/payment", paymentRoute);
app.use("/products", productRoute);
app.use("/orders", orderRoute);

// Swagger Documentation
app.use("/api-docs", swaggerUiServe, swaggerUiSetup);

app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server running at http://localhost:${PORT}`);
});
