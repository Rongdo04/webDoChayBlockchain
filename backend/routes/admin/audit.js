// routes/admin/audit.js
import { Router } from "express";
import { asyncHandler } from "../../middleware/errorHandler.js";
import * as auditController from "../../controllers/admin/audit.controller.js";

const router = Router();

// GET /api/admin/audit-logs - Get audit logs with pagination and filtering
router.get("/", asyncHandler(auditController.getAuditLogs));

// GET /api/admin/audit-logs/stats - Get audit statistics
router.get("/stats", asyncHandler(auditController.getAuditStats));

// GET /api/admin/audit-logs/export - Export audit logs
router.get("/export", asyncHandler(auditController.exportAuditLogs));

// GET /api/admin/audit-logs/entity/:entityType/:entityId - Get audit logs for specific entity
router.get(
  "/entity/:entityType/:entityId",
  asyncHandler(auditController.getEntityAuditLogs)
);

// DELETE /api/admin/audit-logs/cleanup - Clean up old audit logs
router.delete("/cleanup", asyncHandler(auditController.cleanupAuditLogs));

export default router;
