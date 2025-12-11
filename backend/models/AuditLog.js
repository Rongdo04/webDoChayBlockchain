// models/AuditLog.js
import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        "create",
        "update",
        "delete",
        "publish",
        "unpublish",
        "reject",
        "bulk",
        "bulk_delete",
        "bulk_update",
      ],
      index: true,
    },
    entityType: {
      type: String,
      required: true,
      enum: [
        "recipe",
        "user",
        "system",
        "settings",
        "media",
        "comment",
        "post",
      ],
      default: "recipe",
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    userRole: {
      type: String,
      required: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes for efficient queries
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });

// Static methods
auditLogSchema.statics.logAction = async function (
  action,
  entityId,
  user,
  metadata = {},
  req = null
) {
  const logEntry = {
    action,
    entityType: "recipe",
    entityId,
    userId: user._id || user.id,
    userEmail: user.email,
    userRole: user.role,
    metadata,
  };

  if (req) {
    logEntry.ipAddress = req.ip || req.connection.remoteAddress;
    logEntry.userAgent = req.get("User-Agent");
  }

  return this.create(logEntry);
};

auditLogSchema.statics.getByDateRange = function (from, to, filters = {}) {
  const query = {
    createdAt: {
      $gte: new Date(from),
      $lte: new Date(to),
    },
    ...filters,
  };

  return this.find(query)
    .populate("userId", "name email")
    .sort({ createdAt: -1 });
};

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
