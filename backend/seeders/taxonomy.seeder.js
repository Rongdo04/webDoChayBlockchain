// seeders/taxonomy.seeder.js
import mongoose from "mongoose";
import Taxonomy from "../models/Taxonomy.js";
import config from "../config/index.js";

// Sample categories data
const categories = [
  {
    name: "Món khai vị",
    type: "category",
    slug: "mon-khai-vi",
    description: "Các món ăn khai vị để bắt đầu bữa ăn",
    usageCount: 12,
    isActive: true,
  },
  {
    name: "Món chính",
    type: "category",
    slug: "mon-chinh",
    description: "Các món ăn chính trong bữa ăn",
    usageCount: 25,
    isActive: true,
  },
  {
    name: "Món tráng miệng",
    type: "category",
    slug: "mon-trang-mieng",
    description: "Các món tráng miệng kết thúc bữa ăn",
    usageCount: 8,
    isActive: true,
  },
  {
    name: "Đồ uống",
    type: "category",
    slug: "do-uong",
    description: "Các loại đồ uống và nước giải khát",
    usageCount: 15,
    isActive: true,
  },
  {
    name: "Món nướng",
    type: "category",
    slug: "mon-nuong",
    description: "Các món ăn được chế biến bằng cách nướng",
    usageCount: 18,
    isActive: true,
  },
];

// Sample tags data
const tags = [
  {
    name: "healthy",
    type: "tag",
    slug: "healthy",
    description: "Món ăn tốt cho sức khỏe",
    usageCount: 22,
    isActive: true,
  },
  {
    name: "vegetarian",
    type: "tag",
    slug: "vegetarian",
    description: "Món ăn chay",
    usageCount: 16,
    isActive: true,
  },
  {
    name: "spicy",
    type: "tag",
    slug: "spicy",
    description: "Món ăn cay",
    usageCount: 14,
    isActive: true,
  },
  {
    name: "quick-meal",
    type: "tag",
    slug: "quick-meal",
    description: "Món ăn nhanh, dễ làm",
    usageCount: 28,
    isActive: true,
  },
  {
    name: "traditional",
    type: "tag",
    slug: "traditional",
    description: "Món ăn truyền thống",
    usageCount: 19,
    isActive: true,
  },
];

async function seedTaxonomy() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing taxonomy data
    console.log("Clearing existing taxonomy data...");
    await Taxonomy.deleteMany({});

    // Insert categories
    console.log("Seeding categories...");
    const insertedCategories = await Taxonomy.insertMany(categories);
    console.log(`✅ Inserted ${insertedCategories.length} categories`);

    // Insert tags
    console.log("Seeding tags...");
    const insertedTags = await Taxonomy.insertMany(tags);
    console.log(`✅ Inserted ${insertedTags.length} tags`);

    console.log("🎉 Taxonomy seeding completed successfully!");

    // Display summary
    console.log("\n📊 Summary:");
    console.log(`Categories: ${insertedCategories.length}`);
    console.log(`Tags: ${insertedTags.length}`);
    console.log(`Total: ${insertedCategories.length + insertedTags.length}`);

    // List inserted items
    console.log("\n📝 Categories:");
    insertedCategories.forEach((cat, index) => {
      console.log(`  ${index + 1}. ${cat.name} (${cat.slug})`);
    });

    console.log("\n🏷️ Tags:");
    insertedTags.forEach((tag, index) => {
      console.log(`  ${index + 1}. ${tag.name} (${tag.slug})`);
    });
  } catch (error) {
    console.error("❌ Error seeding taxonomy:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  } finally {
    // Close the connection
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

// Run the seeder if this file is executed directly
const isMainModule = import.meta.url.endsWith(
  process.argv[1].replace(/\\/g, "/")
);

if (isMainModule) {
  seedTaxonomy();
}

export default seedTaxonomy;
