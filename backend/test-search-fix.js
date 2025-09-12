import "./config/database.js";
import Recipe from "./models/Recipe.js";

async function testSearch() {
  try {
    console.log("Testing search functionality...");

    // Test search for 'canh' which was in the error
    const searchTerm = "canh";
    const filters = {
      status: "published",
      $or: [
        { title: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
        { "ingredients.name": { $regex: searchTerm, $options: "i" } },
      ],
    };

    const results = await Recipe.find(filters).limit(5);
    console.log(`Search results for "${searchTerm}":`, results.length);

    if (results.length > 0) {
      results.forEach((recipe) => {
        console.log("- " + recipe.title);
        console.log("  Category:", recipe.category);
        console.log("  Status:", recipe.status);
      });
    }

    // Also test a simple search without filters
    const allRecipes = await Recipe.find({ status: "published" }).limit(3);
    console.log("\nAll published recipes:", allRecipes.length);
    allRecipes.forEach((recipe) => {
      console.log("- " + recipe.title);
    });
  } catch (error) {
    console.error("Search test error:", error);
  } finally {
    process.exit(0);
  }
}

testSearch();
