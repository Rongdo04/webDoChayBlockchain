// scripts/seed-comments.js
import seedComments from "../seeders/comments.seeder.js";

console.log("🌱 Starting comment seeding process...");
console.log("📝 This will create sample comments with different statuses:");
console.log("   - Approved comments (70%)");
console.log("   - Pending comments (20%) ");
console.log("   - Hidden comments (10%)");
console.log("   - Comments with ratings");
console.log("   - Reply comments");
console.log("");

seedComments();
