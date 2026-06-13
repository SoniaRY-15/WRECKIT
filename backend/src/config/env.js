// Supaya lebih gampang aj manage env

import dotenv from "dotenv";

dotenv.config();

export const config = {
  server: {
    nodeEnv: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT, 10) || 5000,
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  ai: {
    serviceUrl: process.env.AI_SERVICE_URL || "http://localhost:8000",
    timeout: parseInt(process.env.AI_SERVICE_TIMEOUT, 10) || 30000,
  },
};

// Validate critical env variables
const requiredEnvVars = ["DATABASE_URL", "AI_SERVICE_URL"];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`⚠️ Warning: ${envVar} is not set in .env`);
  }
}
