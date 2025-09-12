// routes/uploadRoutes.js
import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { authenticate } from "../middleware/auth.js";
import ctrl from "../controllers/admin/mediaController.js"; // Reuse existing media controller

const router = Router();

// Apply authentication for all upload routes
router.use(authenticate);

// Upload single file for regular users
router.post(
  "/",
  ctrl.uploadMiddleware, // Reuse the upload middleware from admin
  asyncHandler(async (req, res) => {
    try {
      // Call the existing upload controller but allow regular users
      await ctrl.uploadFile(req, res);
    } catch (error) {
      console.error("User upload error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "UPLOAD_FAILED",
          message: "Failed to upload file",
          details: error.message,
        },
      });
    }
  })
);

export default router;
