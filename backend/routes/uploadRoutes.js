// routes/uploadRoutes.js
import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { authenticate } from "../middleware/auth.js";
import ctrl from "../controllers/admin/mediaController.js"; // Reuse existing media controller
import Media from "../models/Media.js";
import StorageService from "../services/storage.js";

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

// Delete uploaded media by owner (users)
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res
        .status(404)
        .json({ success: false, error: { message: "Media not found" } });
    }

    // Only uploader (or admin via admin routes) can delete here
    if (String(media.uploaderId) !== String(req.user._id || req.user.id)) {
      return res
        .status(403)
        .json({ success: false, error: { message: "Forbidden" } });
    }

    // Remove file(s) from storage first (best-effort)
    try {
      await StorageService.deleteFile(media.storageType, media.storageKey);
    } catch (e) {
      // Continue even if storage deletion fails
      console.warn("Failed to delete storage file for user media:", e.message);
    }

    await Media.findByIdAndDelete(media._id);
    res.status(204).end();
  })
);
