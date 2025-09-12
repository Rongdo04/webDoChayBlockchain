// tests/admin.audit.test.js
import { expect } from "chai";
import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import User from "../models/User.js";
import Recipe from "../models/Recipe.js";
import Comment from "../models/Comment.js";
import AuditLog from "../models/AuditLog.js";
import Settings from "../models/Settings.js";
import { generateAccessToken } from "../utils/jwt.js";
import { setupTestDB, teardownTestDB, clearDB } from "./setup.js";

describe("Admin Audit System", () => {
  let adminToken;
  let adminUser;
  let testRecipe;
  let testComment;

  before(async () => {
    await setupTestDB();
  });

  after(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearDB();

    // Create admin user
    adminUser = await User.create({
      name: "Admin User",
      email: "admin@test.com",
      password: "password123",
      role: "admin",
      isEmailVerified: true,
      isActive: true,
    });

    // Create regular user
    const regularUser = await User.create({
      name: "Regular User",
      email: "user@test.com",
      password: "password123",
      role: "user",
      isEmailVerified: true,
      isActive: true,
    });

    // Generate admin token
    adminToken = generateAccessToken(adminUser._id);

    // Create test recipe
    testRecipe = await Recipe.create({
      title: "Test Recipe",
      slug: "test-recipe",
      summary: "Test recipe for audit",
      content: "Test content",
      authorId: regularUser._id,
      status: "draft",
    });

    // Create test comment
    testComment = await Comment.create({
      content: "Test comment for audit",
      recipeId: testRecipe._id,
      userId: regularUser._id,
      status: "pending",
    });
  });

  describe("GET /api/admin/audit-logs", () => {
    it("should return audit logs with pagination", async () => {
      // First, create some audit logs by performing actions
      await request(app)
        .put(`/api/admin/recipes/${testRecipe._id}/publish`)
        .set("Cookie", `token=${adminToken}`)
        .send({ publishAt: null });

      await request(app)
        .put(`/api/admin/settings`)
        .set("Cookie", `token=${adminToken}`)
        .send({
          siteTitle: "New Title",
          siteDesc: "New Description",
          brand: "NewBrand",
          policy: "New Policy",
        });

      // Now fetch the audit logs
      const res = await request(app)
        .get("/api/admin/audit-logs")
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body).to.have.property("success", true);
      expect(res.body.data).to.have.property("logs");
      expect(res.body.data).to.have.property("pagination");
      expect(res.body.data.logs).to.be.an("array");
      expect(res.body.data.logs.length).to.be.greaterThan(0);

      // Check log structure
      const log = res.body.data.logs[0];
      expect(log).to.have.property("id");
      expect(log).to.have.property("action");
      expect(log).to.have.property("entityType");
      expect(log).to.have.property("actor");
      expect(log).to.have.property("timestamp");
      expect(log).to.have.property("description");
    });

    it("should filter audit logs by action", async () => {
      // Create a publish action
      await request(app)
        .put(`/api/admin/recipes/${testRecipe._id}/publish`)
        .set("Cookie", `token=${adminToken}`)
        .send({ publishAt: null });

      // Filter by publish action
      const res = await request(app)
        .get("/api/admin/audit-logs?action=publish")
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.logs.every((log) => log.action === "publish")).to.be
        .true;
    });

    it("should filter audit logs by entity type", async () => {
      // Create a settings update
      await request(app)
        .put(`/api/admin/settings`)
        .set("Cookie", `token=${adminToken}`)
        .send({
          siteTitle: "Filtered Title",
          siteDesc: "Filtered Description",
          brand: "FilterBrand",
          policy: "Filter Policy",
        });

      // Filter by settings entity type
      const res = await request(app)
        .get("/api/admin/audit-logs?entityType=settings")
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.logs.every((log) => log.entityType === "settings"))
        .to.be.true;
    });

    it("should support pagination", async () => {
      // Create multiple audit entries
      for (let i = 0; i < 5; i++) {
        await request(app)
          .put(`/api/admin/settings`)
          .set("Cookie", `token=${adminToken}`)
          .send({
            siteTitle: `Title ${i}`,
            siteDesc: "Test Description",
            brand: "TestBrand",
            policy: "Test Policy",
          });
      }

      // Test pagination
      const res = await request(app)
        .get("/api/admin/audit-logs?limit=2&page=1")
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.logs).to.have.length.at.most(2);
      expect(res.body.data.pagination).to.have.property("currentPage", 1);
      expect(res.body.data.pagination).to.have.property("itemsPerPage", 2);
    });
  });

  describe("Recipe Actions Audit", () => {
    it("should audit recipe publish action", async () => {
      await request(app)
        .put(`/api/admin/recipes/${testRecipe._id}/publish`)
        .set("Cookie", `token=${adminToken}`)
        .send({ publishAt: null });

      const auditLogs = await AuditLog.find({
        action: "publish",
        entityType: "recipe",
        entityId: testRecipe._id,
      });

      expect(auditLogs).to.have.length(1);
      expect(auditLogs[0].userId.toString()).to.equal(adminUser._id.toString());
      expect(auditLogs[0].userRole).to.equal("admin");
    });

    it("should audit recipe unpublish action", async () => {
      // First publish the recipe
      await Recipe.findByIdAndUpdate(testRecipe._id, { status: "published" });

      await request(app)
        .put(`/api/admin/recipes/${testRecipe._id}/unpublish`)
        .set("Cookie", `token=${adminToken}`);

      const auditLogs = await AuditLog.find({
        action: "unpublish",
        entityType: "recipe",
        entityId: testRecipe._id,
      });

      expect(auditLogs).to.have.length(1);
      expect(auditLogs[0].userId.toString()).to.equal(adminUser._id.toString());
    });

    it("should audit recipe reject action", async () => {
      const rejectReason = "Content not suitable";

      await request(app)
        .put(`/api/admin/recipes/${testRecipe._id}/reject`)
        .set("Cookie", `token=${adminToken}`)
        .send({ reason: rejectReason });

      const auditLogs = await AuditLog.find({
        action: "reject",
        entityType: "recipe",
        entityId: testRecipe._id,
      });

      expect(auditLogs).to.have.length(1);
      expect(auditLogs[0].userId.toString()).to.equal(adminUser._id.toString());
    });
  });

  describe("Comment Actions Audit", () => {
    it("should audit comment approval", async () => {
      await request(app)
        .put(`/api/admin/comments/${testComment._id}/approve`)
        .set("Cookie", `token=${adminToken}`);

      const auditLogs = await AuditLog.find({
        action: "approve",
        entityType: "comment",
        entityId: testComment._id,
      });

      expect(auditLogs).to.have.length(1);
      expect(auditLogs[0].userId.toString()).to.equal(adminUser._id.toString());
    });

    it("should audit comment hide", async () => {
      await request(app)
        .put(`/api/admin/comments/${testComment._id}/hide`)
        .set("Cookie", `token=${adminToken}`)
        .send({ reason: "Inappropriate content" });

      const auditLogs = await AuditLog.find({
        action: "hide",
        entityType: "comment",
        entityId: testComment._id,
      });

      expect(auditLogs).to.have.length(1);
      expect(auditLogs[0].userId.toString()).to.equal(adminUser._id.toString());
    });
  });

  describe("Settings Actions Audit", () => {
    it("should audit settings updates", async () => {
      const updateData = {
        siteTitle: "Audit Test Title",
        siteDesc: "Audit test description",
        brand: "AuditBrand",
        policy: "Audit test policy",
      };

      await request(app)
        .put("/api/admin/settings")
        .set("Cookie", `token=${adminToken}`)
        .send(updateData);

      const auditLogs = await AuditLog.find({
        action: "update",
        entityType: "settings",
      });

      expect(auditLogs).to.have.length(1);
      expect(auditLogs[0].userId.toString()).to.equal(adminUser._id.toString());
      expect(auditLogs[0]).to.have.property("details");
      expect(auditLogs[0].details).to.have.property("changes");
    });
  });

  describe("User Actions Audit", () => {
    it("should audit user role changes", async () => {
      const regularUser = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        role: "user",
      });

      await request(app)
        .put(`/api/admin/users/${regularUser._id}/role`)
        .set("Cookie", `token=${adminToken}`)
        .send({ role: "moderator" });

      const auditLogs = await AuditLog.find({
        action: "update",
        entityType: "user",
        entityId: regularUser._id,
      });

      expect(auditLogs).to.have.length(1);
      expect(auditLogs[0].userId.toString()).to.equal(adminUser._id.toString());
    });
  });

  describe("Error Handling", () => {
    it("should reject non-admin access", async () => {
      const userToken = generateAccessToken(testRecipe.authorId);

      await request(app)
        .get("/api/admin/audit-logs")
        .set("Cookie", `token=${userToken}`)
        .expect(403);
    });

    it("should reject unauthenticated access", async () => {
      await request(app).get("/api/admin/audit-logs").expect(401);
    });

    it("should validate pagination parameters", async () => {
      await request(app)
        .get("/api/admin/audit-logs?limit=101")
        .set("Cookie", `token=${adminToken}`)
        .expect(200); // Should clamp to max 100

      await request(app)
        .get("/api/admin/audit-logs?page=0")
        .set("Cookie", `token=${adminToken}`)
        .expect(200); // Should default to page 1
    });
  });

  describe("Audit Statistics", () => {
    it("should return audit statistics", async () => {
      // Create some audit data
      await request(app)
        .put(`/api/admin/recipes/${testRecipe._id}/publish`)
        .set("Cookie", `token=${adminToken}`)
        .send({ publishAt: null });

      await request(app)
        .put("/api/admin/settings")
        .set("Cookie", `token=${adminToken}`)
        .send({
          siteTitle: "Stats Title",
          siteDesc: "Stats Description",
          brand: "StatsBrand",
          policy: "Stats Policy",
        });

      const res = await request(app)
        .get("/api/admin/audit-logs/stats")
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data).to.have.property("summary");
      expect(res.body.data).to.have.property("actionBreakdown");
      expect(res.body.data).to.have.property("entityBreakdown");
      expect(res.body.data).to.have.property("recentActivity");
    });
  });
});
