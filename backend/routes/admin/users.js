// routes/admin/users.js
import { Router } from "express";
import { asyncHandler } from "../../middleware/errorHandler.js";
import * as usersController from "../../controllers/admin/users.controller.js";
import {
  validateListUsers,
  validateUserId,
  validateUpdateUserRole,
  validateUpdateUserStatus,
} from "../../validators/admin/users.validator.js";

const router = Router();

// GET /api/admin/users - List users with filtering and pagination
router.get("/", validateListUsers, asyncHandler(usersController.listUsers));

// GET /api/admin/users/stats - Get user statistics
router.get("/stats", asyncHandler(usersController.getUserStats));

// GET /api/admin/users/:id - Get single user details
router.get("/:id", validateUserId, asyncHandler(usersController.getUser));

// PUT /api/admin/users/:id/role - Update user role
router.put(
  "/:id/role",
  validateUserId,
  validateUpdateUserRole,
  asyncHandler(usersController.updateUserRole)
);

// PUT /api/admin/users/:id/status - Update user status
router.put(
  "/:id/status",
  validateUserId,
  validateUpdateUserStatus,
  asyncHandler(usersController.updateUserStatus)
);

export default router;
