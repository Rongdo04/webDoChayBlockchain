// seeders/comments.seeder.js
import mongoose from "mongoose";
import Comment from "../models/Comment.js";
import Recipe from "../models/Recipe.js";
import User from "../models/User.js";
import connectDB from "../config/database.js";

/**
 * Seed comments with various statuses for testing moderation
 */
async function seedComments() {
  try {
    console.log("🌱 Starting comments seeding...");

    await connectDB();

    // Get existing users and recipes
    const users = await User.find().limit(10);
    const recipes = await Recipe.find().limit(10);

    if (users.length === 0 || recipes.length === 0) {
      console.error(
        "❌ No users or recipes found. Please seed users and recipes first."
      );
      return;
    }

    console.log(`📊 Found ${users.length} users and ${recipes.length} recipes`);

    // Clear existing comments
    await Comment.deleteMany({});
    console.log("🧹 Cleared existing comments");

    // Sample comment content
    const commentContents = [
      "Công thức này thật tuyệt vời! Tôi đã thử và rất thành công.",
      "Cảm ơn bạn đã chia sẻ. Món ăn rất ngon!",
      "Có thể thay thế nguyên liệu nào khác không?",
      "Thời gian nấu có thể ngắn hơn được không?",
      "Tôi đã làm theo và kết quả rất tốt. 5 sao!",
      "Món này hơi mặn so với khẩu vị của tôi.",
      "Cách trình bày rất đẹp mắt.",
      "Nguyên liệu dễ tìm và cách làm đơn giản.",
      "Đây là một trong những công thức tốt nhất tôi từng thử.",
      "Cần thêm một chút gia vị để đậm đà hơn.",
      "Tuyệt vời! Cả gia đình đều thích.",
      "Có video hướng dẫn thì tốt quá.",
      "Tôi đã sửa đổi một chút và kết quả rất ổn.",
      "Món ăn này rất phù hợp cho bữa tối.",
      "Cảm ơn vì công thức chi tiết và dễ hiểu.",
      // Some inappropriate comments for testing moderation
      "Công thức tệ quá! Không ai nên làm theo.",
      "Tác giả không biết gì về nấu ăn cả.",
      "Lãng phí thời gian với món ăn vô dụng này.",
      "Spam comment - không liên quan đến món ăn",
      "Nội dung không phù hợp - xúc phạm",
    ];

    const commentsToInsert = [];
    const now = new Date();

    // Generate comments for each recipe
    for (let i = 0; i < recipes.length; i++) {
      const recipe = recipes[i];
      const numComments = Math.floor(Math.random() * 8) + 3; // 3-10 comments per recipe

      for (let j = 0; j < numComments; j++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomContent =
          commentContents[Math.floor(Math.random() * commentContents.length)];

        // Determine status based on content and random factor
        let status = "approved";
        let moderatedBy = null;
        let moderatedAt = null;
        let moderationReason = null;

        // 20% pending comments (newest ones)
        if (Math.random() < 0.2 || j < 2) {
          status = "pending";
        }
        // 10% hidden comments (inappropriate content)
        else if (
          randomContent.includes("tệ quá") ||
          randomContent.includes("vô dụng") ||
          randomContent.includes("Spam") ||
          randomContent.includes("xúc phạm") ||
          randomContent.includes("không biết gì")
        ) {
          status = "hidden";
          moderatedBy = users[0]._id; // First user as admin
          moderatedAt = new Date(
            now.getTime() - Math.random() * 24 * 60 * 60 * 1000
          ); // Random time in last 24h
          moderationReason =
            "Nội dung không phù hợp hoặc vi phạm quy định cộng đồng";
        }

        // Random rating (70% chance to have rating)
        const rating =
          Math.random() < 0.7 ? Math.floor(Math.random() * 5) + 1 : null;

        // Random creation time (last 30 days)
        const createdAt = new Date(
          now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000
        );

        const comment = {
          content: randomContent,
          rating: rating,
          status: status,
          recipeId: recipe._id,
          userId: randomUser._id,
          parentId: null, // No nested replies for simplicity
          moderatedBy: moderatedBy,
          moderatedAt: moderatedAt,
          moderationReason: moderationReason,
          createdAt: createdAt,
          updatedAt: createdAt,
        };

        commentsToInsert.push(comment);
      }
    }

    // Add some reply comments (10% of total)
    const replyCount = Math.floor(commentsToInsert.length * 0.1);
    for (let i = 0; i < replyCount; i++) {
      const parentComment =
        commentsToInsert[Math.floor(Math.random() * commentsToInsert.length)];
      const randomUser = users[Math.floor(Math.random() * users.length)];

      const replyContents = [
        "Cảm ơn bạn đã chia sẻ kinh nghiệm!",
        "Tôi cũng có cùng ý kiến.",
        "Bạn có thể chia sẻ thêm chi tiết không?",
        "Rất hữu ích, cảm ơn!",
        "Tôi sẽ thử làm theo lời khuyên của bạn.",
      ];

      const reply = {
        content:
          replyContents[Math.floor(Math.random() * replyContents.length)],
        rating: null, // Replies usually don't have ratings
        status: "approved",
        recipeId: parentComment.recipeId,
        userId: randomUser._id,
        parentId: null, // Will be set after parent is inserted
        moderatedBy: null,
        moderatedAt: null,
        moderationReason: null,
        createdAt: new Date(
          parentComment.createdAt.getTime() +
            Math.random() * 24 * 60 * 60 * 1000
        ),
        updatedAt: new Date(),
      };

      commentsToInsert.push(reply);
    }

    // Insert all comments
    const insertedComments = await Comment.insertMany(commentsToInsert);
    console.log(`✅ Inserted ${insertedComments.length} comments`);

    // Update reply parentIds
    const replies = insertedComments.slice(-replyCount);
    const parents = insertedComments.slice(0, -replyCount);

    for (let i = 0; i < replies.length; i++) {
      const reply = replies[i];
      const randomParent = parents[Math.floor(Math.random() * parents.length)];

      await Comment.findByIdAndUpdate(reply._id, {
        parentId: randomParent._id,
      });
    }

    // Print statistics
    const stats = await Comment.getStats();
    console.log("📊 Comment Statistics:");
    console.log(`   Total: ${stats.total}`);
    console.log(`   Pending: ${stats.pending}`);
    console.log(`   Approved: ${stats.approved}`);
    console.log(`   Hidden: ${stats.hidden}`);

    console.log("🎉 Comments seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding comments:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedComments();
}

export default seedComments;
