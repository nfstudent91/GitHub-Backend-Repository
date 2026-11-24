import "reflect-metadata";
import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import { initializeDatabase } from "./config/database";
import apiRoutes from "./routes";
import { requestLogger } from "./middleware/logger.middleware";
import { errorHandler } from "./middleware/errorHandler.middleware";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger middleware (must be before routes)
app.use(requestLogger);

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "CRM API is running" });
});

// API routes
app.use("/api", apiRoutes);

// 404 handler
app.use((req, res) => {
  console.log(`❌ Route url: ${req.url}`);
  console.log(`❌ Route originalUrl: ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

