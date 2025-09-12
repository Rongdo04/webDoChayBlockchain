// tests/reports.test.js
import request from "supertest";
import { expect } from "chai";
import app from "../app.js";
import User from "../models/User.js";
import Report from "../models/Report.js";
import { createTestUser, getAuthToken, cleanupTestData } from "./helpers.js";

describe("Reports API", () => {
  let testUser;
  let authToken;

  beforeEach(async () => {
    await cleanupTestData();
    testUser = await createTestUser({
      email: "testuser@test.com",
      password: "password123",
      name: "Test User",
    });
    authToken = getAuthToken(testUser);
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe("POST /api/reports", () => {
    it("should submit a report successfully", async () => {
      const reportData = {
        targetType: "recipe",
        targetId: "507f1f77bcf86cd799439011",
        reason: "Nội dung không phù hợp",
        description: "Báo cáo công thức test",
      };

      const res = await request(app)
        .post("/api/reports")
        .set("Cookie", [`token=${authToken}`])
        .send(reportData)
        .expect(201);

      expect(res.body.success).to.be.true;
      expect(res.body.data.id).to.exist;
      expect(res.body.data.message).to.equal("Báo cáo đã được gửi thành công");

      // Verify report was saved
      const savedReport = await Report.findById(res.body.data.id);
      expect(savedReport).to.exist;
      expect(savedReport.reporterId.toString()).to.equal(
        testUser._id.toString()
      );
      expect(savedReport.targetType).to.equal(reportData.targetType);
      expect(savedReport.targetId).to.equal(reportData.targetId);
      expect(savedReport.reason).to.equal(reportData.reason);
      expect(savedReport.status).to.equal("pending");
    });

    it("should return 400 for missing required fields", async () => {
      const res = await request(app)
        .post("/api/reports")
        .set("Cookie", [`token=${authToken}`])
        .send({
          targetType: "recipe",
          // Missing targetId and reason
        })
        .expect(400);

      expect(res.body.success).to.be.false;
      expect(res.body.error.code).to.equal("VALIDATION_ERROR");
    });

    it("should return 400 for invalid target type", async () => {
      const reportData = {
        targetType: "invalid",
        targetId: "507f1f77bcf86cd799439011",
        reason: "Test reason",
      };

      const res = await request(app)
        .post("/api/reports")
        .set("Cookie", [`token=${authToken}`])
        .send(reportData)
        .expect(400);

      expect(res.body.success).to.be.false;
      expect(res.body.error.code).to.equal("INVALID_TARGET_TYPE");
    });

    it("should return 409 for duplicate report", async () => {
      const reportData = {
        targetType: "recipe",
        targetId: "507f1f77bcf86cd799439011",
        reason: "Test reason",
      };

      // Submit first report
      await request(app)
        .post("/api/reports")
        .set("Cookie", [`token=${authToken}`])
        .send(reportData)
        .expect(201);

      // Try to submit duplicate
      const res = await request(app)
        .post("/api/reports")
        .set("Cookie", [`token=${authToken}`])
        .send(reportData)
        .expect(409);

      expect(res.body.success).to.be.false;
      expect(res.body.error.code).to.equal("ALREADY_REPORTED");
    });

    it("should return 401 for unauthenticated user", async () => {
      const reportData = {
        targetType: "recipe",
        targetId: "507f1f77bcf86cd799439011",
        reason: "Test reason",
      };

      await request(app).post("/api/reports").send(reportData).expect(401);
    });
  });

  describe("GET /api/reports/user", () => {
    it("should get user reports with pagination", async () => {
      // Create test reports
      const reports = [];
      for (let i = 0; i < 3; i++) {
        const report = new Report({
          reporterId: testUser._id,
          targetType: "recipe",
          targetId: `507f1f77bcf86cd79943901${i}`,
          reason: `Test reason ${i}`,
          status: "pending",
          createdAt: new Date(Date.now() - i * 1000),
        });
        reports.push(await report.save());
      }

      const res = await request(app)
        .get("/api/reports/user")
        .set("Cookie", [`token=${authToken}`])
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.items).to.have.length(3);
      expect(res.body.data.pagination).to.exist;
      expect(res.body.data.pagination.total).to.equal(3);

      // Check order (should be newest first)
      expect(res.body.data.items[0].targetId).to.equal(
        "507f1f77bcf86cd799439010"
      );
      expect(res.body.data.items[2].targetId).to.equal(
        "507f1f77bcf86cd799439012"
      );
    });

    it("should filter by status", async () => {
      // Create reports with different statuses
      await new Report({
        reporterId: testUser._id,
        targetType: "recipe",
        targetId: "507f1f77bcf86cd799439011",
        reason: "Test reason 1",
        status: "pending",
      }).save();

      await new Report({
        reporterId: testUser._id,
        targetType: "recipe",
        targetId: "507f1f77bcf86cd799439012",
        reason: "Test reason 2",
        status: "resolved",
      }).save();

      const res = await request(app)
        .get("/api/reports/user?status=pending")
        .set("Cookie", [`token=${authToken}`])
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.items).to.have.length(1);
      expect(res.body.data.items[0].status).to.equal("pending");
    });

    it("should return 401 for unauthenticated user", async () => {
      await request(app).get("/api/reports/user").expect(401);
    });
  });
});
