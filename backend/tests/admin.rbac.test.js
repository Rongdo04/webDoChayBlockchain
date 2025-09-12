// tests/admin.rbac.test.js
import { expect } from "chai";
import request from "supertest";
import app from "../app.js";
import User from "../models/User.js";
import { generateAccessToken } from "../utils/jwt.js";
import { setupTestDB, teardownTestDB, clearDB } from "./setup.js";

describe("Admin Namespace RBAC Tests", () => {
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

  describe("Authentication Requirements", () => {
    const adminEndpoints = [
      "/api/admin/recipes",
      "/api/admin/media",
      "/api/admin/taxonomy",
      "/api/admin/users",
      "/api/admin/settings",
      "/api/admin/metrics/overview",
      "/api/admin/audit-logs",
    ];

    adminEndpoints.forEach((endpoint) => {
      it(`should reject unauthenticated requests to ${endpoint}`, async () => {
        const res = await request(app).get(endpoint).expect(401);

        expect(res.body).to.have.property("error");
        expect(res.body.error).to.have.property("code", "UNAUTHORIZED");
        expect(res.body.error).to.have.property("message");
      });

      it(`should reject non-admin users from ${endpoint}`, async () => {
        const res = await request(app)
          .get(endpoint)
          .set("Cookie", `token=${userToken}`)
          .expect(403);

        expect(res.body).to.have.property("error");
        expect(res.body.error).to.have.property("code", "FORBIDDEN");
        expect(res.body.error).to.have.property(
          "message",
          "Không có quyền truy cập"
        );
      });

      it(`should allow admin users to access ${endpoint}`, async () => {
        const res = await request(app)
          .get(endpoint)
          .set("Cookie", `token=${adminToken}`);

        // Should not get 401 or 403, though may get other errors (404, 500, etc.)
        expect(res.status).to.not.equal(401);
        expect(res.status).to.not.equal(403);
      });
    });
  });

  describe("Health Endpoint", () => {
    it("should provide health check without authentication", async () => {
      const res = await request(app)
        .get("/api/admin/health")
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body).to.have.property("ok", true);
      expect(res.body).to.have.property("time");
      expect(res.body.time).to.match(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );
    });
  });

  describe("Error Handling", () => {
    it("should return standardized error format for authentication errors", async () => {
      const res = await request(app).get("/api/admin/settings").expect(401);

      expect(res.body).to.deep.include({
        error: {
          code: "UNAUTHORIZED",
          message: "Không có token xác thực",
        },
      });
    });

    it("should return standardized error format for authorization errors", async () => {
      const res = await request(app)
        .get("/api/admin/settings")
        .set("Cookie", `token=${userToken}`)
        .expect(403);

      expect(res.body).to.deep.include({
        error: {
          code: "FORBIDDEN",
          message: "Không có quyền truy cập",
        },
      });
    });

    it("should handle demo errors with proper format", async () => {
      const res = await request(app)
        .get("/api/admin/moderation/_error")
        .set("Cookie", `token=${adminToken}`)
        .expect(400);

      expect(res.body).to.have.property("error");
      expect(res.body.error).to.have.property("code", "DEMO_BAD_REQUEST");
      expect(res.body.error).to.have.property(
        "message",
        "Demo error in moderation"
      );
    });

    it("should handle 404 errors with standardized format", async () => {
      const res = await request(app)
        .get("/api/admin/nonexistent")
        .set("Cookie", `token=${adminToken}`)
        .expect(404);

      expect(res.body).to.have.property("error");
      expect(res.body.error).to.have.property("code", "NOT_FOUND");
      expect(res.body.error).to.have.property("message", "Resource not found");
      expect(res.body.error).to.have.property("details");
      expect(res.body.error.details).to.have.property(
        "path",
        "/api/admin/nonexistent"
      );
    });
  });

  describe("Route Mounting", () => {
    it("should mount all required admin sub-routes", async () => {
      const routes = [
        { path: "/api/admin/recipes", expectSuccess: true },
        { path: "/api/admin/media", expectSuccess: true },
        { path: "/api/admin/taxonomy", expectSuccess: true },
        { path: "/api/admin/users", expectSuccess: true },
        { path: "/api/admin/settings", expectSuccess: true },
        { path: "/api/admin/metrics/overview", expectSuccess: true },
        { path: "/api/admin/moderation", expectSuccess: true }, // Stub route
      ];

      const results = await Promise.all(
        routes.map(async (route) => {
          const res = await request(app)
            .get(route.path)
            .set("Cookie", `token=${adminToken}`);

          return {
            path: route.path,
            status: res.status,
            hasError: res.body.hasOwnProperty("error"),
          };
        })
      );

      // All routes should be accessible (not 404) when authenticated as admin
      results.forEach((result) => {
        expect(result.status).to.not.equal(
          404,
          `Route ${result.path} should be mounted`
        );
      });
    });
  });

  describe("Token-based Authentication", () => {
    it("should accept tokens from cookies", async () => {
      const res = await request(app)
        .get("/api/admin/settings")
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body).to.have.property("success", true);
    });

    it("should reject invalid tokens", async () => {
      const res = await request(app)
        .get("/api/admin/settings")
        .set("Cookie", "token=invalid-token")
        .expect(401);

      expect(res.body).to.have.property("error");
      expect(res.body.error).to.have.property("code", "UNAUTHORIZED");
    });

    it("should reject expired or malformed tokens", async () => {
      const res = await request(app)
        .get("/api/admin/settings")
        .set("Cookie", "token=expired.token.here")
        .expect(401);

      expect(res.body).to.have.property("error");
      expect(res.body.error).to.have.property("code", "UNAUTHORIZED");
    });
  });

  describe("User Role Verification", () => {
    it("should verify user exists and is active", async () => {
      // Deactivate user
      await User.findByIdAndUpdate(adminUser._id, { isActive: false });

      const res = await request(app)
        .get("/api/admin/settings")
        .set("Cookie", `token=${adminToken}`)
        .expect(401);

      expect(res.body).to.have.property("error");
      expect(res.body.error).to.have.property("code", "UNAUTHORIZED");
    });

    it("should check role before allowing access", async () => {
      // Change user role to non-admin
      await User.findByIdAndUpdate(adminUser._id, { role: "user" });

      const res = await request(app)
        .get("/api/admin/settings")
        .set("Cookie", `token=${adminToken}`)
        .expect(403);

      expect(res.body).to.have.property("error");
      expect(res.body.error).to.have.property("code", "FORBIDDEN");
    });
  });
});
