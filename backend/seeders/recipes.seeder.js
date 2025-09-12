// seeders/recipes.seeder.js
import Recipe from "../models/Recipe.js";
import User from "../models/User.js";
import connectDB from "../config/database.js";
import mongoose from "mongoose";

const sampleRecipes = [
  {
    title: "Phở Bò Hà Nội",
    summary:
      "Món phở bò truyền thống đặc trưng của Hà Nội với nước dùng trong vắt",
    content: "Phở bò là món ăn được yêu thích nhất của người Việt Nam...",
    ingredients: [
      { name: "Thịt bò", amount: "500", unit: "g", notes: "Nạm và gân" },
      { name: "Bánh phở", amount: "300", unit: "g", notes: "Bánh tươi" },
      { name: "Xương bò", amount: "1", unit: "kg", notes: "Xương ống" },
    ],
    steps: [
      { order: 1, description: "Luộc xương bò trong 3 tiếng", duration: 180 },
      { order: 2, description: "Thái thịt bò mỏng", duration: 15 },
      { order: 3, description: "Trần bánh phở qua nước sôi", duration: 2 },
    ],
    tags: ["traditional", "vietnamese", "soup", "beef"],
    category: "mon-chinh",
    prepTime: 30,
    cookTime: 180,
    servings: 4,
    status: "published",
  },
  {
    title: "Bánh Mì Thịt Nướng",
    summary: "Bánh mì Việt Nam với thịt nướng thơm lừng",
    content: "Bánh mì thịt nướng là món ăn sáng phổ biến...",
    ingredients: [
      { name: "Bánh mì", amount: "4", unit: "cái", notes: "Bánh mì Việt Nam" },
      { name: "Thịt heo", amount: "300", unit: "g", notes: "Thịt ba rọi" },
      { name: "Pate gan", amount: "100", unit: "g", notes: "" },
    ],
    steps: [
      { order: 1, description: "Ướp thịt với gia vị", duration: 30 },
      { order: 2, description: "Nướng thịt trên than", duration: 20 },
      { order: 3, description: "Cắt bánh mì, phết pate", duration: 5 },
    ],
    tags: ["banh-mi", "grilled-pork", "vietnamese", "street-food"],
    category: "mon-chinh",
    prepTime: 45,
    cookTime: 20,
    servings: 4,
    status: "published",
  },
  {
    title: "Bún Bò Huế",
    summary: "Món bún đặc trưng xứ Huế với hương vị cay nồng",
    content: "Bún bò Huế nổi tiếng với nước dùng màu đỏ...",
    ingredients: [
      { name: "Bún bò", amount: "400", unit: "g", notes: "Bún tươi" },
      { name: "Thịt bò", amount: "300", unit: "g", notes: "Thịt nạm" },
      { name: "Chả cua", amount: "200", unit: "g", notes: "" },
    ],
    steps: [
      { order: 1, description: "Ninh xương heo trong 2 tiếng", duration: 120 },
      { order: 2, description: "Rang tỏi ớt tạo màu đỏ", duration: 10 },
      { order: 3, description: "Trần bún qua nước sôi", duration: 1 },
    ],
    tags: ["hue", "spicy", "soup", "vietnamese"],
    category: "mon-chinh",
    prepTime: 40,
    cookTime: 140,
    servings: 4,
    status: "published",
  },
  {
    title: "Gỏi Cuốn Tôm Thịt",
    summary: "Gỏi cuốn tươi mát với tôm và thịt heo luộc",
    content: "Gỏi cuốn là món khai vị thanh mát...",
    ingredients: [
      {
        name: "Bánh tráng",
        amount: "12",
        unit: "cái",
        notes: "Bánh tráng mỏng",
      },
      { name: "Tôm", amount: "200", unit: "g", notes: "Tôm tươi" },
      { name: "Thịt heo", amount: "150", unit: "g", notes: "Thịt ba chỉ" },
    ],
    steps: [
      { order: 1, description: "Luộc tôm và thịt heo", duration: 15 },
      { order: 2, description: "Chuẩn bị rau sống", duration: 10 },
      { order: 3, description: "Cuốn bánh tráng với nhân", duration: 20 },
    ],
    tags: ["fresh", "healthy", "appetizer", "vietnamese"],
    category: "mon-chinh",
    prepTime: 45,
    cookTime: 15,
    servings: 6,
    status: "published",
  },
  {
    title: "Cơm Tấm Sài Gòn",
    summary: "Cơm tấm đặc trưng Sài Gòn với sườn nướng",
    content: "Cơm tấm là món ăn dân dã của miền Nam...",
    ingredients: [
      { name: "Gạo tấm", amount: "300", unit: "g", notes: "" },
      { name: "Sườn heo", amount: "400", unit: "g", notes: "Sườn non" },
      { name: "Trứng ốp la", amount: "4", unit: "quả", notes: "" },
    ],
    steps: [
      { order: 1, description: "Nấu cơm tấm", duration: 25 },
      { order: 2, description: "Ướp và nướng sườn", duration: 40 },
      { order: 3, description: "Chiên trứng ốp la", duration: 5 },
    ],
    tags: ["saigon", "grilled", "rice", "southern"],
    category: "mon-chinh",
    prepTime: 30,
    cookTime: 45,
    servings: 4,
    status: "draft",
  },
  {
    title: "Bánh Xèo Miền Tây",
    summary: "Bánh xèo giòn rụm với nhân tôm thịt đặc trưng miền Tây",
    content: "Bánh xèo miền Tây có kích thước lớn, giòn tan...",
    ingredients: [
      { name: "Bột bánh xèo", amount: "300", unit: "g", notes: "Bột pha sẵn" },
      { name: "Tôm", amount: "200", unit: "g", notes: "Tôm tươi" },
      { name: "Thịt ba chỉ", amount: "200", unit: "g", notes: "Thái mỏng" },
      { name: "Giá đỗ", amount: "100", unit: "g", notes: "Rau sống" },
    ],
    steps: [
      { order: 1, description: "Pha bột bánh xèo", duration: 10 },
      { order: 2, description: "Chiên tôm thịt", duration: 15 },
      { order: 3, description: "Đổ bánh và nướng", duration: 5 },
    ],
    tags: ["banh-xeo", "southern", "crispy", "vietnamese"],
    category: "mon-chinh",
    prepTime: 25,
    cookTime: 20,
    servings: 4,
    status: "published",
  },
  {
    title: "Chả Cá Lã Vọng",
    summary: "Món chả cá nổi tiếng Hà Nội với thìa là và thì là",
    content: "Chả cá Lã Vọng là món ăn đặc sản của Hà Nội...",
    ingredients: [
      { name: "Cá tra", amount: "500", unit: "g", notes: "Phi lê" },
      { name: "Thìa là", amount: "50", unit: "g", notes: "Lá tươi" },
      { name: "Thì là", amount: "30", unit: "g", notes: "Thái nhỏ" },
      { name: "Bún", amount: "300", unit: "g", notes: "Bún tươi" },
    ],
    steps: [
      { order: 1, description: "Ướp cá với nghệ", duration: 30 },
      { order: 2, description: "Nướng cá trên chảo", duration: 15 },
      { order: 3, description: "Trộn với thìa là và thì là", duration: 5 },
    ],
    tags: ["hanoi", "fish", "traditional", "noodles"],
    category: "mon-chinh",
    prepTime: 45,
    cookTime: 20,
    servings: 4,
    status: "published",
  },
  {
    title: "Cao Lầu Hội An",
    summary: "Món mì đặc trưng của Hội An với nước dùng đặc biệt",
    content: "Cao lầu chỉ có thể làm được ở Hội An...",
    ingredients: [
      { name: "Mì cao lầu", amount: "400", unit: "g", notes: "Mì đặc biệt" },
      { name: "Thịt heo xá xíu", amount: "200", unit: "g", notes: "Thái lát" },
      { name: "Tôm khô", amount: "50", unit: "g", notes: "Ngâm mềm" },
      { name: "Rau sống", amount: "100", unit: "g", notes: "Xà lách, húng" },
    ],
    steps: [
      { order: 1, description: "Luộc mì cao lầu", duration: 3 },
      { order: 2, description: "Chuẩn bị topping", duration: 15 },
      { order: 3, description: "Trình bày và rưới nước", duration: 5 },
    ],
    tags: ["hoi-an", "noodles", "specialty", "central"],
    category: "mon-chinh",
    prepTime: 20,
    cookTime: 25,
    servings: 4,
    status: "published",
  },
  {
    title: "Bánh Căn Phan Thiết",
    summary: "Bánh căn nóng hổi với tôm và trứng cút",
    content: "Bánh căn là món ăn vặt nổi tiếng của Phan Thiết...",
    ingredients: [
      { name: "Bột gạo", amount: "200", unit: "g", notes: "Bột mịn" },
      { name: "Tôm tươi", amount: "150", unit: "g", notes: "Tôm nhỏ" },
      { name: "Trứng cút", amount: "20", unit: "quả", notes: "" },
      { name: "Hành lá", amount: "50", unit: "g", notes: "Thái nhỏ" },
    ],
    steps: [
      { order: 1, description: "Pha bột bánh căn", duration: 10 },
      { order: 2, description: "Nướng trong khuôn", duration: 15 },
      { order: 3, description: "Lật mặt cho vàng", duration: 5 },
    ],
    tags: ["phan-thiet", "street-food", "grilled", "small-cakes"],
    category: "mon-chinh",
    prepTime: 15,
    cookTime: 20,
    servings: 6,
    status: "published",
  },
  {
    title: "Mì Quảng",
    summary: "Món mì đặc sản Quảng Nam với nước dùng đậm đà",
    content: "Mì Quảng có nước dùng ít, màu vàng đặc trưng...",
    ingredients: [
      { name: "Bánh tráng mì", amount: "300", unit: "g", notes: "Bánh dày" },
      { name: "Tôm", amount: "200", unit: "g", notes: "Tôm to" },
      { name: "Thịt heo", amount: "200", unit: "g", notes: "Ba chỉ" },
      { name: "Trứng cút", amount: "8", unit: "quả", notes: "Luộc chín" },
    ],
    steps: [
      { order: 1, description: "Nấu nước dùng với xương", duration: 120 },
      { order: 2, description: "Chiên tôm thịt", duration: 10 },
      { order: 3, description: "Trần bánh tráng", duration: 2 },
    ],
    tags: ["quang-nam", "noodles", "rich-broth", "central"],
    category: "mon-chinh",
    prepTime: 30,
    cookTime: 140,
    servings: 4,
    status: "published",
  },
  {
    title: "Bánh Khọt Vũng Tàu",
    summary: "Bánh khọt mini giòn tan với tôm tươi",
    content: "Bánh khọt Vũng Tàu nổi tiếng với vỏ giòn...",
    ingredients: [
      { name: "Bột gạo", amount: "250", unit: "g", notes: "Bột mịn" },
      { name: "Bột nghệ", amount: "1", unit: "tsp", notes: "Tạo màu" },
      { name: "Tôm tươi", amount: "300", unit: "g", notes: "Tôm to" },
      { name: "Dừa tươi", amount: "200", unit: "ml", notes: "Nước cốt dừa" },
    ],
    steps: [
      { order: 1, description: "Pha bột với nước cốt dừa", duration: 15 },
      { order: 2, description: "Làm nóng khuôn bánh khọt", duration: 5 },
      { order: 3, description: "Đổ bột và thêm tôm", duration: 10 },
    ],
    tags: ["vung-tau", "coconut", "crispy", "mini-pancakes"],
    category: "mon-chinh",
    prepTime: 20,
    cookTime: 15,
    servings: 6,
    status: "published",
  },
  {
    title: "Nem Nướng Ninh Hòa",
    summary: "Nem nướng thơm ngon đặc sản Ninh Hòa",
    content: "Nem nướng Ninh Hòa có hương vị đặc biệt...",
    ingredients: [
      { name: "Thịt heo nạc", amount: "400", unit: "g", notes: "Xay nhuyễn" },
      { name: "Mỡ heo", amount: "100", unit: "g", notes: "Băm nhỏ" },
      { name: "Tỏi", amount: "20", unit: "g", notes: "Băm nhuyễn" },
      { name: "Nước mắm", amount: "30", unit: "ml", notes: "Loại ngon" },
    ],
    steps: [
      { order: 1, description: "Trộn thịt với gia vị", duration: 30 },
      { order: 2, description: "Vo viên nem", duration: 20 },
      { order: 3, description: "Nướng trên than hồng", duration: 15 },
    ],
    tags: ["ninh-hoa", "grilled", "meatballs", "specialty"],
    category: "mon-chinh",
    prepTime: 50,
    cookTime: 15,
    servings: 4,
    status: "draft",
  },
  {
    title: "Cháo Lòng Sài Gòn",
    summary: "Cháo lòng đậm đà với lòng heo tươi ngon",
    content: "Cháo lòng là món ăn sáng phổ biến ở Sài Gòn...",
    ingredients: [
      { name: "Gạo tẻ", amount: "200", unit: "g", notes: "Gạo thơm" },
      { name: "Lòng heo", amount: "300", unit: "g", notes: "Lòng tươi" },
      { name: "Tim heo", amount: "150", unit: "g", notes: "Thái lát" },
      { name: "Gan heo", amount: "150", unit: "g", notes: "Thái miếng" },
    ],
    steps: [
      { order: 1, description: "Sơ chế lòng heo", duration: 30 },
      { order: 2, description: "Nấu cháo gạo", duration: 45 },
      { order: 3, description: "Thêm lòng vào cháo", duration: 15 },
    ],
    tags: ["saigon", "porridge", "organ-meat", "breakfast"],
    category: "mon-chinh",
    prepTime: 40,
    cookTime: 90,
    servings: 4,
    status: "published",
  },
  {
    title: "Bánh Tráng Nướng Đà Lạt",
    summary: "Bánh tráng nướng Đà Lạt với trứng và pate",
    content: "Bánh tráng nướng là món ăn vặt đặc trưng Đà Lạt...",
    ingredients: [
      { name: "Bánh tráng", amount: "10", unit: "cái", notes: "Bánh mỏng" },
      { name: "Trứng gà", amount: "5", unit: "quả", notes: "Trứng tươi" },
      { name: "Pate", amount: "100", unit: "g", notes: "Pate gan" },
      { name: "Hành lá", amount: "30", unit: "g", notes: "Thái nhỏ" },
    ],
    steps: [
      { order: 1, description: "Nướng bánh tráng trên bếp than", duration: 2 },
      { order: 2, description: "Phết trứng và pate", duration: 3 },
      { order: 3, description: "Rắc hành lá", duration: 1 },
    ],
    tags: ["dalat", "grilled", "egg", "street-food"],
    category: "mon-chinh",
    prepTime: 10,
    cookTime: 6,
    servings: 5,
    status: "published",
  },
  {
    title: "Bánh Bèo Huế",
    summary: "Bánh bèo Huế với tôm chấy và mỡ hành",
    content: "Bánh bèo là món ăn nhẹ đặc trưng của Huế...",
    ingredients: [
      { name: "Bột gạo", amount: "300", unit: "g", notes: "Bột mịn" },
      { name: "Bột năng", amount: "50", unit: "g", notes: "Tạo độ dẻo" },
      { name: "Tôm khô", amount: "100", unit: "g", notes: "Rang giòn" },
      { name: "Mỡ heo", amount: "50", unit: "g", notes: "Chiên hành" },
    ],
    steps: [
      { order: 1, description: "Pha bột bánh bèo", duration: 15 },
      { order: 2, description: "Hấp bánh trong khuôn", duration: 10 },
      { order: 3, description: "Rắc tôm chấy và mỡ hành", duration: 5 },
    ],
    tags: ["hue", "steamed", "small-cakes", "traditional"],
    category: "mon-chinh",
    prepTime: 25,
    cookTime: 15,
    servings: 6,
    status: "published",
  },
  {
    title: "Bún Riêu Cua",
    summary: "Bún riêu cua đồng với nước dùng chua ngọt",
    content: "Bún riêu cua là món ăn dân dã với hương vị đặc trưng...",
    ingredients: [
      { name: "Bún tươi", amount: "400", unit: "g", notes: "Bún nhỏ" },
      { name: "Cua đồng", amount: "300", unit: "g", notes: "Cua tươi" },
      { name: "Cà chua", amount: "200", unit: "g", notes: "Cà chua chín" },
      { name: "Đậu hũ", amount: "200", unit: "g", notes: "Chiên vàng" },
    ],
    steps: [
      { order: 1, description: "Giã cua lấy riêu", duration: 30 },
      { order: 2, description: "Nấu nước dùng cà chua", duration: 25 },
      { order: 3, description: "Trần bún qua nước sôi", duration: 2 },
    ],
    tags: ["crab", "soup", "tomato", "traditional"],
    category: "mon-chinh",
    prepTime: 45,
    cookTime: 60,
    servings: 4,
    status: "published",
  },
  {
    title: "Chè Đậu Xanh",
    summary: "Chè đậu xanh mát lạnh với nước cốt dừa",
    content: "Chè đậu xanh là món tráng miệng truyền thống...",
    ingredients: [
      { name: "Đậu xanh", amount: "200", unit: "g", notes: "Đậu cựa" },
      { name: "Nước cốt dừa", amount: "200", unit: "ml", notes: "Đặc" },
      { name: "Đường", amount: "100", unit: "g", notes: "Đường cát" },
      { name: "Muối", amount: "1", unit: "tsp", notes: "Chút muối" },
    ],
    steps: [
      { order: 1, description: "Nấu chín đậu xanh", duration: 30 },
      { order: 2, description: "Làm nước cốt dừa", duration: 10 },
      { order: 3, description: "Trộn và làm lạnh", duration: 5 },
    ],
    tags: ["dessert", "coconut", "sweet", "cold"],
    category: "mon-chinh",
    prepTime: 15,
    cookTime: 45,
    servings: 4,
    status: "published",
  },
];

export async function seedRecipes() {
  try {
    await connectDB();

    // Get admin user
    const adminUser = await User.findOne({ email: "admin@example.com" });
    if (!adminUser) {
      console.log("❌ Admin user not found. Please create admin user first.");
      return;
    }

    // Clear existing recipes
    await Recipe.deleteMany({});
    console.log("🗑️ Cleared existing recipes");

    // Create new recipes with admin as author
    const recipes = sampleRecipes.map((recipe) => ({
      ...recipe,
      slug: slugify(recipe.title),
      authorId: adminUser._id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const createdRecipes = await Recipe.insertMany(recipes);
    console.log(`✅ Created ${createdRecipes.length} sample recipes`);

    console.log("📋 Sample recipes:");
    createdRecipes.forEach((recipe, index) => {
      console.log(`   ${index + 1}. ${recipe.title} (${recipe.status})`);
    });
  } catch (error) {
    console.error("❌ Error seeding recipes:", error);
  } finally {
    mongoose.connection.close();
  }
}

// Helper function to generate slug
function slugify(text) {
  return text
    .toString()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 120);
}

// Run seeder
console.log("🌱 Starting recipes seeder...");
seedRecipes();
