// scripts/create-test-posts.js
import { connectDB, disconnectDB } from "../config/database.js";
import User from "../models/User.js";
import Post from "../models/Post.js";
import mongoose from "mongoose";

async function createTestPosts() {
  try {
    await connectDB();

    // Find or create a test user
    let testUser = await User.findOne({ email: "test@example.com" });
    if (!testUser) {
      testUser = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        role: "user",
        isEmailVerified: true,
      });
    }

    // Create test posts
    const testPosts = [
      {
        content: "Đây là bài viết test đầu tiên về kinh nghiệm nấu ăn chay",
        tag: "Kinh nghiệm",
        userId: testUser._id,
        status: "published",
        likesCount: 5,
        commentsCount: 2,
      },
      {
        content:
          "Tôi có câu hỏi về cách làm đậu phụ tại nhà, ai có kinh nghiệm không?",
        tag: "Hỏi đáp",
        userId: testUser._id,
        status: "pending",
        likesCount: 0,
        commentsCount: 0,
      },
      {
        content: "Chia sẻ công thức làm bánh mì chay ngon tuyệt",
        tag: "Chia sẻ",
        userId: testUser._id,
        status: "published",
        likesCount: 10,
        commentsCount: 5,
      },
      {
        content: "Món mới: Cà ri chay với nước cốt dừa",
        tag: "Món mới",
        userId: testUser._id,
        status: "hidden",
        likesCount: 0,
        commentsCount: 0,
      },
      {
        content: "Tư vấn về chế độ ăn chay cho người mới bắt đầu",
        tag: "Tư vấn",
        userId: testUser._id,
        status: "published",
        likesCount: 8,
        commentsCount: 3,
      },
    ];

    // Clear existing test posts
    await Post.deleteMany({ userId: testUser._id });

    // Create new test posts
    const createdPosts = await Post.insertMany(testPosts);

    console.log(`Created ${createdPosts.length} test posts:`);
    createdPosts.forEach((post, index) => {
      console.log(
        `${index + 1}. ${post.content.substring(0, 50)}... (${post.status})`
      );
    });

    // Test the admin API data structure
    const adminPosts = await Post.find({})
      .populate("userId", "name email avatar role")
      .populate("moderatedBy", "name email")
      .limit(1);

    if (adminPosts.length > 0) {
      const post = adminPosts[0];
      console.log("\nSample post structure for admin API:");
      console.log("_id:", post._id);
      console.log("id (from toJSON):", post.toJSON().id);
      console.log("userId:", post.userId);
      console.log("content:", post.content.substring(0, 50) + "...");
    }

    // Test the listPostsForAdmin function
    console.log("\nTesting listPostsForAdmin function:");
    const { listPostsForAdmin } = await import("../repositories/posts.repo.js");
    const result = await listPostsForAdmin({ limit: 2 });
    console.log("Result items count:", result.items.length);
    if (result.items.length > 0) {
      console.log("First item structure:", result.items[0]);
    }
  } catch (error) {
    console.error("Error creating test posts:", error);
  } finally {
    await disconnectDB();
  }
}

createTestPosts();
