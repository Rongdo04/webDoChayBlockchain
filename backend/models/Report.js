// models/Report.js
import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    targetType: {
      type: String,
      required: true,
      enum: ["comment", "recipe", "post"],
      index: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    reason: {
      type: String,
      required: true,
      enum: [
        "spam",
        "abuse",
        "inappropriate",
        "misinformation",
        "copyright",
        "other",
        // Vietnamese options
        "Spam",
        "Nội dung không phù hợp",
        "Ngôn từ tiêu cực",
        "Thông tin sai lệch",
        "Vi phạm bản quyền",
        "Khác",
      ],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "open", "reviewed", "resolved", "rejected"],
      default: "pending",
      index: true,
    },
    // Admin review fields
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    adminNotes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    // Resolution details
    resolution: {
      action: {
        type: String,
        enum: ["no_action", "hidden", "removed"],
        default: null,
      },
      note: {
        type: String,
        trim: true,
        maxlength: 500,
        default: "",
      },
      resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      resolvedAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ targetType: 1, status: 1 });
reportSchema.index({ reporterId: 1, createdAt: -1 });
reportSchema.index({ targetType: 1, targetId: 1 });

// Compound index to prevent duplicate reports
reportSchema.index(
  { reporterId: 1, targetType: 1, targetId: 1 },
  { unique: true }
);

// Virtual for target reference
reportSchema.virtual("target", {
  refPath: "targetType",
  localField: "targetId",
  foreignField: "_id",
  justOne: true,
});

reportSchema.virtual("targetModel").get(function () {
  return this.targetType === "comment" ? "Comment" : "Recipe";
});

// Methods
reportSchema.methods.isOpen = function () {
  return this.status === "open";
};

reportSchema.methods.isResolved = function () {
  return this.status === "resolved";
};

reportSchema.methods.canResolve = function () {
  return this.status === "open";
};

// Static methods for admin
reportSchema.statics.getStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  // Initialize all possible statuses
  const byStatus = {
    pending: 0,
    reviewed: 0,
    resolved: 0,
    rejected: 0,
    open: 0, // Legacy support
  };

  let total = 0;

  stats.forEach((stat) => {
    const status = stat._id;
    const count = stat.count;
    
    // Map status to byStatus object
    if (byStatus.hasOwnProperty(status)) {
      byStatus[status] = count;
      // Also map legacy 'open' status to 'pending' for frontend compatibility
      if (status === 'open') {
        byStatus.pending = count; // Replace, don't add
      }
    } else {
      // If status is not in byStatus, add it
      byStatus[status] = count;
    }
    
    total += count;
  });

  // Get recent reports count (last 7 days)
  const recentCount = await this.countDocuments({
    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  });

  return {
    total,
    byStatus,
    recent: recentCount,
  };
};

reportSchema.statics.getReasonStats = async function () {
  return this.aggregate([
    {
      $group: {
        _id: "$reason",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

reportSchema.statics.getTargetTypeStats = async function () {
  return this.aggregate([
    {
      $group: {
        _id: "$targetType",
        count: { $sum: 1 },
      },
    },
  ]);
};

const Report = mongoose.model("Report", reportSchema);

export default Report;
