// models/Recipe.js
import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    summary: {
      type: String,
      trim: true,
      maxlength: [500, "Summary cannot exceed 500 characters"],
      default: "",
    },
    content: {
      type: String,
      trim: true,
      default: "",
    },
    ingredients: [
      {
        name: { type: String, required: true },
        amount: { type: String, default: "" },
        unit: { type: String, default: "" },
        notes: { type: String, default: "" },
      },
    ],
    steps: [
      {
        order: { type: Number, required: true },
        title: { type: String, default: "" },
        description: { type: String, required: true },
        duration: { type: Number, default: 0 }, // minutes
        temperature: { type: String, default: "" },
        images: [{ type: String }],
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    category: {
      type: String,
      trim: true,
      default: null,
    },
    prepTime: {
      type: Number,
      default: 0,
      min: [0, "Prep time cannot be negative"],
    },
    cookTime: {
      type: Number,
      default: 0,
      min: [0, "Cook time cannot be negative"],
    },
    servings: {
      type: Number,
      default: 0,
      min: [0, "Servings cannot be negative"],
    },
    images: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Media",
      },
    ],
    status: {
      type: String,
      enum: ["draft", "pending", "published", "rejected", "scheduled"],
      default: "draft",
      index: true,
    },
    publishAt: {
      type: Date,
      default: null,
    },
    ratingAvg: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    rejection: {
      reason: { type: String },
      at: { type: Date },
      by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    // Blockchain metadata để bảo vệ bản quyền
    blockchain: {
      recipeHash: {
        type: String,
        default: null,
        index: true,
      },
      authorWalletAddress: {
        type: String,
        default: null,
      },
      transactionHash: {
        type: String,
        default: null,
        index: true,
      },
      blockNumber: {
        type: Number,
        default: null,
      },
      timestamp: {
        type: Date,
        default: null,
      },
      isVerified: {
        type: Boolean,
        default: false,
      },
      verificationReason: {
        type: String,
        default: null,
        enum: [null, "hash_already_exists", "blockchain_error", "no_wallet_address"],
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
recipeSchema.index({ status: 1, publishAt: 1 });
recipeSchema.index({ authorId: 1, status: 1 });
recipeSchema.index({ tags: 1 });
recipeSchema.index({ category: 1 });
recipeSchema.index({ createdAt: -1 });
recipeSchema.index({ updatedAt: -1 });
recipeSchema.index({ ratingAvg: -1, updatedAt: -1 });
recipeSchema.index({ title: "text", summary: "text" });
recipeSchema.index({ "blockchain.recipeHash": 1 });
recipeSchema.index({ "blockchain.transactionHash": 1 });

// Virtual for total time
recipeSchema.virtual("totalTime").get(function () {
  return (this.prepTime || 0) + (this.cookTime || 0);
});

// Methods
recipeSchema.methods.isPublished = function () {
  return (
    this.status === "published" &&
    (!this.publishAt || this.publishAt <= new Date())
  );
};

recipeSchema.methods.canEdit = function (userId) {
  return this.authorId.toString() === userId.toString();
};

// Static methods
recipeSchema.statics.findPublished = function () {
  const now = new Date();
  return this.find({
    status: "published",
    $or: [{ publishAt: null }, { publishAt: { $lte: now } }],
  });
};

recipeSchema.statics.getStats = async function () {
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
    draft: 0,
    pending: 0,
    published: 0,
    rejected: 0,
    scheduled: 0,
  };

  stats.forEach((stat) => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });

  return result;
};

const Recipe = mongoose.model("Recipe", recipeSchema);

export default Recipe;
