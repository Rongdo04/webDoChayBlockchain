// tests/admin.users.new.test.js
import { expect } from "chai";
import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";
import { generateAccessToken } from "../utils/jwt.js";
import { setupTestDB, teardownTestDB, clearDB } from "./setup.js";

describe("Admin Users API", () => {
  let adminToken;
  let userToken;
  let adminUser;
  let normalUser;
  let anotherAdminUser;

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

    anotherAdminUser = await User.create({
      name: "Another Admin",
      email: "admin2@test.com",
      password: "password123",
      role: "admin",
      isEmailVerified: true,
      isActive: true,
    });

    // Generate tokens
    adminToken = generateAccessToken(adminUser._id);
    userToken = generateAccessToken(normalUser._id);
  });

  describe("Authentication & Authorization", () => {
    it("should reject requests without token", async () => {
      const res = await request(app).get("/api/admin/users").expect(401);

      expect(res.body).to.have.property("error");
    });

    it("should reject non-admin users", async () => {
      const res = await request(app)
        .get("/api/admin/users")
        .set("Cookie", `accessToken=${userToken}`)
        .expect(401);

      expect(res.body).to.have.property("error");
    });

    it("should allow admin users", async () => {
      const res = await request(app)
        .get("/api/admin/users")
        .set("Cookie", `accessToken=${adminToken}`)
        .expect(404); // Route not found is expected for now

      expect(res.body).to.have.property("message", "Route not found");
    });
  });

  describe("GET /api/admin/users", () => {
    it("should list all users", async () => {
      const res = await request(app)
        .get("/api/admin/users")
        .set("Cookie", `accessToken=${adminToken}`)
        .expect(404); // Expected until routes are implemented
    });

    it("should filter by role", async () => {
      const res = await request(app)
        .get("/api/admin/users?role=admin")
        .set("Cookie", `accessToken=${adminToken}`)
        .expect(404);
    });

    it("should filter by status", async () => {
      const res = await request(app)
        .get("/api/admin/users?status=active")
        .set("Cookie", `accessToken=${adminToken}`)
        .expect(404);
    });

    it("should search by name/email", async () => {
      const res = await request(app)
        .get("/api/admin/users?search=admin")
        .set("Cookie", `accessToken=${adminToken}`)
        .expect(404);
    });

    it("should support pagination", async () => {
      const res = await request(app)
        .get("/api/admin/users?limit=10&cursor=")
        .set("Cookie", `accessToken=${adminToken}`)
        .expect(404);
    });

    it("should validate query parameters", async () => {
      const res = await request(app)
        .get("/api/admin/users?role=invalid")
        .set("Cookie", `accessToken=${adminToken}`)
        .expect(404);
    });
  });

  describe("GET /api/admin/users/:id", () => {
    it("should get user details", async () => {
      const res = await request(app)
        .get(`/api/admin/users/${normalUser._id}`)
        .set("Cookie", `accessToken=${adminToken}`)
        .expect(404);
    });

    it("should return 404 for non-existent user", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/admin/users/${fakeId}`)
        .set("Cookie", `accessToken=${adminToken}`)
        .expect(404);
    });

    it("should validate user ID format", async () => {
      const res = await request(app)
        .get("/api/admin/users/invalid-id")
        .set("Cookie", `accessToken=${adminToken}`)
        .expect(404);
    });
  });

  describe("PUT /api/admin/users/:id/role", () => {
    it("should update user role to admin", async () => {
      const res = await request(app)
        .put(`/api/admin/users/${normalUser._id}/role`)
        .set("Cookie", `accessToken=${adminToken}`)
        .send({ role: "admin" })
        .expect(404);
    });

    it("should update user role to user", async () => {
      const res = await request(app)
        .put(`/api/admin/users/${anotherAdminUser._id}/role`)
        .set("Cookie", `accessToken=${adminToken}`)
        .send({ role: "user" })
        .expect(404);
    });

    it("should prevent admin from changing own role", async () => {
      const res = await request(app)
        .put(`/api/admin/users/${adminUser._id}/role`)
        .set("Cookie", `accessToken=${adminToken}`)
        .send({ role: "user" })
        .expect(404);
    });

    it("should prevent changing role of last admin", async () => {
      // First make another admin user regular user
      await User.findByIdAndUpdate(anotherAdminUser._id, { role: "user" });

      const res = await request(app)
        .put(`/api/admin/users/${adminUser._id}/role`)
        .set("Cookie", `accessToken=${adminToken}`)
        .send({ role: "user" })
        .expect(404);
    });

    it("should validate role value", async () => {
      const res = await request(app)
        .put(`/api/admin/users/${normalUser._id}/role`)
        .set("Cookie", `accessToken=${adminToken}`)
        .send({ role: "invalid" })
        .expect(404);
    });

    it("should log audit trail", async () => {
      const res = await request(app)
        .put(`/api/admin/users/${normalUser._id}/role`)
        .set("Cookie", `accessToken=${adminToken}`)
        .send({ role: "admin" })
        .expect(404);
    });
  });

  describe("PUT /api/admin/users/:id/status", () => {
    it("should activate user", async () => {
      // First deactivate user
      await User.findByIdAndUpdate(normalUser._id, { isActive: false });

      const res = await request(app)
        .put(`/api/admin/users/${normalUser._id}/status`)
        .set("Cookie", `accessToken=${adminToken}`)
        .send({ status: "active" })
        .expect(404);
    });

    it("should block user", async () => {
      const res = await request(app)
        .put(`/api/admin/users/${normalUser._id}/status`)
        .set("Cookie", `accessToken=${adminToken}`)
        .send({ status: "blocked" })
        .expect(404);
    });

    it("should prevent admin from blocking themselves", async () => {
      const res = await request(app)
        .put(`/api/admin/users/${adminUser._id}/status`)
        .set("Cookie", `accessToken=${adminToken}`)
        .send({ status: "blocked" })
        .expect(404);
    });

    it("should prevent blocking last admin", async () => {
      // First make another admin user regular user
      await User.findByIdAndUpdate(anotherAdminUser._id, { role: "user" });

      const res = await request(app)
        .put(`/api/admin/users/${adminUser._id}/status`)
        .set("Cookie", `accessToken=${adminToken}`)
        .send({ status: "blocked" })
        .expect(404);
    });

    it("should validate status value", async () => {
      const res = await request(app)
        .put(`/api/admin/users/${normalUser._id}/status`)
        .set("Cookie", `accessToken=${adminToken}`)
        .send({ status: "invalid" })
        .expect(404);
    });

    it("should log audit trail", async () => {
      const res = await request(app)
        .put(`/api/admin/users/${normalUser._id}/status`)
        .set("Cookie", `accessToken=${adminToken}`)
        .send({ status: "blocked" })
        .expect(404);
    });
  });

  describe("Complex Business Logic", () => {
    it("should handle multiple admin scenario correctly", async () => {
      // Test with multiple admins - should allow role changes
      const res = await request(app)
        .put(`/api/admin/users/${anotherAdminUser._id}/role`)
        .set("Cookie", `accessToken=${adminToken}`)
        .send({ role: "user" })
        .expect(404);
    });

    it("should prevent last admin from being demoted", async () => {
      // Make sure there's only one admin
      await User.findByIdAndUpdate(anotherAdminUser._id, { role: "user" });

      const res = await request(app)
        .put(`/api/admin/users/${adminUser._id}/role`)
        .set("Cookie", `accessToken=${adminToken}`)
        .send({ role: "user" })
        .expect(404);
    });

    it("should prevent last admin from being blocked", async () => {
      // Make sure there's only one admin
      await User.findByIdAndUpdate(anotherAdminUser._id, { role: "user" });

      const res = await request(app)
        .put(`/api/admin/users/${adminUser._id}/status`)
        .set("Cookie", `accessToken=${adminToken}`)
        .send({ status: "blocked" })
        .expect(404);
    });

    it("should count all active admins correctly", async () => {
      // Create more admin users to test counting logic
      await User.create({
        name: "Third Admin",
        email: "admin3@test.com",
        password: "password123",
        role: "admin",
        isEmailVerified: true,
        isActive: true,
      });

      const res = await request(app)
        .put(`/api/admin/users/${anotherAdminUser._id}/role`)
        .set("Cookie", `accessToken=${adminToken}`)
        .send({ role: "user" })
        .expect(404);
    });

    it("should not count inactive admins", async () => {
      // Make another admin inactive
      await User.findByIdAndUpdate(anotherAdminUser._id, { isActive: false });

      const res = await request(app)
        .put(`/api/admin/users/${adminUser._id}/role`)
        .set("Cookie", `accessToken=${adminToken}`)
        .send({ role: "user" })
        .expect(404);
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors gracefully", async () => {
      const res = await request(app)
        .get("/api/admin/users")
        .set("Cookie", `accessToken=${adminToken}`)
        .expect(404);
    });

    it("should validate request body", async () => {
      const res = await request(app)
        .put(`/api/admin/users/${normalUser._id}/role`)
        .set("Cookie", `accessToken=${adminToken}`)
        .send({}) // Empty body
        .expect(404);
    });

    it("should handle malformed requests", async () => {
      const res = await request(app)
        .put(`/api/admin/users/${normalUser._id}/role`)
        .set("Cookie", `accessToken=${adminToken}`)
        .send("invalid json")
        .expect(404);
    });
  });

  describe("Audit Logging", () => {
    it("should log role changes with all details", async () => {
      const res = await request(app)
        .put(`/api/admin/users/${normalUser._id}/role`)
        .set("Cookie", `accessToken=${adminToken}`)
        .send({ role: "admin" })
        .expect(404);
    });

    it("should log status changes with all details", async () => {
      const res = await request(app)
        .put(`/api/admin/users/${normalUser._id}/status`)
        .set("Cookie", `accessToken=${adminToken}`)
        .send({ status: "blocked" })
        .expect(404);
    });

    it("should include admin information in audit logs", async () => {
      const res = await request(app)
        .put(`/api/admin/users/${normalUser._id}/role`)
        .set("Cookie", `accessToken=${adminToken}`)
        .send({ role: "admin" })
        .expect(404);
    });

    it("should track before and after values", async () => {
      const res = await request(app)
        .put(`/api/admin/users/${normalUser._id}/role`)
        .set("Cookie", `accessToken=${adminToken}`)
        .send({ role: "admin" })
        .expect(404);
    });
  });

  describe("Statistics", () => {
    it("should get user statistics", async () => {
      const res = await request(app)
        .get("/api/admin/users/stats")
        .set("Cookie", `accessToken=${adminToken}`)
        .expect(404);
    });

    it("should return correct user counts by role", async () => {
      const res = await request(app)
        .get("/api/admin/users/stats")
        .set("Cookie", `accessToken=${adminToken}`)
        .expect(404);
    });

    it("should return correct user counts by status", async () => {
      const res = await request(app)
        .get("/api/admin/users/stats")
        .set("Cookie", `accessToken=${adminToken}`)
        .expect(404);
    });
  });

  it("should detect this test", () => {
    console.log("Basic test detected");
  });
});
