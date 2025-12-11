// models/Media.js
import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: [true, "Filename is required"],
      trim: true,
    },
    originalName: {
      type: String,
      required: [true, "Original name is required"],
      trim: true,
    },
    mimeType: {
      type: String,
      required: [true, "MIME type is required"],
      enum: [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "video/mp4",
        "video/webm",
        "video/mov",
        "video/avi",
        "video/quicktime", // common for .mov in browsers
        "video/x-msvideo", // common for .avi
      ],
      index: true,
    },
    size: {
      type: Number,
      required: [true, "File size is required"],
      min: [1, "File size must be positive"],
      max: [100 * 1024 * 1024, "File size cannot exceed 100MB"], // 100MB limit
    },
    type: {
      type: String,
      required: true,
      enum: ["image", "video"],
      index: true,
    },
    url: {
      type: String,
      required: [true, "File URL is required"],
      trim: true,
    },
    thumbnailUrl: {
      type: String,
      trim: true,
      default: null,
    },
    alt: {
      type: String,
      trim: true,
      maxlength: [500, "Alt text cannot exceed 500 characters"],
      default: "",
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: [50, "Tag cannot exceed 50 characters"],
      },
    ],
    uploaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    uploaderName: {
      type: String,
      required: true,
    },
    storageType: {
      type: String,
      enum: ["local", "s3"],
      required: true,
      default: "local",
    },
    storageKey: {
      type: String,
      required: true, // S3 key or local path
    },
    metadata: {
      width: { type: Number },
      height: { type: Number },
      duration: { type: Number }, // for videos
      format: { type: String },
    },
    status: {
      type: String,
      enum: ["uploading", "processing", "ready", "failed"],
      default: "ready",
      index: true,
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
mediaSchema.index({ type: 1, status: 1 });
mediaSchema.index({ uploaderId: 1, createdAt: -1 });
mediaSchema.index({ tags: 1 });
mediaSchema.index({ createdAt: -1 });
mediaSchema.index({ filename: "text", originalName: "text", alt: "text" });

// Virtual for media category
mediaSchema.virtual("category").get(function () {
  return this.type;
});

// Virtual for file extension
mediaSchema.virtual("extension").get(function () {
  return this.filename.split(".").pop().toLowerCase();
});

// Methods
mediaSchema.methods.isImage = function () {
  return this.type === "image";
};

mediaSchema.methods.isVideo = function () {
  return this.type === "video";
};

mediaSchema.methods.canDelete = function (userId, userRole) {
  return (
    userRole === "admin" || this.uploaderId.toString() === userId.toString()
  );
};

mediaSchema.methods.incrementUsage = function () {
  this.usageCount += 1;
  this.lastUsedAt = new Date();
  return this.save();
};

// Static methods
mediaSchema.statics.findByType = function (type) {
  return this.find({ type, status: "ready" });
};

mediaSchema.statics.findByUploader = function (uploaderId) {
  return this.find({ uploaderId, status: "ready" });
};

mediaSchema.statics.getStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
        totalSize: { $sum: "$size" },
        avgSize: { $avg: "$size" },
      },
    },
  ]);

  const result = {
    total: 0,
    totalSize: 0,
    image: { count: 0, size: 0 },
    video: { count: 0, size: 0 },
  };

  stats.forEach((stat) => {
    result[stat._id] = {
      count: stat.count,
      size: stat.totalSize,
      avgSize: Math.round(stat.avgSize),
    };
    result.total += stat.count;
    result.totalSize += stat.totalSize;
  });

  return result;
};

mediaSchema.statics.cleanup = async function (daysOld = 30) {
  const cutoff = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
  return this.deleteMany({
    status: { $in: ["failed", "uploading"] },
    createdAt: { $lt: cutoff },
  });
};

const Media = mongoose.model("Media", mediaSchema);

export default Media;
