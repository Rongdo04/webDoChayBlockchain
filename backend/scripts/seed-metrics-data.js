// scripts/seed-metrics-data.js
import mongoose from "mongoose";
import User from "../models/User.js";
import Recipe from "../models/Recipe.js";
import Comment from "../models/Comment.js";
import AuditLog from "../models/AuditLog.js";
import bcrypt from "bcryptjs";

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/recipe-app-test"
    );
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

// Generate sample users
const generateUsers = async () => {
  const users = [];
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Create admin user
  users.push({
    name: "Admin User",
    email: "admin@example.com",
    password: hashedPassword,
    role: "admin",
    isEmailVerified: true,
    isActive: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
  });

  // Create regular users
  for (let i = 1; i <= 10; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    users.push({
      name: `User ${i}`,
      email: `user${i}@example.com`,
      password: hashedPassword,
      role: "user",
      isEmailVerified: true,
      isActive: true,
      createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
    });
  }

  return await User.insertMany(users);
};

// Generate sample recipes
const generateRecipes = async (users) => {
  const recipes = [];
  const statuses = ["draft", "published", "rejected"];

  for (let i = 1; i <= 25; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const author = users[Math.floor(Math.random() * users.length)];

    recipes.push({
      title: `Sample Recipe ${i}`,
      slug: `sample-recipe-${i}`,
      summary: `This is a sample recipe ${i} for testing purposes`,
      content: `Detailed content for recipe ${i}`,
      ingredients: [
        { name: "Ingredient 1", amount: "1 cup", unit: "cup" },
        { name: "Ingredient 2", amount: "2 tbsp", unit: "tbsp" },
      ],
      steps: [
        { order: 1, description: "First step", duration: 10 },
        { order: 2, description: "Second step", duration: 15 },
      ],
      tags: ["vegetarian", "quick"],
      category: "main-course",
      prepTime: 15,
      cookTime: 30,
      servings: 4,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      authorId: author._id,
      createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
    });
  }

  return await Recipe.insertMany(recipes);
};

// Generate sample comments
const generateComments = async (users, recipes) => {
  const comments = [];

  for (let i = 1; i <= 50; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const user = users[Math.floor(Math.random() * users.length)];
    const recipe = recipes[Math.floor(Math.random() * recipes.length)];

    comments.push({
      content: `This is a sample comment ${i}`,
      rating: Math.floor(Math.random() * 5) + 1,
      status: ["pending", "approved", "hidden"][Math.floor(Math.random() * 3)],
      recipeId: recipe._id,
      userId: user._id,
      createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
    });
  }

  return await Comment.insertMany(comments);
};

// Generate sample audit logs
const generateAuditLogs = async (users, recipes) => {
  const auditLogs = [];
  const actions = ["create", "update", "delete", "publish", "unpublish"];
  const entityTypes = ["recipe", "user", "settings"];

  for (let i = 1; i <= 100; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const user = users[Math.floor(Math.random() * users.length)];
    const entity = entityTypes[Math.floor(Math.random() * entityTypes.length)];
    let entityId = null;

    if (entity === "recipe") {
      entityId = recipes[Math.floor(Math.random() * recipes.length)]._id;
    } else if (entity === "user") {
      entityId = users[Math.floor(Math.random() * users.length)]._id;
    }

    auditLogs.push({
      action: actions[Math.floor(Math.random() * actions.length)],
      entityType: entity,
      entityId,
      userId: user._id,
      userEmail: user.email,
      userRole: user.role,
      metadata: {
        userAgent: "Admin Panel",
        timestamp: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      },
      createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
    });
  }

  return await AuditLog.insertMany(auditLogs);
};

// Main seed function
const seedData = async () => {
  try {
    await connectDB();

    console.log("Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      Recipe.deleteMany({}),
      Comment.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);

    console.log("Generating users...");
    const users = await generateUsers();
    console.log(`Created ${users.length} users`);

    console.log("Generating recipes...");
    const recipes = await generateRecipes(users);
    console.log(`Created ${recipes.length} recipes`);

    console.log("Generating comments...");
    const comments = await generateComments(users, recipes);
    console.log(`Created ${comments.length} comments`);

    console.log("Generating audit logs...");
    const auditLogs = await generateAuditLogs(users, recipes);
    console.log(`Created ${auditLogs.length} audit logs`);

    console.log("Seed data generated successfully!");

    // Display sample data counts
    console.log("\nData Summary:");
    console.log(`- Users: ${users.length}`);
    console.log(`- Recipes: ${recipes.length}`);
    console.log(`- Comments: ${comments.length}`);
    console.log(`- Audit Logs: ${auditLogs.length}`);

    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedData();
}

export default seedData;
