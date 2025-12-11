// models/ViewLog.js
import mongoose from "mongoose";

const viewLogSchema = new mongoose.Schema(
  {
    recipeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      required: true,
      index: true,
    },
    viewedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    // Optional: track user who viewed (for analytics)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // Optional: track IP address (for unique views)
    ipAddress: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient date range queries
viewLogSchema.index({ recipeId: 1, viewedAt: -1 });
viewLogSchema.index({ viewedAt: -1 });

const ViewLog = mongoose.model("ViewLog", viewLogSchema);

export default ViewLog;

