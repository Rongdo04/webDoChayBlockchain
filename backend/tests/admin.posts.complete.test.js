// tests/admin.posts.complete.test.js
import { expect } from "chai";
import request from "supertest";
import app from "../app.js";
import { connectDB, disconnectDB } from "../config/database.js";
import User from "../models/User.js";
import Post from "../models/Post.js";

describe("Admin Posts API - Complete Test Suite", () => {
  let adminToken;
  let userToken;
  let adminUser;
  let regularUser;
  let testPost;

  before(async () => {
    await connectDB();

    // Create admin user
    adminUser = await User.create({
      name: "Admin User",
      email: "admin@test.com",
      password: "password123",
      role: "admin",
      isEmailVerified: true,
    });

    // Create regular user
    regularUser = await User.create({
      name: "Regular User",
      email: "user@test.com",
      password: "password123",
      role: "user",
      isEmailVerified: true,
    });

    // Create test post
    testPost = await Post.create({
      content: "This is a test post content for admin testing",
      tag: "Kinh nghiệm",
      userId: regularUser._id,
      status: "published",
    });

    // Get admin token
    const adminLogin = await request(app).post("/api/auth/login").send({
      email: "admin@test.com",
      password: "password123",
    });
    adminToken = adminLogin.body.data.token;

    // Get user token
    const userLogin = await request(app).post("/api/auth/login").send({
      email: "user@test.com",
      password: "password123",
    });
    userToken = userLogin.body.data.token;
  });

  after(async () => {
    await User.deleteMany({});
    await Post.deleteMany({});
    await disconnectDB();
  });

  describe("GET /api/admin/posts", () => {
    it("should list posts with pagination", async () => {
      const res = await request(app)
        .get("/api/admin/posts")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data).to.have.property("items");
      expect(res.body.data).to.have.property("pagination");
      expect(res.body.data.items).to.be.an("array");
    });

    it("should filter posts by status", async () => {
      const res = await request(app)
        .get("/api/admin/posts?status=published")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.items).to.be.an("array");
    });

    it("should filter posts by tag", async () => {
      const res = await request(app)
        .get("/api/admin/posts?tag=Kinh nghiệm")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.items).to.be.an("array");
    });

    it("should require admin authentication", async () => {
      const res = await request(app).get("/api/admin/posts").expect(401);

      expect(res.body.success).to.be.false;
    });

    it("should reject non-admin users", async () => {
      const res = await request(app)
        .get("/api/admin/posts")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(403);

      expect(res.body.success).to.be.false;
    });
  });

  describe("GET /api/admin/posts/stats", () => {
    it("should get post statistics", async () => {
      const res = await request(app)
        .get("/api/admin/posts/stats")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data).to.have.property("total");
      expect(res.body.data).to.have.property("byTag");
      expect(res.body.data).to.have.property("byStatus");
    });
  });

  describe("GET /api/admin/posts/:id", () => {
    it("should get single post details", async () => {
      const res = await request(app)
        .get(`/api/admin/posts/${testPost._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data).to.have.property("_id");
      expect(res.body.data).to.have.property("content");
      expect(res.body.data).to.have.property("tag");
    });

    it("should return 404 for non-existent post", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const res = await request(app)
        .get(`/api/admin/posts/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404);

      expect(res.body.success).to.be.false;
    });
  });

  describe("PUT /api/admin/posts/:id/status", () => {
    it("should update post status", async () => {
      const res = await request(app)
        .put(`/api/admin/posts/${testPost._id}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          status: "hidden",
          moderationNote: "Admin hidden this post",
        })
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.status).to.equal("hidden");
      expect(res.body.data.moderationNote).to.equal("Admin hidden this post");
    });

    it("should validate status values", async () => {
      const res = await request(app)
        .put(`/api/admin/posts/${testPost._id}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          status: "invalid_status",
        })
        .expect(422);

      expect(res.body.success).to.be.false;
    });
  });

  describe("POST /api/admin/posts/:id/moderate", () => {
    it("should moderate post with approve action", async () => {
      const res = await request(app)
        .post(`/api/admin/posts/${testPost._id}/moderate`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          action: "approve",
          note: "Post approved by admin",
        })
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.status).to.equal("published");
    });

    it("should moderate post with reject action", async () => {
      const res = await request(app)
        .post(`/api/admin/posts/${testPost._id}/moderate`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          action: "reject",
          note: "Post rejected by admin",
        })
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.status).to.equal("hidden");
    });

    it("should validate action values", async () => {
      const res = await request(app)
        .post(`/api/admin/posts/${testPost._id}/moderate`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          action: "invalid_action",
        })
        .expect(422);

      expect(res.body.success).to.be.false;
    });
  });

  describe("DELETE /api/admin/posts/:id", () => {
    let postToDelete;

    beforeEach(async () => {
      // Create a new post to delete
      postToDelete = await Post.create({
        content: "This post will be deleted",
        tag: "Hỏi đáp",
        userId: regularUser._id,
        status: "published",
      });
    });

    it("should delete a post", async () => {
      const res = await request(app)
        .delete(`/api/admin/posts/${postToDelete._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.deleted).to.be.true;

      // Verify post is deleted
      const deletedPost = await Post.findById(postToDelete._id);
      expect(deletedPost).to.be.null;
    });

    it("should return 404 for non-existent post", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const res = await request(app)
        .delete(`/api/admin/posts/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404);

      expect(res.body.success).to.be.false;
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid post ID format", async () => {
      const res = await request(app)
        .get("/api/admin/posts/invalid-id")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(422);

      expect(res.body.success).to.be.false;
      expect(res.body.error.code).to.equal("VALIDATION_ERROR");
    });

    it("should handle missing authentication", async () => {
      const res = await request(app).get("/api/admin/posts").expect(401);

      expect(res.body.success).to.be.false;
    });

    it("should handle insufficient permissions", async () => {
      const res = await request(app)
        .get("/api/admin/posts")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(403);

      expect(res.body.success).to.be.false;
    });
  });
});
