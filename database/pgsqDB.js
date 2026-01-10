import pkg from "pg";
import "dotenv/config";

const { Pool } = pkg;

export const pool = new Pool({
  host: process.env.PG_HOST || "localhost",
  user: process.env.PG_USER || "postgres",
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE || "mydb",
  port: 5432,
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log("PostgreSQL connected successfully ✅");
    client.release();
  } catch (err) {
    console.error("PostgreSQL connection error ❌", err);
  }
};

export default connectDB;
