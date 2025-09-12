// tests/admin.media.test.js
import { expect } from "chai";
import request from "supertest";
import app from "../app.js";
import User from "../models/User.js";
import Media from "../models/Media.js";
import AuditLog from "../models/AuditLog.js";
import { generateAccessToken } from "../utils/jwt.js";
import { setupTestDB, teardownTestDB, clearDB } from "./setup.js";

describe("Admin Media API", () => {
  let adminToken, userToken, adminUser, normalUser;

  before(async () => {
    await setupTestDB();
  });

  after(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearDB();

    // Create test users
    adminUser = await User.create({
      name: "Admin User",
      email: "admin@test.com",
      password: "password123",
      role: "admin",
      isEmailVerified: true,
    });

    normalUser = await User.create({
      name: "Normal User",
      email: "user@test.com",
      password: "password123",
      role: "user",
      isEmailVerified: true,
    });

    adminToken = generateAccessToken(adminUser);
    userToken = generateAccessToken(normalUser);
  });

  describe("Authentication & Authorization", () => {
    it("should reject requests without token", async () => {
      const res = await request(app).get("/api/admin/media").expect(401);

      expect(res.body.error.code).to.equal("UNAUTHORIZED");
    });

    it("should reject non-admin users", async () => {
      const res = await request(app)
        .get("/api/admin/media")
        .set("Cookie", `token=${userToken}`)
        .expect(403);

      expect(res.body.error.code).to.equal("FORBIDDEN");
    });

    it("should allow admin users", async () => {
      const res = await request(app)
        .get("/api/admin/media")
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body).to.have.property("items");
    });
  });

  describe("Media Listing", () => {
    beforeEach(async () => {
      // Create test media
      await Media.create([
        {
          filename: "image1.jpg",
          originalName: "Original Image 1.jpg",
          mimeType: "image/jpeg",
          size: 1024,
          type: "image",
          url: "/uploads/image1.jpg",
          alt: "First image",
          tags: ["nature", "landscape"],
          uploaderId: normalUser._id,
          uploaderName: normalUser.name,
          storageType: "local",
          storageKey: "image1.jpg",
        },
        {
          filename: "video1.mp4",
          originalName: "Video 1.mp4",
          mimeType: "video/mp4",
          size: 2048,
          type: "video",
          url: "/uploads/video1.mp4",
          alt: "First video",
          tags: ["tutorial"],
          uploaderId: adminUser._id,
          uploaderName: adminUser.name,
          storageType: "local",
          storageKey: "video1.mp4",
        },
      ]);
    });

    it("should return paginated media list", async () => {
      const res = await request(app)
        .get("/api/admin/media?limit=1")
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.items).to.have.length(1);
      expect(res.body.pageInfo.hasNext).to.be.true;
      expect(res.body.total).to.equal(2);
    });

    it("should filter by type", async () => {
      const res = await request(app)
        .get("/api/admin/media?type=image")
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.items).to.have.length(1);
      expect(res.body.items[0].type).to.equal("image");
    });
  });

  describe("Statistics", () => {
    beforeEach(async () => {
      await Media.create([
        {
          filename: "stat1.jpg",
          originalName: "Stat 1.jpg",
          mimeType: "image/jpeg",
          size: 1024,
          type: "image",
          url: "/uploads/stat1.jpg",
          uploaderId: normalUser._id,
          uploaderName: normalUser.name,
          storageType: "local",
          storageKey: "stat1.jpg",
          usageCount: 5,
        },
      ]);
    });

    it("should get media statistics", async () => {
      const res = await request(app)
        .get("/api/admin/media/stats")
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.total).to.equal(1);
      expect(res.body.byType.image).to.exist;
      expect(res.body.byType.image.count).to.equal(1);
    });
  });
});
