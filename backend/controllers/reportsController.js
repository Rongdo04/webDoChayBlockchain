// controllers/reportsController.js
import Report from "../models/Report.js";

/**
 * Submit a new report
 * POST /api/reports
 */
export const submitReport = async (req, res) => {
  try {
    const { targetType, targetId, reason, description } = req.body;
    const reporterId = req.user._id; // Use _id instead of id

    // Validate input
    if (!targetType || !targetId || !reason) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "targetType, targetId và reason là bắt buộc",
        },
      });
    }

    // Validate targetType
    const validTargetTypes = ["recipe", "comment", "post"];
    if (!validTargetTypes.includes(targetType)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_TARGET_TYPE",
          message: "targetType phải là recipe, comment hoặc post",
        },
      });
    }

    // Check if user already reported this target
    const existingReport = await Report.findOne({
      reporterId,
      targetType,
      targetId,
    });

    if (existingReport) {
      return res.status(409).json({
        success: false,
        error: {
          code: "ALREADY_REPORTED",
          message: "Bạn đã báo cáo nội dung này rồi",
        },
      });
    }

    // Create new report
    const report = new Report({
      reporterId,
      targetType,
      targetId,
      reason,
      description,
      status: "pending",
      createdAt: new Date(),
    });

    await report.save();

    res.status(201).json({
      success: true,
      data: {
        id: report._id,
        message: "Báo cáo đã được gửi thành công",
      },
    });
  } catch (error) {
    console.error("Submit report error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Có lỗi xảy ra khi gửi báo cáo",
      },
    });
  }
};

/**
 * Get user's reports
 * GET /api/reports/user
 */
export const getUserReports = async (req, res) => {
  try {
    const reporterId = req.user._id; // Use _id instead of id
    const { page = 1, limit = 10, status } = req.query;

    // Build query
    const query = { reporterId };
    if (status) {
      query.status = status;
    }

    // Get reports with pagination
    const skip = (page - 1) * limit;
    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const total = await Report.countDocuments(query);

    res.json({
      success: true,
      data: {
        items: reports,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get user reports error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Có lỗi xảy ra khi lấy danh sách báo cáo",
      },
    });
  }
};
