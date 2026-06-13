import express from "express";
// import cors from "cors";
import { config } from "./config/env.js";
import { errorHandler, requestLogger } from "./middleware/errorHandler.js";
import accountRoutes from "./routes/accountRoutes.js";

const app = express();

// Request logging
app.use(requestLogger);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/api/account", accountRoutes);

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    environment: config.server.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.path} does not exist`,
  });
});

// middleware
app.use(errorHandler);

export default app;
