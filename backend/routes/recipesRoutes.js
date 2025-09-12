// routes/recipesRoutes.js - Public recipes API
import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { authenticate } from "../middleware/auth.js";
import * as recipesRepo from "../repositories/recipes.repo.js";
import * as commentsRepo from "../repositories/comments.repo.js";

const router = Router();

// GET /api/recipes - List published recipes with filtering and pagination
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 12,
      sort = "newest",
      category,
      search,
      difficulty,
      dietType,
      tags,
    } = req.query;

    const filters = {
      status: "published", // Only published recipes for public API
    };

    // Add category filter
    if (category) {
      filters.category = category;
    }

    // Add search filter
    if (search && search.trim()) {
      filters.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
        { "ingredients.name": { $regex: search.trim(), $options: "i" } },
      ];
    }

    // Add other filters
    if (difficulty) filters.difficulty = difficulty;
    if (dietType) filters.dietType = dietType;
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      filters.tasteTags = { $in: tagArray };
    }

    // Sort options
    let sortOption = {};
    switch (sort) {
      case "rating":
        sortOption = { ratingAvg: -1, ratingCount: -1 };
        break;
      case "popular":
        sortOption = { likes: -1, views: -1 };
        break;
      case "newest":
        sortOption = { createdAt: -1 };
        break;
      case "time":
        sortOption = { durationTotal: 1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sortOption,
      populate: [
        {
          path: "authorId",
          select: "name email avatar",
        },
        {
          path: "images",
          select: "url alt originalName filename",
        },
      ],
    };

    const result = await recipesRepo.findWithPagination(filters, options);

    res.json({
      data: result.docs,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.totalDocs,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      },
    });
  })
);

// GET /api/recipes/:id - Get single recipe by ID
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const recipe = await recipesRepo.findById(id, {
      populate: [
        {
          path: "authorId",
          select: "name email avatar",
        },
        {
          path: "images",
          select: "url alt originalName filename",
        },
      ],
    });

    if (!recipe || recipe.status !== "published") {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Không tìm thấy công thức hoặc công thức chưa được xuất bản",
        },
      });
    }

    // Increment view count
    await recipesRepo.incrementViews(id);

    res.json({ data: recipe });
  })
);

// GET /api/recipes/slug/:slug - Get single recipe by slug
router.get(
  "/slug/:slug",
  asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const recipe = await recipesRepo.findOne(
      { slug, status: "published" },
      {
        populate: [
          {
            path: "authorId",
            select: "name email avatar",
          },
          {
            path: "images",
            select: "url alt originalName filename",
          },
        ],
      }
    );

    if (!recipe) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Không tìm thấy công thức",
        },
      });
    }

    // Increment view count
    await recipesRepo.incrementViews(recipe._id);

    res.json({ data: recipe });
  })
);

// GET /api/recipes/:id/comments - Get comments for a recipe
router.get(
  "/:id/comments",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status = "approved", cursor, limit = 10 } = req.query;

    // Validate recipe exists
    const recipe = await recipesRepo.findById(id);
    if (!recipe) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Không tìm thấy công thức",
        },
      });
    }

    const result = await commentsRepo.listComments({
      recipeId: id,
      status,
      cursor,
      limit: parseInt(limit),
    });

    res.json({
      data: result.items,
      pagination: result.pageInfo,
    });
  })
);

// POST /api/recipes/:id/comments - Add a comment to a recipe
router.post(
  "/:id/comments",
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { content, rating } = req.body;

    // Debug logging
    console.log("Comment submission:", {
      recipeId: id,
      userId: req.user?._id,
      userEmail: req.user?.email,
      content: content,
      contentLength: content?.length,
      rating: rating,
      body: req.body,
    });

    // Validate input
    if (!content || !content.trim()) {
      console.log("Validation failed: content is empty or missing");
      return res.status(422).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Dữ liệu không hợp lệ",
        },
        errors: {
          content: "Nội dung bình luận không được để trống",
        },
      });
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(422).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Dữ liệu không hợp lệ",
        },
        errors: {
          rating: "Đánh giá phải từ 1 đến 5 sao",
        },
      });
    }

    // Validate recipe exists
    const recipe = await recipesRepo.findById(id);
    if (!recipe) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Không tìm thấy công thức",
        },
      });
    }

    // Create comment
    const commentData = {
      recipeId: id,
      userId: req.user._id,
      content: content.trim(),
      status: "pending", // Comments need approval
    };

    if (rating) {
      commentData.rating = rating;
    }

    const comment = await commentsRepo.create(commentData);

    res.status(201).json({
      data: comment,
      message: "Bình luận đã được gửi và đang chờ duyệt",
    });
  })
);

// POST /api/recipes - Submit a new recipe (user submission)
router.post(
  "/",
  authenticate,
  asyncHandler(async (req, res) => {
    try {
      const {
        title,
        slug,
        summary,
        content,
        description, // Backward compatibility
        seoTitle,
        seoDescription,
        ingredients,
        steps,
        prepTime,
        cookTime,
        durationPrep, // Backward compatibility
        durationCook, // Backward compatibility
        servings,
        difficulty,
        dietType,
        tags,
        tasteTags, // Backward compatibility
        category,
        images,
        videoUrl,
      } = req.body;

      // Validate required fields - support both new and old formats
      const hasSummary = summary || description;
      const hasContent = content || description;

      if (!title || !hasSummary || !hasContent || !ingredients || !steps) {
        return res.status(422).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Thiếu thông tin bắt buộc",
            details: {
              title: !title ? "Tên món ăn là bắt buộc" : null,
              summary: !hasSummary ? "Tóm tắt là bắt buộc" : null,
              content: !hasContent ? "Nội dung là bắt buộc" : null,
              ingredients: !ingredients ? "Nguyên liệu là bắt buộc" : null,
              steps: !steps ? "Các bước làm là bắt buộc" : null,
            },
          },
        });
      }

      // Generate slug from title if not provided
      const finalSlug =
        slug ||
        title
          .toLowerCase()
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "")
          .replace(/đ/gi, "d")
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .trim();

      // Prepare recipe data in admin format
      const recipeData = {
        title: title.trim(),
        slug: finalSlug,
        summary: (summary || description || "").trim(),
        content: (content || description || "").trim(),
        seoTitle: (seoTitle || "").trim(),
        seoDescription: (seoDescription || "").trim(),
        ingredients: Array.isArray(ingredients) ? ingredients : [],
        steps: Array.isArray(steps) ? steps : [],
        prepTime: parseInt(prepTime || durationPrep) || 0,
        cookTime: parseInt(cookTime || durationCook) || 0,
        servings: parseInt(servings) || 1,
        difficulty: difficulty || "medium",
        dietType: dietType || "none",
        tags: Array.isArray(tags)
          ? tags
          : Array.isArray(tasteTags)
          ? tasteTags
          : [],
        category: category || "main",
        images: Array.isArray(images) ? images : [],
        videoUrl: videoUrl || "",
        userId: req.user.id,
        status: "draft", // Set to draft instead of review for user submissions
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Create recipe using the correct repository function
      const newRecipe = await recipesRepo.createRecipe(
        recipeData,
        req.user.id,
        req.user,
        req
      );

      res.status(201).json({
        data: newRecipe,
        message: "Công thức đã được gửi và đang chờ duyệt",
      });
    } catch (error) {
      console.error("Error creating recipe:", error);
      res.status(500).json({
        error: {
          code: "INTERNAL_ERROR",
          message: "Lỗi server khi tạo công thức",
          details: error.message,
        },
      });
    }
  })
);

export default router;
