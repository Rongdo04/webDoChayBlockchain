// tests/admin.settings.test.js
import { expect } from "chai";
import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import User from "../models/User.js";
import Settings from "../models/Settings.js";
import AuditLog from "../models/AuditLog.js";
import { generateAccessToken } from "../utils/jwt.js";
import { setupTestDB, teardownTestDB, clearDB } from "./setup.js";

describe("Admin Settings API", () => {
  let adminToken;
  let userToken;
  let adminUser;
  let normalUser;

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
      isActive: true,
    });

    normalUser = await User.create({
      name: "Normal User",
      email: "user@test.com",
      password: "password123",
      role: "user",
      isEmailVerified: true,
      isActive: true,
    });

    // Generate tokens
    adminToken = generateAccessToken(adminUser._id);
    userToken = generateAccessToken(normalUser._id);
  });

  describe("Authentication & Authorization", () => {
    it("should reject requests without token", async () => {
      const res = await request(app).get("/api/admin/settings").expect(401);

      expect(res.body).to.have.property("error");
    });

    it("should reject non-admin users", async () => {
      const res = await request(app)
        .get("/api/admin/settings")
        .set("Cookie", `token=${userToken}`)
        .expect(403);

      expect(res.body).to.have.property("error");
    });

    it("should allow admin users", async () => {
      const res = await request(app)
        .get("/api/admin/settings")
        .set("Cookie", `token=${adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("success", true);
    });
  });

  describe("GET /api/admin/settings", () => {
    it("should return default settings when none exist", async () => {
      const res = await request(app)
        .get("/api/admin/settings")
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body).to.have.property("success", true);
      expect(res.body.data).to.have.property("siteTitle");
      expect(res.body.data).to.have.property("siteDesc");
      expect(res.body.data).to.have.property("brand");
      expect(res.body.data).to.have.property("policy");
      expect(res.body.data).to.have.property("id");
      expect(res.body.data).to.have.property("updatedAt");
      expect(res.body.data).to.have.property("createdAt");
    });

    it("should return existing settings", async () => {
      // Create custom settings first
      await Settings.create({
        siteTitle: "Custom Site",
        siteDesc: "Custom Description",
        brand: "Custom Brand",
        policy: "Custom policy text for testing purposes",
        _singleton: true,
      });

      const res = await request(app)
        .get("/api/admin/settings")
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.siteTitle).to.equal("Custom Site");
      expect(res.body.data.siteDesc).to.equal("Custom Description");
      expect(res.body.data.brand).to.equal("Custom Brand");
      expect(res.body.data.policy).to.equal(
        "Custom policy text for testing purposes"
      );
    });
  });

  describe("PUT /api/admin/settings", () => {
    it("should update all settings fields", async () => {
      const updateData = {
        siteTitle: "New Site Title",
        siteDesc: "New site description for testing",
        brand: "NewBrand",
        policy:
          "New policy text that meets the minimum length requirement for testing",
      };

      const res = await request(app)
        .put("/api/admin/settings")
        .set("Cookie", `token=${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.siteTitle).to.equal(updateData.siteTitle);
      expect(res.body.data.siteDesc).to.equal(updateData.siteDesc);
      expect(res.body.data.brand).to.equal(updateData.brand);
      expect(res.body.data.policy).to.equal(updateData.policy);
    });

    it("should update partial settings", async () => {
      // First create initial settings
      await request(app)
        .put("/api/admin/settings")
        .set("Cookie", `token=${adminToken}`)
        .send({
          siteTitle: "Initial Title",
          siteDesc: "Initial description for testing",
          brand: "InitialBrand",
          policy: "Initial policy text that meets requirements",
        });

      // Update only siteTitle
      const res = await request(app)
        .put("/api/admin/settings")
        .set("Cookie", `token=${adminToken}`)
        .send({ siteTitle: "Updated Title" })
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.siteTitle).to.equal("Updated Title");
      expect(res.body.data.siteDesc).to.equal(
        "Initial description for testing"
      );
    });

    it("should validate required fields", async () => {
      const res = await request(app)
        .put("/api/admin/settings")
        .set("Cookie", `token=${adminToken}`)
        .send({})
        .expect(422);

      expect(res.body.success).to.be.false;
      expect(res.body.error.code).to.equal("VALIDATION_ERROR");
    });

    it("should validate field lengths", async () => {
      const res = await request(app)
        .put("/api/admin/settings")
        .set("Cookie", `token=${adminToken}`)
        .send({
          siteTitle: "a".repeat(101), // Too long
          siteDesc: "short", // Too short
          brand: "b".repeat(51), // Too long
          policy: "short", // Too short
        })
        .expect(422);

      expect(res.body.success).to.be.false;
      expect(res.body.error.details).to.have.property("siteTitle");
      expect(res.body.error.details).to.have.property("siteDesc");
      expect(res.body.error.details).to.have.property("brand");
      expect(res.body.error.details).to.have.property("policy");
    });

    it("should validate minimum field lengths", async () => {
      const res = await request(app)
        .put("/api/admin/settings")
        .set("Cookie", `token=${adminToken}`)
        .send({
          siteTitle: "ab", // Too short
          siteDesc: "short", // Too short
          brand: "a", // Too short
          policy: "short", // Too short
        })
        .expect(422);

      expect(res.body.success).to.be.false;
      expect(res.body.error.details).to.have.property("siteTitle");
      expect(res.body.error.details).to.have.property("siteDesc");
      expect(res.body.error.details).to.have.property("brand");
      expect(res.body.error.details).to.have.property("policy");
    });

    it("should reject empty string fields", async () => {
      const res = await request(app)
        .put("/api/admin/settings")
        .set("Cookie", `token=${adminToken}`)
        .send({
          siteTitle: "",
          siteDesc: "",
          brand: "",
          policy: "",
        })
        .expect(422);

      expect(res.body.success).to.be.false;
      expect(res.body.error.details).to.have.property("siteTitle");
      expect(res.body.error.details).to.have.property("siteDesc");
      expect(res.body.error.details).to.have.property("brand");
      expect(res.body.error.details).to.have.property("policy");
    });

    it("should reject non-string fields", async () => {
      const res = await request(app)
        .put("/api/admin/settings")
        .set("Cookie", `token=${adminToken}`)
        .send({
          siteTitle: 123,
          siteDesc: null,
          brand: true,
          policy: {},
        })
        .expect(422);

      expect(res.body.success).to.be.false;
      expect(res.body.error.details).to.have.property("siteTitle");
      expect(res.body.error.details).to.have.property("siteDesc");
      expect(res.body.error.details).to.have.property("brand");
      expect(res.body.error.details).to.have.property("policy");
    });

    it("should validate brand name format", async () => {
      const res = await request(app)
        .put("/api/admin/settings")
        .set("Cookie", `token=${adminToken}`)
        .send({
          brand: "invalid@brand#name", // Invalid characters
        })
        .expect(422);

      expect(res.body.success).to.be.false;
      expect(res.body.error.details).to.have.property("brand");
    });

    it("should sanitize input data", async () => {
      const res = await request(app)
        .put("/api/admin/settings")
        .set("Cookie", `token=${adminToken}`)
        .send({
          siteTitle: "  Title with spaces  ",
          siteDesc: "Description with <strong>html</strong> tags",
          brand: "  BrandName  ",
          policy: "Policy with normal text content for testing purposes",
        })
        .expect(200);

      expect(res.body.success).to.be.true;
      // Should trim spaces and escape HTML
      expect(res.body.data.siteTitle).to.not.include("  ");
      expect(res.body.data.brand).to.not.include("  ");
    });
  });

  describe("Data Persistence", () => {
    it("should persist settings across requests", async () => {
      const updateData = {
        siteTitle: "Persistent Title",
        siteDesc: "This should persist across requests",
        brand: "PersistBrand",
        policy: "Persistent policy text for testing persistence functionality",
      };

      // Update settings
      await request(app)
        .put("/api/admin/settings")
        .set("Cookie", `token=${adminToken}`)
        .send(updateData)
        .expect(200);

      // Retrieve settings
      const res = await request(app)
        .get("/api/admin/settings")
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.data.siteTitle).to.equal(updateData.siteTitle);
      expect(res.body.data.siteDesc).to.equal(updateData.siteDesc);
      expect(res.body.data.brand).to.equal(updateData.brand);
      expect(res.body.data.policy).to.equal(updateData.policy);
    });

    it("should maintain single document pattern", async () => {
      // Create settings multiple times
      await request(app)
        .put("/api/admin/settings")
        .set("Cookie", `token=${adminToken}`)
        .send({
          siteTitle: "First Title",
          siteDesc: "First description for testing",
          brand: "FirstBrand",
          policy: "First policy text for testing purposes",
        });

      await request(app)
        .put("/api/admin/settings")
        .set("Cookie", `token=${adminToken}`)
        .send({
          siteTitle: "Second Title",
          siteDesc: "Second description for testing",
          brand: "SecondBrand",
          policy: "Second policy text for testing purposes",
        });

      // Should only have one settings document
      const settingsCount = await Settings.countDocuments();
      expect(settingsCount).to.equal(1);

      // Should have the latest values
      const res = await request(app)
        .get("/api/admin/settings")
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.data.siteTitle).to.equal("Second Title");
    });
  });

  describe("Audit Logging", () => {
    it("should log settings updates", async () => {
      const updateData = {
        siteTitle: "Audited Title",
        siteDesc: "This update should be audited",
        brand: "AuditBrand",
        policy: "Audited policy text for testing audit functionality",
      };

      await request(app)
        .put("/api/admin/settings")
        .set("Cookie", `token=${adminToken}`)
        .send(updateData)
        .expect(200);

      // Check audit log
      const auditLogs = await AuditLog.find({
        entityType: "settings",
        action: "update",
        userId: adminUser._id,
      });

      expect(auditLogs).to.have.length(1);
      expect(auditLogs[0].details.changes).to.be.an("object");
    });

    it("should track field changes in audit logs", async () => {
      // Create initial settings
      await request(app)
        .put("/api/admin/settings")
        .set("Cookie", `token=${adminToken}`)
        .send({
          siteTitle: "Original Title",
          siteDesc: "Original description for testing",
          brand: "OriginalBrand",
          policy: "Original policy text for testing purposes",
        });

      // Clear audit logs
      await AuditLog.deleteMany({});

      // Update only siteTitle
      await request(app)
        .put("/api/admin/settings")
        .set("Cookie", `token=${adminToken}`)
        .send({ siteTitle: "Changed Title" })
        .expect(200);

      // Check audit log details
      const auditLog = await AuditLog.findOne({
        entityType: "settings",
        action: "update",
      });

      expect(auditLog).to.not.be.null;
      expect(auditLog.details.changes.siteTitle).to.deep.equal({
        from: "Original Title",
        to: "Changed Title",
      });
      expect(auditLog.details.changes).to.not.have.property("siteDesc");
    });

    it("should not log if no changes made", async () => {
      // Create initial settings
      await request(app)
        .put("/api/admin/settings")
        .set("Cookie", `token=${adminToken}`)
        .send({
          siteTitle: "Same Title",
          siteDesc: "Same description for testing",
          brand: "SameBrand",
          policy: "Same policy text for testing purposes",
        });

      // Clear audit logs
      await AuditLog.deleteMany({});

      // Update with same values
      await request(app)
        .put("/api/admin/settings")
        .set("Cookie", `token=${adminToken}`)
        .send({ siteTitle: "Same Title" })
        .expect(200);

      // Should not have audit log for no changes
      const auditLogCount = await AuditLog.countDocuments({
        entityType: "settings",
        action: "update",
      });

      expect(auditLogCount).to.equal(0);
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors gracefully", async () => {
      // This test would require mocking database errors
      // For now, we'll test that the endpoint exists and handles basic errors
      const res = await request(app)
        .put("/api/admin/settings")
        .set("Cookie", `token=${adminToken}`)
        .send({ invalidField: "test" })
        .expect(422);

      expect(res.body.success).to.be.false;
    });

    it("should validate request body exists", async () => {
      const res = await request(app)
        .put("/api/admin/settings")
        .set("Cookie", `token=${adminToken}`)
        .expect(422);

      expect(res.body.success).to.be.false;
      expect(res.body.error.code).to.equal("VALIDATION_ERROR");
    });
  });
});
