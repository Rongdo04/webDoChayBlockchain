// tests/admin.taxonomy.test.js
import { expect } from "chai";
import request from "supertest";
import app from "../app.js";
import User from "../models/User.js";
import Taxonomy from "../models/Taxonomy.js";
import AuditLog from "../models/AuditLog.js";
import { generateAccessToken } from "../utils/jwt.js";
import { setupTestDB, teardownTestDB, clearDB } from "./setup.js";

describe("Admin Taxonomy API", () => {
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
      const res = await request(app)
        .get("/api/admin/taxonomy/categories")
        .expect(401);

      expect(res.body.error.code).to.equal("UNAUTHORIZED");
    });

    it("should reject non-admin users", async () => {
      const res = await request(app)
        .get("/api/admin/taxonomy/categories")
        .set("Cookie", `token=${userToken}`)
        .expect(403);

      expect(res.body.error.code).to.equal("FORBIDDEN");
    });

    it("should allow admin users", async () => {
      const res = await request(app)
        .get("/api/admin/taxonomy/categories")
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body).to.have.property("items");
    });
  });

  describe("Categories CRUD", () => {
    describe("POST /api/admin/taxonomy/categories", () => {
      it("should create category with valid data", async () => {
        const categoryData = {
          name: "Test Category",
          description: "A test category",
        };

        const res = await request(app)
          .post("/api/admin/taxonomy/categories")
          .set("Cookie", `token=${adminToken}`)
          .send(categoryData)
          .expect(201);

        expect(res.body.name).to.equal(categoryData.name);
        expect(res.body.type).to.equal("category");
        expect(res.body.slug).to.equal("test-category");
        expect(res.body.description).to.equal(categoryData.description);
        expect(res.body.isActive).to.be.true;

        // Check audit log
        const auditLogs = await AuditLog.find({ action: "create" });
        expect(auditLogs).to.have.length(1);
      });

      it("should normalize name (trim and clean spaces)", async () => {
        const res = await request(app)
          .post("/api/admin/taxonomy/categories")
          .set("Cookie", `token=${adminToken}`)
          .send({ name: "  Test   Category  " })
          .expect(201);

        expect(res.body.name).to.equal("Test Category");
      });

      it("should return 409 for duplicate name", async () => {
        // Create first category
        await request(app)
          .post("/api/admin/taxonomy/categories")
          .set("Cookie", `token=${adminToken}`)
          .send({ name: "Duplicate Category" })
          .expect(201);

        // Try to create duplicate
        const res = await request(app)
          .post("/api/admin/taxonomy/categories")
          .set("Cookie", `token=${adminToken}`)
          .send({ name: "Duplicate Category" })
          .expect(409);

        expect(res.body.error.code).to.equal("TAXONOMY_DUPLICATE");
      });

      it("should return 422 for invalid data", async () => {
        const res = await request(app)
          .post("/api/admin/taxonomy/categories")
          .set("Cookie", `token=${adminToken}`)
          .send({ name: "A" }) // Too short
          .expect(422);

        expect(res.body.error.details.name).to.exist;
      });
    });

    describe("GET /api/admin/taxonomy/categories", () => {
      beforeEach(async () => {
        // Create test categories
        await Taxonomy.create([
          {
            name: "Active Category",
            type: "category",
            slug: "active-category",
            isActive: true,
            usageCount: 5,
          },
          {
            name: "Draft Category",
            type: "category",
            slug: "draft-category",
            isActive: false,
            usageCount: 2,
          },
        ]);
      });

      it("should list all categories", async () => {
        const res = await request(app)
          .get("/api/admin/taxonomy/categories")
          .set("Cookie", `token=${adminToken}`)
          .expect(200);

        expect(res.body.items).to.have.length(2);
        expect(res.body.total).to.equal(2);
      });

      it("should filter by active status", async () => {
        const res = await request(app)
          .get("/api/admin/taxonomy/categories?active=true")
          .set("Cookie", `token=${adminToken}`)
          .expect(200);

        expect(res.body.items).to.have.length(1);
        expect(res.body.items[0].isActive).to.be.true;
      });

      it("should search by name", async () => {
        const res = await request(app)
          .get("/api/admin/taxonomy/categories?search=Active")
          .set("Cookie", `token=${adminToken}`)
          .expect(200);

        expect(res.body.items).to.have.length(1);
        expect(res.body.items[0].name).to.include("Active");
      });

      it("should sort by usage count", async () => {
        const res = await request(app)
          .get("/api/admin/taxonomy/categories?sort=usage")
          .set("Cookie", `token=${adminToken}`)
          .expect(200);

        expect(res.body.items[0].usageCount).to.be.greaterThan(
          res.body.items[1].usageCount
        );
      });
    });

    describe("PUT /api/admin/taxonomy/categories/:id", () => {
      let category;

      beforeEach(async () => {
        category = await Taxonomy.create({
          name: "Test Category",
          type: "category",
          slug: "test-category",
          description: "Original description",
        });
      });

      it("should update category", async () => {
        const updateData = {
          name: "Updated Category",
          description: "Updated description",
          isActive: false,
        };

        const res = await request(app)
          .put(`/api/admin/taxonomy/categories/${category._id}`)
          .set("Cookie", `token=${adminToken}`)
          .send(updateData)
          .expect(200);

        expect(res.body.name).to.equal(updateData.name);
        expect(res.body.description).to.equal(updateData.description);
        expect(res.body.isActive).to.equal(updateData.isActive);

        // Check audit log
        const auditLogs = await AuditLog.find({ action: "update" });
        expect(auditLogs).to.have.length(1);
      });

      it("should return 409 for duplicate name update", async () => {
        // Create another category
        await Taxonomy.create({
          name: "Another Category",
          type: "category",
          slug: "another-category",
        });

        const res = await request(app)
          .put(`/api/admin/taxonomy/categories/${category._id}`)
          .set("Cookie", `token=${adminToken}`)
          .send({ name: "Another Category" })
          .expect(409);

        expect(res.body.error.code).to.equal("TAXONOMY_DUPLICATE");
      });

      it("should return 404 for non-existent category", async () => {
        const fakeId = "507f1f77bcf86cd799439011";

        const res = await request(app)
          .put(`/api/admin/taxonomy/categories/${fakeId}`)
          .set("Cookie", `token=${adminToken}`)
          .send({ name: "Updated Name" })
          .expect(404);

        expect(res.body.error.code).to.equal("TAXONOMY_NOT_FOUND");
      });
    });

    describe("DELETE /api/admin/taxonomy/categories/:id", () => {
      let category;

      beforeEach(async () => {
        category = await Taxonomy.create({
          name: "Test Category",
          type: "category",
          slug: "test-category",
        });
      });

      it("should delete category", async () => {
        const res = await request(app)
          .delete(`/api/admin/taxonomy/categories/${category._id}`)
          .set("Cookie", `token=${adminToken}`)
          .expect(204);

        // Verify deletion
        const deleted = await Taxonomy.findById(category._id);
        expect(deleted).to.be.null;

        // Check audit log
        const auditLogs = await AuditLog.find({ action: "delete" });
        expect(auditLogs).to.have.length(1);
      });

      it("should return 404 for non-existent category", async () => {
        const fakeId = "507f1f77bcf86cd799439011";

        const res = await request(app)
          .delete(`/api/admin/taxonomy/categories/${fakeId}`)
          .set("Cookie", `token=${adminToken}`)
          .expect(404);

        expect(res.body.error.code).to.equal("TAXONOMY_NOT_FOUND");
      });
    });
  });

  describe("Tags CRUD", () => {
    it("should create tag with valid data", async () => {
      const tagData = {
        name: "Test Tag",
        description: "A test tag",
      };

      const res = await request(app)
        .post("/api/admin/taxonomy/tags")
        .set("Cookie", `token=${adminToken}`)
        .send(tagData)
        .expect(201);

      expect(res.body.name).to.equal(tagData.name);
      expect(res.body.type).to.equal("tag");
      expect(res.body.slug).to.equal("test-tag");
    });

    it("should list tags", async () => {
      // Create test tags
      await Taxonomy.create([
        { name: "Tag 1", type: "tag", slug: "tag-1" },
        { name: "Tag 2", type: "tag", slug: "tag-2" },
      ]);

      const res = await request(app)
        .get("/api/admin/taxonomy/tags")
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.items).to.have.length(2);
      expect(res.body.items[0].type).to.equal("tag");
    });
  });

  describe("Merge Operation", () => {
    let sourceTag1, sourceTag2, targetTag;

    beforeEach(async () => {
      sourceTag1 = await Taxonomy.create({
        name: "Source Tag 1",
        type: "tag",
        slug: "source-tag-1",
        usageCount: 3,
      });

      sourceTag2 = await Taxonomy.create({
        name: "Source Tag 2",
        type: "tag",
        slug: "source-tag-2",
        usageCount: 2,
      });

      targetTag = await Taxonomy.create({
        name: "Target Tag",
        type: "tag",
        slug: "target-tag",
        usageCount: 1,
      });
    });

    it("should merge tags successfully", async () => {
      const res = await request(app)
        .post("/api/admin/taxonomy/merge")
        .set("Cookie", `token=${adminToken}`)
        .send({
          fromIds: [sourceTag1._id.toString(), sourceTag2._id.toString()],
          toId: targetTag._id.toString(),
        })
        .expect(200);

      expect(res.body.merged).to.equal(2);
      expect(res.body.totalUsage).to.equal(5); // 3 + 2
      expect(res.body.target.usageCount).to.equal(6); // 1 + 3 + 2

      // Verify source tags are deleted
      const deletedTag1 = await Taxonomy.findById(sourceTag1._id);
      const deletedTag2 = await Taxonomy.findById(sourceTag2._id);
      expect(deletedTag1).to.be.null;
      expect(deletedTag2).to.be.null;

      // Check audit log (merge operation logs as 'update' with metadata.operation = 'merge')
      const auditLogs = await AuditLog.find({
        action: "update",
        "metadata.operation": "merge",
      });
      expect(auditLogs).to.have.length(1);
    });

    it("should validate merge request", async () => {
      const res = await request(app)
        .post("/api/admin/taxonomy/merge")
        .set("Cookie", `token=${adminToken}`)
        .send({
          fromIds: [],
          toId: "invalid-id",
        })
        .expect(422);

      expect(res.body.error.details.fromIds).to.exist;
      expect(res.body.error.details.toId).to.exist;
    });

    it("should return 404 for non-existent target", async () => {
      const fakeId = "507f1f77bcf86cd799439011";

      const res = await request(app)
        .post("/api/admin/taxonomy/merge")
        .set("Cookie", `token=${adminToken}`)
        .send({
          fromIds: [sourceTag1._id.toString()],
          toId: fakeId,
        })
        .expect(404);

      expect(res.body.error.code).to.equal("TAXONOMY_NOT_FOUND");
    });
  });

  describe("Statistics", () => {
    beforeEach(async () => {
      await Taxonomy.create([
        {
          name: "Category 1",
          type: "category",
          slug: "cat-1",
          isActive: true,
          usageCount: 5,
        },
        {
          name: "Category 2",
          type: "category",
          slug: "cat-2",
          isActive: false,
          usageCount: 3,
        },
        {
          name: "Tag 1",
          type: "tag",
          slug: "tag-1",
          isActive: true,
          usageCount: 2,
        },
      ]);
    });

    it("should get category statistics", async () => {
      const res = await request(app)
        .get("/api/admin/taxonomy/categories/stats")
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.total).to.equal(2);
      expect(res.body.active).to.equal(1);
      expect(res.body.inactive).to.equal(1);
      expect(res.body.totalUsage).to.equal(8); // 5 + 3
    });

    it("should get tag statistics", async () => {
      const res = await request(app)
        .get("/api/admin/taxonomy/tags/stats")
        .set("Cookie", `token=${adminToken}`)
        .expect(200);

      expect(res.body.total).to.equal(1);
      expect(res.body.active).to.equal(1);
      expect(res.body.totalUsage).to.equal(2);
    });
  });

  describe("Validation", () => {
    it("should validate query parameters", async () => {
      const res = await request(app)
        .get(
          "/api/admin/taxonomy/categories?active=invalid&sort=invalid&limit=101"
        )
        .set("Cookie", `token=${adminToken}`)
        .expect(422);

      expect(res.body.error.details.active).to.exist;
      expect(res.body.error.details.sort).to.exist;
      expect(res.body.error.details.limit).to.exist;
    });

    it("should validate ID format", async () => {
      const res = await request(app)
        .get("/api/admin/taxonomy/categories/invalid-id")
        .set("Cookie", `token=${adminToken}`)
        .expect(422);

      expect(res.body.error.details.id).to.exist;
    });
  });
});
