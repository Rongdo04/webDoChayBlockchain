// tests/admin.reports.complete.test.js
import { expect } from "chai";
import request from "supertest";
import app from "../app.js";
import { connectDB, disconnectDB } from "../config/database.js";
import User from "../models/User.js";
import Report from "../models/Report.js";
import Recipe from "../models/Recipe.js";
import Comment from "../models/Comment.js";

describe("Admin Reports API - Complete Test Suite", () => {
  let adminToken;
  let userToken;
  let adminUser;
  let regularUser;
  let testRecipe;
  let testComment;
  let testReport;

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

    // Create test recipe
    testRecipe = await Recipe.create({
      title: "Test Recipe",
      slug: "test-recipe",
      summary: "A test recipe",
      content: "Test content",
      ingredients: [{ name: "Test ingredient", amount: "1", unit: "cup" }],
      steps: [{ order: 1, description: "Test step" }],
      authorId: regularUser._id,
      status: "published",
    });

    // Create test comment
    testComment = await Comment.create({
      content: "Test comment content",
      userId: regularUser._id,
      recipeId: testRecipe._id,
    });

    // Create test report
    testReport = await Report.create({
      targetType: "recipe",
      targetId: testRecipe._id,
      reason: "inappropriate",
      description: "This recipe contains inappropriate content",
      reporterId: regularUser._id,
      status: "pending",
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
    await Report.deleteMany({});
    await Recipe.deleteMany({});
    await Comment.deleteMany({});
    await disconnectDB();
  });

  describe("GET /api/admin/reports", () => {
    it("should list reports with pagination", async () => {
      const res = await request(app)
        .get("/api/admin/reports")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data).to.have.property("items");
      expect(res.body.data).to.have.property("pagination");
      expect(res.body.data.items).to.be.an("array");
    });

    it("should filter reports by status", async () => {
      const res = await request(app)
        .get("/api/admin/reports?status=pending")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.items).to.be.an("array");
    });

    it("should filter reports by target type", async () => {
      const res = await request(app)
        .get("/api/admin/reports?targetType=recipe")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.items).to.be.an("array");
    });

    it("should require admin authentication", async () => {
      const res = await request(app).get("/api/admin/reports").expect(401);

      expect(res.body.success).to.be.false;
    });

    it("should reject non-admin users", async () => {
      const res = await request(app)
        .get("/api/admin/reports")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(403);

      expect(res.body.success).to.be.false;
    });
  });

  describe("GET /api/admin/reports/stats", () => {
    it("should get report statistics", async () => {
      const res = await request(app)
        .get("/api/admin/reports/stats")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data).to.have.property("total");
      expect(res.body.data).to.have.property("byReason");
      expect(res.body.data).to.have.property("byTargetType");
    });
  });

  describe("GET /api/admin/reports/:id", () => {
    it("should get single report details", async () => {
      const res = await request(app)
        .get(`/api/admin/reports/${testReport._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data).to.have.property("_id");
      expect(res.body.data).to.have.property("targetType");
      expect(res.body.data).to.have.property("reason");
    });

    it("should return 404 for non-existent report", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const res = await request(app)
        .get(`/api/admin/reports/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404);

      expect(res.body.success).to.be.false;
    });
  });

  describe("PUT /api/admin/reports/:id/status", () => {
    it("should update report status", async () => {
      const res = await request(app)
        .put(`/api/admin/reports/${testReport._id}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          status: "reviewed",
          notes: "Admin reviewed this report",
        })
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.status).to.equal("reviewed");
      expect(res.body.data.adminNotes).to.equal("Admin reviewed this report");
    });

    it("should validate status values", async () => {
      const res = await request(app)
        .put(`/api/admin/reports/${testReport._id}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          status: "invalid_status",
        })
        .expect(422);

      expect(res.body.success).to.be.false;
    });
  });

  describe("POST /api/admin/reports/:id/resolve", () => {
    it("should resolve report with no action", async () => {
      const res = await request(app)
        .post(`/api/admin/reports/${testReport._id}/resolve`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          resolution: "no_action",
          note: "No action needed",
        })
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.status).to.equal("resolved");
      expect(res.body.data.resolution.action).to.equal("no_action");
    });

    it("should validate resolution values", async () => {
      const res = await request(app)
        .post(`/api/admin/reports/${testReport._id}/resolve`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          resolution: "invalid_action",
        })
        .expect(422);

      expect(res.body.success).to.be.false;
    });
  });

  describe("DELETE /api/admin/reports/:id", () => {
    let reportToDelete;

    beforeEach(async () => {
      // Create a new report to delete
      reportToDelete = await Report.create({
        targetType: "recipe",
        targetId: testRecipe._id,
        reason: "spam",
        description: "This is spam",
        reporterId: regularUser._id,
        status: "pending",
      });
    });

    it("should delete a report", async () => {
      const res = await request(app)
        .delete(`/api/admin/reports/${reportToDelete._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.deleted).to.be.true;

      // Verify report is deleted
      const deletedReport = await Report.findById(reportToDelete._id);
      expect(deletedReport).to.be.null;
    });

    it("should return 404 for non-existent report", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const res = await request(app)
        .delete(`/api/admin/reports/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404);

      expect(res.body.success).to.be.false;
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid report ID format", async () => {
      const res = await request(app)
        .get("/api/admin/reports/invalid-id")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(422);

      expect(res.body.success).to.be.false;
      expect(res.body.error.code).to.equal("VALIDATION_ERROR");
    });

    it("should handle missing authentication", async () => {
      const res = await request(app).get("/api/admin/reports").expect(401);

      expect(res.body.success).to.be.false;
    });

    it("should handle insufficient permissions", async () => {
      const res = await request(app)
        .get("/api/admin/reports")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(403);

      expect(res.body.success).to.be.false;
    });
  });
});
