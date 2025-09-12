// models/Taxonomy.js
import mongoose from "mongoose";

const taxonomySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    type: {
      type: String,
      required: true,
      enum: ["category", "tag"],
      index: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      maxlength: 120,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for name uniqueness per type
taxonomySchema.index({ name: 1, type: 1 }, { unique: true });
taxonomySchema.index({ slug: 1, type: 1 }, { unique: true });

// Virtual for display
taxonomySchema.virtual("displayName").get(function () {
  return this.name;
});

// Instance method to increment usage
taxonomySchema.methods.incrementUsage = function () {
  this.usageCount += 1;
  return this.save();
};

// Instance method to decrement usage
taxonomySchema.methods.decrementUsage = function () {
  if (this.usageCount > 0) {
    this.usageCount -= 1;
    return this.save();
  }
  return Promise.resolve(this);
};

// Static method to find by type
taxonomySchema.statics.findByType = function (type, options = {}) {
  const query = { type };
  if (options.active !== undefined) {
    query.isActive = options.active;
  }
  return this.find(query).sort({ name: 1 });
};

// Static method to find by name and type
taxonomySchema.statics.findByNameAndType = function (name, type) {
  return this.findOne({
    name: name.trim(),
    type,
  });
};

const Taxonomy = mongoose.model("Taxonomy", taxonomySchema);

export default Taxonomy;
