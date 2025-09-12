// tests/admin.recipes.test.js
import { expect } from "chai";
import request from "supertest";
import app from "../app.js";
import User from "../models/User.js";
import Recipe from "../models/Recipe.js";
import AuditLog from "../models/AuditLog.js";
import { generateAccessToken } from "../utils/jwt.js";
import { setupTestDB, teardownTestDB, clearDB } from "./setup.js";

describe("Admin Recipes API", () => {
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
      const res = await request(app).get("/api/admin/recipes").expect(401);

      expect(res.body.error.code).to.equal("UNAUTHORIZED");
    });

    it("should reject non-admin users", async () => {
      const res = await request(app)
        .get("/api/admin/recipes")
        .set("Cookie", `token=${userToken}`)
        .expect(403);

      expect(res.body.error.code).to.equal("FORBIDDEN");
    });

    it("should allow admin users", async () => {
      const res = await request(app)
        .get("/api/admin/recipes")
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body).to.have.property("items");
    });
  });

  describe("POST /api/admin/recipes", () => {
    it("should create recipe with valid data", async () => {
      const recipeData = {
        title: "Test Recipe",
        summary: "A test recipe",
        prepTime: 15,
        cookTime: 30,
        servings: 4,
      };

      const res = await request(app)
        .post("/api/admin/recipes")
        .set("Cookie", `token=${adminToken}`)
        .send(recipeData)
        .expect(201);

      expect(res.body.title).to.equal(recipeData.title);
      expect(res.body.slug).to.equal("test-recipe");
      expect(res.body.status).to.equal("draft");

      // Check audit log
      const auditLogs = await AuditLog.find({ action: "create" });
      expect(auditLogs).to.have.length(1);
    });

    it("should return 422 for invalid data", async () => {
      const res = await request(app)
        .post("/api/admin/recipes")
        .set("Cookie", `token=${adminToken}`)
        .send({ title: "ab" }) // Too short
        .expect(422);

      expect(res.body.error.code).to.equal("VALIDATION_ERROR");
      expect(res.body.error.details.title).to.exist;
    });

    it("should handle negative prepTime/cookTime", async () => {
      const res = await request(app)
        .post("/api/admin/recipes")
        .set("Cookie", `token=${adminToken}`)
        .send({
          title: "Valid Title",
          prepTime: -5,
          cookTime: -10,
        })
        .expect(422);

      expect(res.body.error.details.prepTime).to.exist;
      expect(res.body.error.details.cookTime).to.exist;
    });

    it("should generate unique slugs for duplicate titles", async () => {
      // Create first recipe
      const res1 = await request(app)
        .post("/api/admin/recipes")
        .set("Cookie", `token=${adminToken}`)
        .send({
          title: "Duplicate Recipe",
        })
        .expect(201);

      // Create second recipe with same title
      const res2 = await request(app)
        .post("/api/admin/recipes")
        .set("Cookie", `token=${adminToken}`)
        .send({
          title: "Duplicate Recipe",
        })
        .expect(201);

      expect(res1.body.slug).to.equal("duplicate-recipe");
      expect(res2.body.slug).to.equal("duplicate-recipe-2");
    });
  });

  describe("GET /api/admin/recipes", () => {
    beforeEach(async () => {
      // Create test recipes
      await Recipe.create([
        {
          title: "Recipe 1",
          slug: "recipe-1",
          status: "published",
          authorId: normalUser._id,
          tags: ["vegan"],
          category: "dessert",
          prepTime: 10,
          cookTime: 20,
          ratingAvg: 4.5,
        },
        {
          title: "Recipe 2",
          slug: "recipe-2",
          status: "draft",
          authorId: adminUser._id,
          tags: ["meat"],
          category: "main",
          prepTime: 5,
          cookTime: 15,
          ratingAvg: 3.0,
        },
      ]);
    });

    it("should return paginated recipes", async () => {
      const res = await request(app)
        .get("/api/admin/recipes?limit=1")
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.items).to.have.length(1);
      expect(res.body.pageInfo.hasNext).to.be.true;
      expect(res.body.total).to.equal(2);
    });

    it("should filter by status", async () => {
      const res = await request(app)
        .get("/api/admin/recipes?status=published")
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.items).to.have.length(1);
      expect(res.body.items[0].status).to.equal("published");
    });

    it("should search by title", async () => {
      const res = await request(app)
        .get("/api/admin/recipes?search=Recipe 1")
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.items).to.have.length(1);
      expect(res.body.items[0].title).to.equal("Recipe 1");
    });

    it("should sort by rating", async () => {
      const res = await request(app)
        .get("/api/admin/recipes?sort=rating")
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.items[0].ratingAvg).to.equal(4.5);
      expect(res.body.items[1].ratingAvg).to.equal(3.0);
    });

    it("should sort by time (prep+cook)", async () => {
      const res = await request(app)
        .get("/api/admin/recipes?sort=time")
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      // Recipe 2 has total time 20, Recipe 1 has 30
      expect(res.body.items[0].title).to.equal("Recipe 2");
    });

    it("should validate sort parameter", async () => {
      const res = await request(app)
        .get("/api/admin/recipes?sort=invalid")
        .set("Cookie", `token=${adminToken}`)
        .expect(422);

      expect(res.body.error.details.sort).to.exist;
    });

    it("should validate additional query parameters", async () => {
      const res = await request(app)
        .get(
          "/api/admin/recipes?author=invalid&dateFrom=invalid&dateTo=invalid&limit=101"
        )
        .set("Cookie", `token=${adminToken}`)
        .expect(422);

      expect(res.body.error.details.author).to.equal(
        "Invalid author ID format"
      );
      expect(res.body.error.details.dateFrom).to.equal(
        "Invalid dateFrom format"
      );
      expect(res.body.error.details.dateTo).to.equal("Invalid dateTo format");
      expect(res.body.error.details.limit).to.equal("limit 1-100");
    });

    it("should filter by author", async () => {
      const res = await request(app)
        .get(`/api/admin/recipes?author=${normalUser._id}`)
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.items).to.have.length(1);
      expect(res.body.items[0].authorId._id.toString()).to.equal(
        normalUser._id.toString()
      );
    });

    it("should filter by date range", async () => {
      const today = new Date().toISOString().split("T")[0];
      const tomorrow = new Date(Date.now() + 86400000)
        .toISOString()
        .split("T")[0];

      const res = await request(app)
        .get(`/api/admin/recipes?dateFrom=${today}&dateTo=${tomorrow}`)
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.items.length).to.be.greaterThan(0);
    });

    it("should filter by tag", async () => {
      // Create a recipe with specific tags
      await Recipe.create({
        title: "Tagged Recipe",
        slug: "tagged-recipe",
        authorId: normalUser._id,
        tags: ["vegetarian", "quick"],
        status: "published",
      });

      const res = await request(app)
        .get("/api/admin/recipes?tag=vegetarian")
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.items).to.have.length(1);
      expect(res.body.items[0].tags).to.include("vegetarian");
    });

    it("should filter by category", async () => {
      // Create a recipe with specific category
      await Recipe.create({
        title: "Dessert Recipe",
        slug: "dessert-recipe",
        authorId: normalUser._id,
        category: "desserts",
        status: "published",
      });

      const res = await request(app)
        .get("/api/admin/recipes?category=desserts")
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.items).to.have.length(1);
      expect(res.body.items[0].category).to.equal("desserts");
    });
  });

  describe("Recipe Actions", () => {
    let recipe;

    beforeEach(async () => {
      recipe = await Recipe.create({
        title: "Test Recipe",
        slug: "test-recipe",
        status: "draft",
        authorId: normalUser._id,
      });
    });

    it("should publish recipe", async () => {
      const res = await request(app)
        .post(`/api/admin/recipes/${recipe._id}/publish`)
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.status).to.equal("published");
      expect(res.body.publishAt).to.exist;

      // Check audit log
      const auditLogs = await AuditLog.find({ action: "publish" });
      expect(auditLogs).to.have.length(1);
    });

    it("should schedule recipe for future publish", async () => {
      const futureDate = new Date(Date.now() + 86400000); // +1 day

      const res = await request(app)
        .post(`/api/admin/recipes/${recipe._id}/publish`)
        .set("Cookie", `token=${adminToken}`)
        .send({ publishAt: futureDate.toISOString() })
        .expect(200);

      expect(res.body.status).to.equal("scheduled");
      expect(new Date(res.body.publishAt)).to.be.greaterThan(new Date());
    });

    it("should unpublish recipe", async () => {
      // First publish
      await Recipe.findByIdAndUpdate(recipe._id, {
        status: "published",
        publishAt: new Date(),
      });

      const res = await request(app)
        .post(`/api/admin/recipes/${recipe._id}/unpublish`)
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.status).to.equal("draft");
      expect(res.body.publishAt).to.be.null;
    });

    it("should reject recipe with reason", async () => {
      const reason = "Content violates guidelines";

      const res = await request(app)
        .post(`/api/admin/recipes/${recipe._id}/reject`)
        .set("Cookie", `token=${adminToken}`)
        .send({ reason })
        .expect(200);

      expect(res.body.status).to.equal("rejected");
      expect(res.body.rejection.reason).to.equal(reason);
    });

    it("should validate reject reason", async () => {
      const res = await request(app)
        .post(`/api/admin/recipes/${recipe._id}/reject`)
        .set("Cookie", `token=${adminToken}`)
        .send({ reason: "abc" }) // Too short
        .expect(422);

      expect(res.body.error.details.reason).to.exist;
    });

    it("should return 404 for non-existent recipe", async () => {
      const fakeId = "507f1f77bcf86cd799439011";

      const res = await request(app)
        .post(`/api/admin/recipes/${fakeId}/publish`)
        .set("Cookie", `token=${adminToken}`)
        .expect(404);

      expect(res.body.error.code).to.equal("RECIPE_NOT_FOUND");
    });
  });

  describe("Bulk Operations", () => {
    let recipes;

    beforeEach(async () => {
      recipes = await Recipe.create([
        {
          title: "Recipe A",
          slug: "recipe-a",
          status: "draft",
          authorId: normalUser._id,
        },
        {
          title: "Recipe B",
          slug: "recipe-b",
          status: "draft",
          authorId: normalUser._id,
        },
      ]);
    });

    it("should bulk publish recipes", async () => {
      const ids = recipes.map((r) => r._id.toString());

      const res = await request(app)
        .post("/api/admin/recipes/bulk")
        .set("Cookie", `token=${adminToken}`)
        .send({ ids, action: "publish" })
        .expect(200);

      expect(res.body.processed).to.have.length(2);
      expect(res.body.failed).to.have.length(0);

      // Verify recipes are published
      const updatedRecipes = await Recipe.find({ _id: { $in: ids } });
      updatedRecipes.forEach((recipe) => {
        expect(recipe.status).to.equal("published");
      });
    });

    it("should bulk delete recipes", async () => {
      const ids = recipes.map((r) => r._id.toString());

      const res = await request(app)
        .post("/api/admin/recipes/bulk")
        .set("Cookie", `token=${adminToken}`)
        .send({ ids, action: "delete" })
        .expect(200);

      expect(res.body.processed).to.have.length(2);

      // Verify recipes are deleted
      const remainingRecipes = await Recipe.find({ _id: { $in: ids } });
      expect(remainingRecipes).to.have.length(0);
    });

    it("should validate bulk action", async () => {
      const res = await request(app)
        .post("/api/admin/recipes/bulk")
        .set("Cookie", `token=${adminToken}`)
        .send({ ids: [], action: "invalid" })
        .expect(422);

      expect(res.body.error.details.ids).to.exist;
      expect(res.body.error.details.action).to.exist;
    });

    it("should handle mix of valid and invalid IDs", async () => {
      const validId = recipes[0]._id.toString();
      const invalidId = "507f1f77bcf86cd799439011";

      const res = await request(app)
        .post("/api/admin/recipes/bulk")
        .set("Cookie", `token=${adminToken}`)
        .send({ ids: [validId, invalidId], action: "publish" })
        .expect(200);

      expect(res.body.processed).to.have.length(1);
      expect(res.body.failed).to.have.length(1);
      expect(res.body.failed[0].error).to.equal("NOT_FOUND");
    });
  });

  describe("Cursor Pagination", () => {
    beforeEach(async () => {
      // Create recipes with slight time differences
      const baseTime = new Date("2024-01-01");
      for (let i = 0; i < 5; i++) {
        await Recipe.create({
          title: `Recipe ${i}`,
          slug: `recipe-${i}`,
          status: "draft",
          authorId: normalUser._id,
          createdAt: new Date(baseTime.getTime() + i * 1000),
          updatedAt: new Date(baseTime.getTime() + i * 1000),
        });
      }
    });

    it("should handle cursor pagination correctly", async () => {
      // Get first page
      const page1 = await request(app)
        .get("/api/admin/recipes?limit=2&sort=new")
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(page1.body.items).to.have.length(2);
      expect(page1.body.pageInfo.hasNext).to.be.true;
      expect(page1.body.pageInfo.nextCursor).to.exist;

      // Get second page using cursor
      const cursor = page1.body.pageInfo.nextCursor;
      const page2 = await request(app)
        .get(`/api/admin/recipes?limit=2&sort=new&cursor=${cursor}`)
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(page2.body.items).to.have.length(2);

      // Ensure no overlap
      const page1Ids = page1.body.items.map((r) => r._id);
      const page2Ids = page2.body.items.map((r) => r._id);
      const intersection = page1Ids.filter((id) => page2Ids.includes(id));
      expect(intersection).to.have.length(0);
    });
  });

  describe("Audit Logs", () => {
    beforeEach(async () => {
      // Create some audit logs
      await AuditLog.create([
        {
          action: "create",
          entityId: null,
          userId: adminUser._id,
          userEmail: adminUser.email,
          userRole: adminUser.role,
          metadata: { title: "Recipe 1" },
        },
        {
          action: "publish",
          entityId: null,
          userId: adminUser._id,
          userEmail: adminUser.email,
          userRole: adminUser.role,
          metadata: { status: "published" },
        },
      ]);
    });

    it("should get audit logs", async () => {
      const res = await request(app)
        .get("/api/admin/audit-logs")
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.items).to.have.length(2);
      expect(res.body.items[0].action).to.exist;
      expect(res.body.items[0].userId).to.exist;
    });

    it("should filter audit logs by action", async () => {
      const res = await request(app)
        .get("/api/admin/audit-logs?action=create")
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.items).to.have.length(1);
      expect(res.body.items[0].action).to.equal("create");
    });

    it("should filter audit logs by date range", async () => {
      const today = new Date().toISOString().split("T")[0];
      const tomorrow = new Date(Date.now() + 86400000)
        .toISOString()
        .split("T")[0];

      const res = await request(app)
        .get(`/api/admin/audit-logs?dateFrom=${today}&dateTo=${tomorrow}`)
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.items.length).to.be.greaterThan(0);
    });
  });
});
