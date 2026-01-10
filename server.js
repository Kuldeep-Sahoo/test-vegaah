import express from "express";
import "dotenv/config";
import cors from "cors";
import "./config/passport.js";
import connectDB from "./database/pgsqDB.js";
import authRoute from "./routes/authRoute.js";
import paymentRoute from "./routes/paymentRoute.js";

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

app.use(cors({ origin: "*", credentials: true }));

app.use("/auth", authRoute);
app.use("/payment", paymentRoute);

app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server running at http://localhost:${PORT}`);
});
