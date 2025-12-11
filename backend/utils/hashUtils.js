// utils/hashUtils.js
import crypto from "crypto";

/**
 * Tính SHA256 hash của công thức nấu ăn
 * Loại bỏ các trường không cần thiết để đảm bảo hash nhất quán
 * 
 * @param {Object} recipeData - Dữ liệu công thức
 * @returns {string} Hash SHA256 của công thức
 */
export function generateRecipeHash(recipeData) {
  // Tạo object sạch, loại bỏ các trường không cần thiết
  const cleanData = {
    title: recipeData.title || "",
    summary: recipeData.summary || "",
    content: recipeData.content || "",
    ingredients: (recipeData.ingredients || []).map(ing => ({
      name: ing.name || "",
      amount: ing.amount || "",
      unit: ing.unit || "",
      notes: ing.notes || ""
    })),
    steps: (recipeData.steps || []).map(step => ({
      order: step.order || 0,
      title: step.title || "",
      description: step.description || "",
      duration: step.duration || 0,
      temperature: step.temperature || ""
    })),
    tags: (recipeData.tags || []).sort(), // Sắp xếp để đảm bảo thứ tự nhất quán
    category: recipeData.category || "",
    prepTime: recipeData.prepTime || 0,
    cookTime: recipeData.cookTime || 0,
    servings: recipeData.servings || 0
  };

  // Chuyển đổi thành JSON string và tính hash
  // Sử dụng JSON.stringify với sortKeys để đảm bảo thứ tự nhất quán
  const jsonString = JSON.stringify(cleanData, Object.keys(cleanData).sort());
  
  // Tính SHA256 hash
  const hash = crypto
    .createHash("sha256")
    .update(jsonString, "utf8")
    .digest("hex");

  return hash;
}

/**
 * So sánh hai hash công thức
 * @param {string} hash1 - Hash thứ nhất
 * @param {string} hash2 - Hash thứ hai
 * @returns {boolean} Trả về true nếu hai hash giống nhau
 */
export function compareHashes(hash1, hash2) {
  return hash1 && hash2 && hash1.toLowerCase() === hash2.toLowerCase();
}


