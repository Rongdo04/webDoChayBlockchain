// fix-admin-password.js - Fix admin password
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import connectDB from "./config/database.js";

async function fixAdminPassword() {
  try {
    console.log("🔄 Connecting to database...");
    await connectDB();

    // Find and delete existing admin
    console.log("🗑️ Removing existing admin user...");
    await User.deleteOne({ email: "admin@example.com" });
    console.log("✅ Existing admin user removed");

    // Create new admin with proper password
    console.log("🔄 Creating new admin user...");

    const adminUser = new User({
      name: "Administrator",
      email: "admin@example.com",
      password: "admin123", // This will be hashed by the pre-save middleware
      role: "admin",
      isActive: true,
      isEmailVerified: true,
    });

    await adminUser.save();
    console.log("✅ New admin user created");

    // Test the new password immediately
    const savedUser = await User.findOne({ email: "admin@example.com" }).select(
      "+password"
    );
    console.log("\n🧪 Testing new password...");

    const isValid = await savedUser.comparePassword("admin123");
    console.log("✅ Password test result:", isValid);

    if (isValid) {
      console.log("🎉 Admin user fixed successfully!");
      console.log("📧 Email: admin@example.com");
      console.log("🔐 Password: admin123");
    } else {
      console.log("❌ Password still not working!");

      // Debug: check if password was hashed
      console.log(
        "🔍 Raw password hash:",
        savedUser.password.substring(0, 30) + "..."
      );

      // Manual test
      const manualTest = await bcrypt.compare("admin123", savedUser.password);
      console.log("🔧 Manual bcrypt test:", manualTest);
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n📋 Database connection closed");
  }
}

fixAdminPassword();
