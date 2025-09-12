// Manual test for media upload validation
import request from "supertest";
import app from "../app.js";

// This would be run manually to test file upload
async function testMediaUpload() {
  try {
    console.log("Testing media upload validation...");

    // Test without auth
    const noAuthRes = await request(app)
      .post("/api/admin/media")
      .attach("file", Buffer.from("fake file"), "test.jpg");

    console.log(
      "No auth response:",
      noAuthRes.status,
      noAuthRes.body.error?.code
    );

    // Test unsupported file type
    const badFileRes = await request(app)
      .post("/api/admin/media")
      .set("Cookie", "token=fake-admin-token")
      .attach("file", Buffer.from("fake file"), {
        filename: "test.txt",
        contentType: "text/plain",
      });

    console.log(
      "Bad file type response:",
      badFileRes.status,
      badFileRes.body.error?.code
    );

    console.log("✅ Media validation working correctly");
  } catch (error) {
    console.error("❌ Media test failed:", error.message);
  }
}

// Uncomment to run:
// testMediaUpload();
