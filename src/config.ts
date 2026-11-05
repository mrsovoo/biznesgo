import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  botToken: process.env.BOT_TOKEN || "",
  databaseUrl: process.env.DATABASE_URL || "",
  baseUrl: process.env.BASE_URL || "http://localhost:3000",
  renderExternalUrl: process.env.RENDER_EXTERNAL_URL || "https://biznesgo.onrender.com",
  isProduction: process.env.NODE_ENV === "production" || Boolean(process.env.RENDER),
};
