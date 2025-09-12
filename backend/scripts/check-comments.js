// scripts/check-comments.js
import mongoose from "mongoose";
import Comment from "../models/Comment.js";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/Web_Do_Chay";

console.log("🔌 Connecting to MongoDB...");

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB");

    const comments = await Comment.find().sort({ createdAt: -1 });
    console.log(`📊 Found ${comments.length} comments:`);

    comments.forEach((comment, index) => {
      console.log(`${index + 1}. ID: ${comment._id}`);
      console.log(`   Content: "${comment.content.slice(0, 50)}..."`);
      console.log(`   Status: ${comment.status}`);
      console.log(`   Created: ${comment.createdAt}`);
      console.log("");
    });

    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
