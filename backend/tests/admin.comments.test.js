// tests/admin.comments.test.js
import { expect } from "chai";
import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import User from "../models/User.js";
import Recipe from "../models/Recipe.js";
import Comment from "../models/Comment.js";
import AuditLog from "../models/AuditLog.js";
import { generateAccessToken } from "../utils/jwt.js";
import { setupTestDB, teardownTestDB, clearDB } from "./setup.js";

describe("Admin Comments API", () => {
  let adminUser, normalUser, testRecipe, adminToken;

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

    // Generate admin token
    adminToken = generateAccessToken(adminUser);
  });

  describe("Authentication & Authorization", () => {
    it("should reject requests without token", async () => {
      const res = await request(app).get("/api/admin/comments").expect(401);

      expect(res.body.error.code).to.equal("UNAUTHORIZED");
    });

    it("should reject non-admin users", async () => {
      const userToken = generateAccessToken(normalUser);

      const res = await request(app)
        .get("/api/admin/comments")
        .set("Cookie", `token=${userToken}`)
        .expect(403);

      expect(res.body.error.code).to.equal("FORBIDDEN");
    });

    it("should allow admin users", async () => {
      const res = await request(app)
        .get("/api/admin/comments")
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
    });
  });

  describe("GET /api/admin/comments", () => {
    beforeEach(async () => {
      // Create test comments
      await Comment.create([
        {
          content: "Great recipe!",
          rating: 5,
          status: "pending",
          recipeId: testRecipe._id,
          userId: normalUser._id,
        },
        {
          content: "Not bad",
          rating: 3,
          status: "approved",
          recipeId: testRecipe._id,
          userId: normalUser._id,
        },
        {
          content: "Terrible!",
          rating: 1,
          status: "hidden",
          recipeId: testRecipe._id,
          userId: normalUser._id,
        },
      ]);
    });

    it("should list all comments", async () => {
      const res = await request(app)
        .get("/api/admin/comments")
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.an("array");
      expect(res.body.data).to.have.length(3);
      expect(res.body.pagination.total).to.equal(3);
    });

    it("should filter by status", async () => {
      const res = await request(app)
        .get("/api/admin/comments?status=pending")
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data).to.have.length(1);
      expect(res.body.data[0].status).to.equal("pending");
    });

    it("should filter by recipe ID", async () => {
      const res = await request(app)
        .get(`/api/admin/comments?recipeId=${testRecipe._id}`)
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data).to.have.length(3);
    });

    it("should validate query parameters", async () => {
      const res = await request(app)
        .get("/api/admin/comments?status=invalid")
        .set("Cookie", `token=${adminToken}`)
        .expect(422);

      expect(res.body.error.details.status).to.exist;
    });

    it("should support pagination", async () => {
      const res = await request(app)
        .get("/api/admin/comments?limit=2")
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data).to.have.length(2);
      expect(res.body.pagination.hasNext).to.be.true;
    });
  });

  describe("POST /api/admin/comments/:id/approve", () => {
    let pendingComment;

    beforeEach(async () => {
      pendingComment = await Comment.create({
        content: "Great recipe!",
        rating: 5,
        status: "pending",
        recipeId: testRecipe._id,
        userId: normalUser._id,
      });
    });

    it("should approve pending comment", async () => {
      const res = await request(app)
        .post(`/api/admin/comments/${pendingComment._id}/approve`)
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.status).to.equal("approved");

      // Check if comment was updated in database
      const updatedComment = await Comment.findById(pendingComment._id);
      expect(updatedComment.status).to.equal("approved");
      expect(updatedComment.moderatedBy.toString()).to.equal(
        adminUser._id.toString()
      );
      expect(updatedComment.moderatedAt).to.be.a("date");
    });

    it("should update recipe rating when comment has rating", async () => {
      await request(app)
        .post(`/api/admin/comments/${pendingComment._id}/approve`)
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      // Check if recipe rating was updated
      const updatedRecipe = await Recipe.findById(testRecipe._id);
      expect(updatedRecipe.ratingAvg).to.equal(5);
      expect(updatedRecipe.ratingCount).to.equal(1);
    });

    it("should log audit trail", async () => {
      await request(app)
        .post(`/api/admin/comments/${pendingComment._id}/approve`)
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      const auditLog = await AuditLog.findOne({
        "metadata.operation": "approve_comment",
      });
      expect(auditLog).to.exist;
      expect(auditLog.userId.toString()).to.equal(adminUser._id.toString());
    });

    it("should return 404 for non-existent comment", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post(`/api/admin/comments/${fakeId}/approve`)
        .set("Cookie", `token=${adminToken}`)
        .expect(404);

      expect(res.body.success).to.be.false;
      expect(res.body.code).to.equal("COMMENT_NOT_FOUND");
    });

    it("should validate comment ID format", async () => {
      const res = await request(app)
        .post("/api/admin/comments/invalid-id/approve")
        .set("Cookie", `token=${adminToken}`)
        .expect(422);

      expect(res.body.error.details.id).to.exist;
    });
  });

  describe("POST /api/admin/comments/:id/hide", () => {
    let approvedComment;

    beforeEach(async () => {
      approvedComment = await Comment.create({
        content: "Great recipe!",
        rating: 4,
        status: "approved",
        recipeId: testRecipe._id,
        userId: normalUser._id,
      });

      // Update recipe rating to reflect the approved comment
      await Recipe.findByIdAndUpdate(testRecipe._id, {
        ratingAvg: 4,
        ratingCount: 1,
      });
    });

    it("should hide approved comment", async () => {
      const res = await request(app)
        .post(`/api/admin/comments/${approvedComment._id}/hide`)
        .send({ reason: "Inappropriate content" })
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.status).to.equal("hidden");

      // Check if comment was updated in database
      const updatedComment = await Comment.findById(approvedComment._id);
      expect(updatedComment.status).to.equal("hidden");
      expect(updatedComment.moderationReason).to.equal("Inappropriate content");
    });

    it("should update recipe rating when hiding approved comment with rating", async () => {
      await request(app)
        .post(`/api/admin/comments/${approvedComment._id}/hide`)
        .send({ reason: "Spam" })
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      // Check if recipe rating was updated (should be 0 since no approved comments left)
      const updatedRecipe = await Recipe.findById(testRecipe._id);
      expect(updatedRecipe.ratingAvg).to.equal(0);
      expect(updatedRecipe.ratingCount).to.equal(0);
    });

    it("should work without reason", async () => {
      const res = await request(app)
        .post(`/api/admin/comments/${approvedComment._id}/hide`)
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
    });

    it("should validate reason length", async () => {
      const longReason = "x".repeat(501);
      const res = await request(app)
        .post(`/api/admin/comments/${approvedComment._id}/hide`)
        .send({ reason: longReason })
        .set("Cookie", `token=${adminToken}`)
        .expect(422);

      expect(res.body.error.details.reason).to.exist;
    });
  });

  describe("POST /api/admin/comments/bulk", () => {
    let comments;

    beforeEach(async () => {
      comments = await Comment.create([
        {
          content: "Comment 1",
          rating: 5,
          status: "pending",
          recipeId: testRecipe._id,
          userId: normalUser._id,
        },
        {
          content: "Comment 2",
          rating: 4,
          status: "pending",
          recipeId: testRecipe._id,
          userId: normalUser._id,
        },
        {
          content: "Comment 3",
          rating: 3,
          status: "approved",
          recipeId: testRecipe._id,
          userId: normalUser._id,
        },
      ]);
    });

    it("should bulk approve comments", async () => {
      const pendingIds = comments
        .filter((c) => c.status === "pending")
        .map((c) => c._id);

      const res = await request(app)
        .post("/api/admin/comments/bulk")
        .send({
          ids: pendingIds,
          action: "approve",
        })
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.successful).to.equal(2);
      expect(res.body.data.failed).to.equal(0);

      // Check if comments were updated
      const updatedComments = await Comment.find({ _id: { $in: pendingIds } });
      updatedComments.forEach((comment) => {
        expect(comment.status).to.equal("approved");
      });

      // Check if recipe rating was updated (average of 5, 4, 3 = 4)
      const updatedRecipe = await Recipe.findById(testRecipe._id);
      expect(updatedRecipe.ratingCount).to.equal(3);
      expect(updatedRecipe.ratingAvg).to.equal(4);
    });

    it("should bulk hide comments", async () => {
      const allIds = comments.map((c) => c._id);

      const res = await request(app)
        .post("/api/admin/comments/bulk")
        .send({
          ids: allIds,
          action: "hide",
          reason: "Bulk moderation",
        })
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.successful).to.equal(3);

      // Check if recipe rating was updated (should be 0 since all comments hidden)
      const updatedRecipe = await Recipe.findById(testRecipe._id);
      expect(updatedRecipe.ratingCount).to.equal(0);
      expect(updatedRecipe.ratingAvg).to.equal(0);
    });

    it("should validate bulk request", async () => {
      const res = await request(app)
        .post("/api/admin/comments/bulk")
        .send({
          ids: [],
          action: "approve",
        })
        .set("Cookie", `token=${adminToken}`)
        .expect(422);

      expect(res.body.error.details.ids).to.exist;
    });

    it("should validate action", async () => {
      const res = await request(app)
        .post("/api/admin/comments/bulk")
        .send({
          ids: [comments[0]._id],
          action: "invalid",
        })
        .set("Cookie", `token=${adminToken}`)
        .expect(422);

      expect(res.body.error.details.action).to.exist;
    });

    it("should handle mix of valid and invalid IDs", async () => {
      const validId = comments[0]._id;
      const invalidId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .post("/api/admin/comments/bulk")
        .send({
          ids: [validId, invalidId],
          action: "approve",
        })
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.successful).to.equal(1);
      expect(res.body.data.failed).to.equal(0);
    });

    it("should log audit trail for bulk operations", async () => {
      const ids = comments.map((c) => c._id);

      await request(app)
        .post("/api/admin/comments/bulk")
        .send({
          ids,
          action: "approve",
        })
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      const auditLog = await AuditLog.findOne({
        action: "bulk",
        "metadata.operation": "bulk_approve_comments",
      });
      expect(auditLog).to.exist;
      expect(auditLog.userId.toString()).to.equal(adminUser._id.toString());
    });
  });

  describe("GET /api/admin/comments/stats", () => {
    beforeEach(async () => {
      await Comment.create([
        {
          content: "Comment 1",
          status: "pending",
          recipeId: testRecipe._id,
          userId: normalUser._id,
        },
        {
          content: "Comment 2",
          status: "approved",
          recipeId: testRecipe._id,
          userId: normalUser._id,
        },
        {
          content: "Comment 3",
          status: "hidden",
          recipeId: testRecipe._id,
          userId: normalUser._id,
        },
      ]);
    });

    it("should get comment statistics", async () => {
      const res = await request(app)
        .get("/api/admin/comments/stats")
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.total).to.equal(3);
      expect(res.body.data.pending).to.equal(1);
      expect(res.body.data.approved).to.equal(1);
      expect(res.body.data.hidden).to.equal(1);
      expect(res.body.data.recent).to.be.an("object");
    });
  });

  describe("Rating Recalculation", () => {
    let recipe2;

    beforeEach(async () => {
      // Create another recipe for testing
      recipe2 = await Recipe.create({
        title: "Test Recipe 2",
        slug: "test-recipe-2",
        summary: "Another test recipe",
        description: "Test description",
        prepTime: 15,
        cookTime: 25,
        servings: 2,
        difficulty: "medium",
        ingredients: [{ name: "ingredient 1", amount: "2", unit: "cups" }],
        steps: [{ order: 1, description: "step 1" }],
        authorId: normalUser._id,
        status: "published",
      });

      // Create multiple comments with ratings
      await Comment.create([
        {
          content: "Rating 5",
          rating: 5,
          status: "approved",
          recipeId: recipe2._id,
          userId: normalUser._id,
        },
        {
          content: "Rating 3",
          rating: 3,
          status: "approved",
          recipeId: recipe2._id,
          userId: normalUser._id,
        },
        {
          content: "Rating 4",
          rating: 4,
          status: "pending",
          recipeId: recipe2._id,
          userId: normalUser._id,
        },
        {
          content: "No rating",
          status: "approved",
          recipeId: recipe2._id,
          userId: normalUser._id,
        },
      ]);

      // Initial recipe rating should be 4 (average of 5 and 3)
      await Recipe.findByIdAndUpdate(recipe2._id, {
        ratingAvg: 4,
        ratingCount: 2,
      });
    });

    it("should recalculate rating when approving comment with rating", async () => {
      const pendingComment = await Comment.findOne({
        recipeId: recipe2._id,
        status: "pending",
      });

      await request(app)
        .post(`/api/admin/comments/${pendingComment._id}/approve`)
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      // Should now average 5, 3, 4 = 4.0
      const updatedRecipe = await Recipe.findById(recipe2._id);
      expect(updatedRecipe.ratingCount).to.equal(3);
      expect(updatedRecipe.ratingAvg).to.equal(4);
    });

    it("should recalculate rating when hiding approved comment with rating", async () => {
      const approvedComment = await Comment.findOne({
        recipeId: recipe2._id,
        status: "approved",
        rating: 5,
      });

      await request(app)
        .post(`/api/admin/comments/${approvedComment._id}/hide`)
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      // Should now only have rating of 3, so avg = 3, count = 1
      const updatedRecipe = await Recipe.findById(recipe2._id);
      expect(updatedRecipe.ratingCount).to.equal(1);
      expect(updatedRecipe.ratingAvg).to.equal(3);
    });

    it("should not affect rating for comments without rating", async () => {
      const noRatingComment = await Comment.findOne({
        recipeId: recipe2._id,
        content: "No rating",
      });

      expect(noRatingComment).to.not.be.null;

      await request(app)
        .post(`/api/admin/comments/${noRatingComment._id}/hide`)
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      // Rating should remain unchanged
      const updatedRecipe = await Recipe.findById(recipe2._id);
      expect(updatedRecipe.ratingCount).to.equal(2);
      expect(updatedRecipe.ratingAvg).to.equal(4);
    });
  });
});
