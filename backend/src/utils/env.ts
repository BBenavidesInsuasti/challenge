import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const env = {
  PORT: parseInt(process.env.PORT || "3001", 10),
  JWT_SECRET: process.env.JWT_SECRET || "dev-secret-change-in-production",
  NASA_API_KEY: process.env.NASA_API_KEY || "DEMO_KEY",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  DATABASE_PATH: process.env.DATABASE_PATH || "./data/app.db",
  NODE_ENV: process.env.NODE_ENV || "development",
};
