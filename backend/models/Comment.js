// models/Comment.js
import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null, // null means no rating given
    },
    status: {
      type: String,
      enum: ["pending", "approved", "hidden"],
      default: "pending",
      index: true,
    },
    recipeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true,
    },
    // Admin moderation info
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    moderatedAt: {
      type: Date,
      default: null,
    },
    moderationReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
commentSchema.index({ recipeId: 1, status: 1, createdAt: -1 });
commentSchema.index({ userId: 1, createdAt: -1 });
commentSchema.index({ status: 1, createdAt: -1 });
commentSchema.index({ parentId: 1, status: 1 });

// Virtual for replies
commentSchema.virtual("replies", {
  ref: "Comment",
  localField: "_id",
  foreignField: "parentId",
});

// Methods
commentSchema.methods.isApproved = function () {
  return this.status === "approved";
};

commentSchema.methods.hasRating = function () {
  return this.rating !== null && this.rating !== undefined;
};

// Static methods for admin
commentSchema.statics.getStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const result = {
    pending: 0,
    approved: 0,
    hidden: 0,
    total: 0,
  };

  stats.forEach((stat) => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });

  return result;
};

// Get rating statistics for a recipe
commentSchema.statics.getRecipeRatingStats = async function (recipeId) {
  const stats = await this.aggregate([
    {
      $match: {
        recipeId: new mongoose.Types.ObjectId(recipeId),
        status: "approved",
        rating: { $exists: true, $ne: null },
      },
    },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$rating" },
        totalRatings: { $sum: 1 },
        ratingDistribution: {
          $push: "$rating",
        },
      },
    },
  ]);

  if (stats.length === 0) {
    return { avgRating: 0, totalRatings: 0 };
  }

  const result = stats[0];
  return {
    avgRating: Math.round(result.avgRating * 10) / 10, // Round to 1 decimal
    totalRatings: result.totalRatings,
  };
};

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
