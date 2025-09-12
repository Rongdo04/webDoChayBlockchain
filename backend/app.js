// app.js
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/admin/index.js";
import taxonomyRoutes from "./routes/taxonomyRoutes.js";
import recipesRoutes from "./routes/recipesRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import reportsRoutes from "./routes/reportsRoutes.js";
import postsRoutes from "./routes/postsRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import config from "./config/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(
  cors({
    origin: config.CORS.ALLOWED_ORIGINS,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Static file serving for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Request logging middleware (only in non-test environments)
if (process.env.NODE_ENV !== "test") {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/taxonomy", taxonomyRoutes);
app.use("/api/recipes", recipesRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/posts", postsRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Authentication API Server is running",
    timestamp: new Date().toISOString(),
    database: "MongoDB Connected",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "MERN Authentication API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
    },
  });
});

// Unified 404 & error handlers
app.use(notFound);
app.use(errorHandler);

export default app;
