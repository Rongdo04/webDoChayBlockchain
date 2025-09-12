import fs from "fs";

const filePath = "tests/admin.comments.test.js";
let content = fs.readFileSync(filePath, "utf8");

// Replace all Authorization Bearer headers with Cookie headers
content = content.replace(
  /\.set\('Authorization', `Bearer \$\{adminToken\}`\)/g,
  ".set('Cookie', `token=${adminToken}`)"
);

fs.writeFileSync(filePath, content, "utf8");
console.log("Replaced all Authorization headers with Cookie headers");
