// controllers/admin/reports.controller.js
import * as reportsRepo from "../../repositories/reports.repo.js";

// GET /api/admin/reports - List reports with filtering and pagination
export async function listReports(req, res) {
  try {
    const result = await reportsRepo.listReports(req.query);

    res.json({
      success: true,
      data: {
        items: result.items,
        pagination: {
          hasNext: result.hasNext,
          nextCursor: result.nextCursor,
        },
      },
    });
  } catch (error) {
    console.error("List reports error:", error);

    res.status(error.status || 500).json({
      success: false,
      error: {
        code: error.code || "INTERNAL_ERROR",
        message: error.message || "Internal server error",
      },
    });
  }
}

// GET /api/admin/reports/:id - Get single report with full details
export async function getReport(req, res) {
  try {
    const { id } = req.params;
    const report = await reportsRepo.getReport(id);

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error("Get report error:", error);

    res.status(error.status || 500).json({
      success: false,
      error: {
        code: error.code || "INTERNAL_ERROR",
        message: error.message || "Internal server error",
      },
    });
  }
}

// POST /api/admin/reports/:id/resolve - Resolve report
export async function resolveReport(req, res) {
  try {
    const { id } = req.params;
    const { resolution, note } = req.body;

    const resolvedReport = await reportsRepo.resolveReport(
      id,
      req.user,
      { action: resolution, note },
      req
    );

    res.json({
      success: true,
      data: resolvedReport,
      message: `Report resolved with action: ${resolution}`,
    });
  } catch (error) {
    console.error("Resolve report error:", error);

    res.status(error.status || 500).json({
      success: false,
      error: {
        code: error.code || "INTERNAL_ERROR",
        message: error.message || "Internal server error",
      },
    });
  }
}

// GET /api/admin/reports/stats - Get report statistics
export async function getReportStats(req, res) {
  try {
    const stats = await reportsRepo.getReportStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get report stats error:", error);

    res.status(error.status || 500).json({
      success: false,
      error: {
        code: error.code || "INTERNAL_ERROR",
        message: error.message || "Internal server error",
      },
    });
  }
}

// DELETE /api/admin/reports/:id - Delete a report
export async function deleteReport(req, res) {
  try {
    const { id } = req.params;
    const result = await reportsRepo.deleteReport(id, req.user, req);

    res.json({
      success: true,
      data: { id, ...result },
      message: "Report deleted",
    });
  } catch (error) {
    console.error("Delete report error:", error);

    res.status(error.status || 500).json({
      success: false,
      error: {
        code: error.code || "INTERNAL_ERROR",
        message: error.message || "Internal server error",
      },
    });
  }
}

// PUT /api/admin/reports/:id/status - Update report status
export async function updateReportStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const updated = await reportsRepo.updateReportStatus(
      id,
      status,
      req.user?._id,
      notes
    );
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Report not found",
        },
      });
    }
    res.json({
      success: true,
      data: updated,
      message: `Trạng thái báo cáo đã được cập nhật: ${status}`,
    });
  } catch (error) {
    console.error("Update report status error:", error);
    res.status(error.status || 500).json({
      success: false,
      error: {
        code: error.code || "INTERNAL_ERROR",
        message: error.message || "Internal server error",
      },
    });
  }
}

export default {
  listReports,
  getReport,
  resolveReport,
  getReportStats,
  deleteReport,
  updateReportStatus,
};
