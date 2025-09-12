// seeders/simple-comments.seeder.js
import mongoose from "mongoose";
import Comment from "../models/Comment.js";
import Recipe from "../models/Recipe.js";
import User from "../models/User.js";

console.log("🌱 Starting simple comments seeding...");

// Connect to MongoDB directly
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/Web_Do_Chay")
  .then(async () => {
    console.log("✅ Connected to MongoDB");

    // Check existing data
    const userCount = await User.countDocuments();
    const recipeCount = await Recipe.countDocuments();
    console.log(`📊 Found ${userCount} users and ${recipeCount} recipes`);

    if (userCount === 0 || recipeCount === 0) {
      console.error("❌ No users or recipes found. Please seed them first.");
      process.exit(1);
    }

    // Get sample data
    const users = await User.find().limit(5);
    const recipes = await Recipe.find().limit(5);

    console.log(`👤 Users: ${users.length}`);
    console.log(`📗 Recipes: ${recipes.length}`);

    if (users.length < 2 || recipes.length < 2) {
      console.error("❌ Need at least 2 users and 2 recipes");
      process.exit(1);
    }

    // Clear existing comments
    await Comment.deleteMany({});
    console.log("🧹 Cleared existing comments");

    // Create sample comments
    const sampleComments = [
      {
        content: "Công thức này thật tuyệt vời! Tôi đã thử và rất thành công.",
        rating: 5,
        status: "approved",
        recipeId: recipes[0]._id,
        userId: users[0]._id,
      },
      {
        content: "Cần kiểm tra lại công thức này...",
        rating: 3,
        status: "pending",
        recipeId: recipes[0]._id,
        userId: users[Math.min(1, users.length - 1)]._id,
      },
      {
        content: "Nội dung không phù hợp - spam",
        rating: 1,
        status: "hidden",
        recipeId: recipes[Math.min(1, recipes.length - 1)]._id,
        userId: users[0]._id,
        moderatedBy: users[0]._id,
        moderatedAt: new Date(),
        moderationReason: "Spam content",
      },
      {
        content: "Món ăn rất ngon, cảm ơn bạn đã chia sẻ!",
        rating: 4,
        status: "approved",
        recipeId: recipes[Math.min(1, recipes.length - 1)]._id,
        userId: users[0]._id,
      },
      {
        content: "Tôi muốn thử làm món này",
        rating: null,
        status: "pending",
        recipeId: recipes[0]._id,
        userId: users[0]._id,
      },
    ];

    // Insert comments
    const inserted = await Comment.insertMany(sampleComments);
    console.log(`✅ Inserted ${inserted.length} comments`);

    // Show stats
    const stats = await Comment.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    console.log("📊 Comment Statistics:");
    stats.forEach((stat) => {
      console.log(`   ${stat._id}: ${stat.count}`);
    });

    console.log("🎉 Comments seeding completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
