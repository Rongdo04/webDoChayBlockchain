// test-user-check.js - Check user in database
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import connectDB from "./config/database.js";

async function checkUser() {
  try {
    console.log("🔄 Connecting to database...");
    await connectDB();

    // Find admin user
    const adminUser = await User.findOne({ email: "admin@example.com" }).select(
      "+password"
    );

    if (!adminUser) {
      console.log("❌ Admin user not found!");
      return;
    }

    console.log("✅ Admin user found:");
    console.log("📧 Email:", adminUser.email);
    console.log("👤 Name:", adminUser.name);
    console.log("🔐 Role:", adminUser.role);
    console.log("🟢 Active:", adminUser.isActive);
    console.log("📅 Created:", adminUser.createdAt);
    console.log(
      "🔑 Password hash (first 20 chars):",
      adminUser.password
        ? adminUser.password.substring(0, 20) + "..."
        : "NO PASSWORD"
    );

    // Test password comparison
    console.log("\n🧪 Testing password comparison...");

    // Test with correct password
    try {
      const isValidCorrect = await adminUser.comparePassword("admin123");
      console.log("✅ Correct password (admin123):", isValidCorrect);
    } catch (error) {
      console.log("❌ Error comparing correct password:", error.message);
    }

    // Test with wrong password
    try {
      const isValidWrong = await adminUser.comparePassword("wrongpassword");
      console.log("❌ Wrong password (wrongpassword):", isValidWrong);
    } catch (error) {
      console.log("❌ Error comparing wrong password:", error.message);
    }

    // Test manual bcrypt comparison
    console.log("\n🔧 Manual bcrypt test...");
    try {
      const manualCompare = await bcrypt.compare(
        "admin123",
        adminUser.password
      );
      console.log("🔧 Manual bcrypt.compare result:", manualCompare);
    } catch (error) {
      console.log("❌ Manual bcrypt error:", error.message);
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n📋 Database connection closed");
  }
}

checkUser();
