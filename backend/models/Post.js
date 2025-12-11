// models/Post.js
import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    tag: {
      type: String,
      required: true,
      enum: ["Kinh nghiệm", "Hỏi đáp", "Món mới", "Chia sẻ", "Tư vấn"],
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "published", "hidden"],
      default: "published",
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    likesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
      min: 0,
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
    moderationNote: {
      type: String,
      default: "",
    },
    // Metadata
    ipAddress: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
postSchema.index({ createdAt: -1 });
postSchema.index({ tag: 1, createdAt: -1 });
postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ userId: 1, createdAt: -1 });

// Virtual populate for user details
postSchema.virtual("user", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

// Method to check if user liked this post
postSchema.methods.isLikedBy = function (userId) {
  return this.likes.includes(userId);
};

// Method to toggle like
postSchema.methods.toggleLike = function (userId) {
  const userIdStr = userId.toString();
  const likeIndex = this.likes.findIndex(
    (like) => like.toString() === userIdStr
  );

  if (likeIndex === -1) {
    // Add like
    this.likes.push(userId);
    this.likesCount += 1;
    return true; // liked
  } else {
    // Remove like
    this.likes.splice(likeIndex, 1);
    this.likesCount -= 1;
    return false; // unliked
  }
};

// Static method to get available tags
postSchema.statics.getTags = function () {
  return ["Kinh nghiệm", "Hỏi đáp", "Món mới", "Chia sẻ", "Tư vấn"];
};

// Static method to get post statistics
postSchema.statics.getStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const result = {
    total: 0,
    pending: 0,
    published: 0,
    hidden: 0,
  };

  stats.forEach((stat) => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });

  // Get recent posts count (last 7 days)
  const recentCount = await this.countDocuments({
    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  });
  result.recent = recentCount;

  return result;
};

// Static method to get tag statistics
postSchema.statics.getTagStats = async function () {
  return this.aggregate([
    {
      $group: {
        _id: "$tag",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

// Static method to get status statistics
postSchema.statics.getStatusStats = async function () {
  return this.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);
};

// Transform output
postSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("Post", postSchema);
