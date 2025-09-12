// routes/taxonomyRoutes.js - Public taxonomy routes
import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import * as taxonomyRepo from "../repositories/taxonomy.repo.js";

const router = Router();

// GET /api/taxonomy/categories - Get all active categories
router.get(
  "/categories",
  asyncHandler(async (req, res) => {
    const categories = await taxonomyRepo.findCategories({
      isActive: true,
    });

    res.json({
      data: categories.map((cat) => ({
        id: cat._id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        color: cat.color,
        usageCount: cat.usageCount || 0,
      })),
    });
  })
);

// GET /api/taxonomy/tags - Get all active tags
router.get(
  "/tags",
  asyncHandler(async (req, res) => {
    const { limit = 50 } = req.query;

    const tags = await taxonomyRepo.findTags(
      { isActive: true },
      {
        limit: parseInt(limit),
        sort: { usageCount: -1, name: 1 },
      }
    );

    res.json({
      data: tags.map((tag) => ({
        id: tag._id,
        name: tag.name,
        slug: tag.slug,
        usageCount: tag.usageCount || 0,
      })),
    });
  })
);

// Public suggest endpoint
router.get(
  "/suggest",
  asyncHandler(async (req, res) => {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({ categories: [], tags: [] });
    }

    const searchTerm = q.trim();

    // Search in both categories and tags
    const [categories, tags] = await Promise.all([
      taxonomyRepo.searchCategories(searchTerm, 5),
      taxonomyRepo.searchTags(searchTerm, 5),
    ]);

    res.json({
      categories: categories.map((cat) => ({
        id: cat._id,
        name: cat.name,
        slug: cat.slug,
      })),
      tags: tags.map((tag) => ({
        id: tag._id,
        name: tag.name,
        slug: tag.slug,
      })),
    });
  })
);

export default router;
