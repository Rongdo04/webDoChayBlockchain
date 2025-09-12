// tests/admin.reports.test.js
import { expect } from "chai";
import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import User from "../models/User.js";
import Recipe from "../models/Recipe.js";
import Comment from "../models/Comment.js";
import Report from "../models/Report.js";
import AuditLog from "../models/AuditLog.js";
import { generateAccessToken } from "../utils/jwt.js";
import { setupTestDB, teardownTestDB, clearDB } from "./setup.js";

describe("Admin Reports API", () => {
  let adminUser, normalUser, testRecipe, testComment, adminToken;

  before(async () => {
    await setupTestDB();
  });

  after(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearDB();

    // Create test admin user
    adminUser = await User.create({
      name: "Admin User",
      email: "admin@test.com",
      password: "password123",
      role: "admin",
      isEmailVerified: true,
    });

    // Create test normal user
    normalUser = await User.create({
      name: "Normal User",
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
      description: "Test description",
      prepTime: 10,
      cookTime: 20,
      servings: 4,
      difficulty: "easy",
      ingredients: [{ name: "ingredient 1", amount: "1", unit: "cup" }],
      steps: [{ order: 1, description: "step 1" }],
      authorId: normalUser._id,
      status: "published",
    });

    // Create test comment
    testComment = await Comment.create({
      content: "Test comment",
      recipeId: testRecipe._id,
      userId: normalUser._id,
      status: "approved",
    });

    // Generate admin token
    adminToken = generateAccessToken(adminUser);
  });

  describe("Authentication & Authorization", () => {
    it("should reject requests without token", async () => {
      const res = await request(app).get("/api/admin/reports").expect(401);

      expect(res.body.error.code).to.equal("UNAUTHORIZED");
    });

    it("should reject non-admin users", async () => {
      const userToken = generateAccessToken(normalUser);

      const res = await request(app)
        .get("/api/admin/reports")
        .set("Cookie", `token=${userToken}`)
        .expect(403);

      expect(res.body.error.code).to.equal("FORBIDDEN");
    });

    it("should allow admin users", async () => {
      const res = await request(app)
        .get("/api/admin/reports")
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
    });
  });

  describe("GET /api/admin/reports", () => {
    beforeEach(async () => {
      // Create test reports
      await Report.create([
        {
          targetType: "comment",
          targetId: testComment._id,
          reason: "spam",
          description: "This is spam",
          reporterId: normalUser._id,
          status: "open",
        },
        {
          targetType: "recipe",
          targetId: testRecipe._id,
          reason: "inappropriate",
          description: "Inappropriate content",
          reporterId: normalUser._id,
          status: "open",
        },
        {
          targetType: "comment",
          targetId: testComment._id,
          reason: "abuse",
          description: "Abusive comment",
          reporterId: adminUser._id,
          status: "resolved",
        },
      ]);
    });

    it("should list all reports", async () => {
      const res = await request(app)
        .get("/api/admin/reports")
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.items).to.be.an("array");
      expect(res.body.data.items.length).to.equal(3);
    });

    it("should filter by status", async () => {
      const res = await request(app)
        .get("/api/admin/reports?status=open")
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.items.length).to.equal(2);
      res.body.data.items.forEach((report) => {
        expect(report.status).to.equal("open");
      });
    });

    it("should filter by target type", async () => {
      const res = await request(app)
        .get("/api/admin/reports?targetType=comment")
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.items.length).to.equal(2);
      res.body.data.items.forEach((report) => {
        expect(report.targetType).to.equal("comment");
      });
    });

    it("should filter by reason", async () => {
      const res = await request(app)
        .get("/api/admin/reports?reason=spam")
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.items.length).to.equal(1);
      expect(res.body.data.items[0].reason).to.equal("spam");
    });

    it("should validate query parameters", async () => {
      const res = await request(app)
        .get("/api/admin/reports?status=invalid")
        .set("Cookie", `token=${adminToken}`)
        .expect(422);

      expect(res.body.error.details.status).to.exist;
    });

    it("should support pagination", async () => {
      const res = await request(app)
        .get("/api/admin/reports?limit=2")
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.items.length).to.equal(2);
      expect(res.body.data.pagination).to.have.property("hasNext");
    });
  });

  describe("GET /api/admin/reports/:id", () => {
    let testReport;

    beforeEach(async () => {
      testReport = await Report.create({
        targetType: "comment",
        targetId: testComment._id,
        reason: "spam",
        description: "This is spam",
        reporterId: normalUser._id,
        status: "open",
      });
    });

    it("should get report details", async () => {
      const res = await request(app)
        .get(`/api/admin/reports/${testReport._id}`)
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data._id).to.equal(testReport._id.toString());
      expect(res.body.data.reason).to.equal("spam");
      expect(res.body.data.reporterId).to.have.property("name");
    });

    it("should return 404 for non-existent report", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/admin/reports/${fakeId}`)
        .set("Cookie", `token=${adminToken}`)
        .expect(404);

      expect(res.body.error.code).to.equal("REPORT_NOT_FOUND");
    });

    it("should validate report ID format", async () => {
      const res = await request(app)
        .get("/api/admin/reports/invalid-id")
        .set("Cookie", `token=${adminToken}`)
        .expect(422);

      expect(res.body.error.details.id).to.exist;
    });
  });

  describe("POST /api/admin/reports/:id/resolve", () => {
    let openReport;

    beforeEach(async () => {
      openReport = await Report.create({
        targetType: "comment",
        targetId: testComment._id,
        reason: "spam",
        description: "This is spam",
        reporterId: normalUser._id,
        status: "open",
      });
    });

    it("should resolve report with no_action", async () => {
      const res = await request(app)
        .post(`/api/admin/reports/${openReport._id}/resolve`)
        .send({
          resolution: "no_action",
          note: "False positive",
        })
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.status).to.equal("resolved");
      expect(res.body.data.resolution.action).to.equal("no_action");
      expect(res.body.data.resolution.note).to.equal("False positive");
    });

    it("should resolve report with hidden action for comment", async () => {
      const res = await request(app)
        .post(`/api/admin/reports/${openReport._id}/resolve`)
        .send({
          resolution: "hidden",
          note: "Confirmed spam",
        })
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.resolution.action).to.equal("hidden");

      // Check that comment was actually hidden
      const updatedComment = await Comment.findById(testComment._id);
      expect(updatedComment.status).to.equal("hidden");
    });

    it("should resolve report with removed action", async () => {
      const res = await request(app)
        .post(`/api/admin/reports/${openReport._id}/resolve`)
        .send({
          resolution: "removed",
          note: "Severe violation",
        })
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.resolution.action).to.equal("removed");
    });

    it("should log audit trail", async () => {
      await request(app)
        .post(`/api/admin/reports/${openReport._id}/resolve`)
        .send({
          resolution: "no_action",
          note: "Test resolution",
        })
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      const auditLog = await AuditLog.findOne({
        action: "update",
        entityId: openReport._id,
      });

      expect(auditLog).to.exist;
      expect(auditLog.metadata.operation).to.equal("resolve_report");
      expect(auditLog.metadata.resolution.action).to.equal("no_action");
    });

    it("should return 404 for non-existent report", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post(`/api/admin/reports/${fakeId}/resolve`)
        .send({
          resolution: "no_action",
        })
        .set("Cookie", `token=${adminToken}`)
        .expect(404);

      expect(res.body.error.code).to.equal("REPORT_NOT_FOUND");
    });

    it("should validate resolution action", async () => {
      const res = await request(app)
        .post(`/api/admin/reports/${openReport._id}/resolve`)
        .send({
          resolution: "invalid_action",
        })
        .set("Cookie", `token=${adminToken}`)
        .expect(422);

      expect(res.body.error.details.resolution).to.exist;
    });

    it("should validate note length", async () => {
      const longNote = "x".repeat(501);
      const res = await request(app)
        .post(`/api/admin/reports/${openReport._id}/resolve`)
        .send({
          resolution: "no_action",
          note: longNote,
        })
        .set("Cookie", `token=${adminToken}`)
        .expect(422);

      expect(res.body.error.details.note).to.exist;
    });

    it("should not resolve already resolved report", async () => {
      // First resolution
      await request(app)
        .post(`/api/admin/reports/${openReport._id}/resolve`)
        .send({ resolution: "no_action" })
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      // Second attempt should fail
      const res = await request(app)
        .post(`/api/admin/reports/${openReport._id}/resolve`)
        .send({ resolution: "hidden" })
        .set("Cookie", `token=${adminToken}`)
        .expect(400);

      expect(res.body.error.code).to.equal("REPORT_ALREADY_RESOLVED");
    });
  });

  describe("GET /api/admin/reports/stats", () => {
    beforeEach(async () => {
      // Create various reports for stats
      await Report.create([
        {
          targetType: "comment",
          targetId: testComment._id,
          reason: "spam",
          reporterId: normalUser._id,
          status: "open",
        },
        {
          targetType: "recipe",
          targetId: testRecipe._id,
          reason: "abuse",
          reporterId: normalUser._id,
          status: "resolved",
        },
        {
          targetType: "comment",
          targetId: testComment._id,
          reason: "inappropriate",
          reporterId: adminUser._id,
          status: "open",
        },
      ]);
    });

    it("should get report statistics", async () => {
      const res = await request(app)
        .get("/api/admin/reports/stats")
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.total).to.equal(3);
      expect(res.body.data.open).to.equal(2);
      expect(res.body.data.resolved).to.equal(1);
      expect(res.body.data.byReason).to.be.an("array");
      expect(res.body.data.byTargetType).to.be.an("array");
    });
  });

  describe("Recipe Report Resolution", () => {
    let recipeReport;

    beforeEach(async () => {
      recipeReport = await Report.create({
        targetType: "recipe",
        targetId: testRecipe._id,
        reason: "inappropriate",
        description: "Inappropriate recipe content",
        reporterId: normalUser._id,
        status: "open",
      });
    });

    it("should handle recipe removal resolution", async () => {
      const res = await request(app)
        .post(`/api/admin/reports/${recipeReport._id}/resolve`)
        .send({
          resolution: "removed",
          note: "Recipe violates guidelines",
        })
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;

      // Check that recipe was rejected
      const updatedRecipe = await Recipe.findById(testRecipe._id);
      expect(updatedRecipe.status).to.equal("rejected");
      expect(updatedRecipe.rejection.reason).to.include(
        "Recipe violates guidelines"
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle non-existent target comment", async () => {
      const fakeCommentId = new mongoose.Types.ObjectId();
      const report = await Report.create({
        targetType: "comment",
        targetId: fakeCommentId,
        reason: "spam",
        reporterId: normalUser._id,
        status: "open",
      });

      const res = await request(app)
        .post(`/api/admin/reports/${report._id}/resolve`)
        .send({
          resolution: "hidden",
          note: "Test with non-existent comment",
        })
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      // Should still resolve the report even if target doesn't exist
      expect(res.body.success).to.be.true;
      expect(res.body.data.status).to.equal("resolved");
    });
  });
});
