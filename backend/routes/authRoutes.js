// routes/authRoutes.js
import express from "express";
import authController from "../controllers/authController.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public routes (không cần authentication)
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// Protected routes (cần authentication)
router.use(authenticate); // Middleware này sẽ áp dụng cho tất cả routes phía dưới

router.get("/me", authController.getMe);
router.get("/verify", authController.verifyToken);
router.put("/profile", authController.updateProfile);
router.put("/change-password", authController.changePassword);

// Admin only routes
router.get("/stats", requireAdmin, authController.getStats);

export default router;
