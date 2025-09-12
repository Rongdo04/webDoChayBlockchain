// list-media-names.js
import Media from "./models/Media.js";
import mongoose from "mongoose";

await mongoose.connect("mongodb://localhost:27017/Web_Do_Chay");

try {
  const mediaFiles = await Media.find({ type: "image" }).sort({
    originalName: 1,
  });

  console.log("=== AVAILABLE MEDIA FILES ===");
  mediaFiles.forEach((media, index) => {
    console.log(`${index + 1}. ${media.originalName}`);
    console.log(`   ID: ${media._id}`);
    console.log(`   URL: ${media.url}`);
    console.log("");
  });

  console.log("\n=== RECIPE NAME SUGGESTIONS ===");
  mediaFiles.forEach((media, index) => {
    const name = media.originalName
      .replace(".jpg", "")
      .replace(".jpeg", "")
      .replace(".png", "");
    console.log(`"${name}",`);
  });
} catch (error) {
  console.error("Error:", error);
} finally {
  await mongoose.disconnect();
}
