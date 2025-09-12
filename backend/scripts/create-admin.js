// scripts/create-admin.js - Create admin user
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import connectDB from "../config/database.js";

async function createAdminUser() {
  try {
    console.log("🔄 Connecting to database...");
    await connectDB();
    console.log("✅ Database connected");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@example.com" });

    if (existingAdmin) {
      console.log("✅ Admin user already exists");
      console.log("📧 Email:", existingAdmin.email);
      console.log("👤 Role:", existingAdmin.role);
      console.log("🟢 Active:", existingAdmin.isActive);
      return existingAdmin;
    }

    // Create admin user
    console.log("🔄 Creating admin user...");

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const adminUser = new User({
      name: "Administrator",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
      isActive: true,
      isEmailVerified: true,
    });

    await adminUser.save();
    console.log("✅ Admin user created successfully");
    console.log("📧 Email: admin@example.com");
    console.log("🔐 Password: admin123");
    console.log("👤 Role: admin");

    return adminUser;
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log("📋 Database connection closed");
  }
}

// Create a regular test user too
async function createTestUser() {
  try {
    console.log("🔄 Connecting to database...");
    await connectDB();

    // Check if test user already exists
    const existingUser = await User.findOne({ email: "user@example.com" });

    if (existingUser) {
      console.log("✅ Test user already exists");
      return existingUser;
    }

    console.log("🔄 Creating test user...");

    const hashedPassword = await bcrypt.hash("user123", 10);

    const testUser = new User({
      name: "Test User",
      email: "user@example.com",
      password: hashedPassword,
      role: "user",
      isActive: true,
      isEmailVerified: true,
    });

    await testUser.save();
    console.log("✅ Test user created successfully");
    console.log("📧 Email: user@example.com");
    console.log("🔐 Password: user123");
    console.log("👤 Role: user");

    return testUser;
  } catch (error) {
    console.error("❌ Error creating test user:", error);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
}

// Run both
async function createUsers() {
  console.log("👥 Creating test users...");
  console.log("========================");

  try {
    await createAdminUser();
    console.log("");
    await createTestUser();

    console.log("\n🎉 All users created successfully!");
    console.log("\n📝 You can now login with:");
    console.log("   Admin: admin@example.com / admin123");
    console.log("   User:  user@example.com / user123");
  } catch (error) {
    console.error("💥 Failed to create users:", error.message);
    process.exit(1);
  }
}

createUsers();
