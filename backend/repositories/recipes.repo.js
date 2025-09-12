// repositories/recipes.repo.js
// Mongoose-based repository for admin recipe management
import Recipe from "../models/Recipe.js";
import AuditLog from "../models/AuditLog.js";

// Allowed statuses
const STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  REJECTED: "rejected",
  SCHEDULED: "scheduled", // future publish
};

// Helper to generate unique slug (append -2, -3...)
async function generateUniqueSlug(baseSlug) {
  let slug = baseSlug;
  let counter = 2;
  while (await Recipe.findOne({ slug })) {
    slug = `${baseSlug}-${counter++}`;
  }
  return slug;
}

// Basic slugify (Vietnamese accent removal simplified)
function slugify(text) {
  return text
    .toString()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 120);
}

function now() {
  return new Date();
}

// Repository functions
export async function createRecipe(data, authorId, user, req = null) {
  const baseSlug = data.slug ? slugify(data.slug) : slugify(data.title);
  const uniqueSlug = await generateUniqueSlug(baseSlug);

  const recipe = new Recipe({
    title: data.title,
    slug: uniqueSlug,
    summary: data.summary || "",
    content: data.content || "",
    ingredients: data.ingredients || [],
    steps: data.steps || [],
    tags: data.tags || [],
    category: data.category || null,
    prepTime: data.prepTime || 0,
    cookTime: data.cookTime || 0,
    servings: data.servings || 0,
    images: data.images || [],
    status: STATUS.DRAFT,
    publishAt: null,
    ratingAvg: 0,
    ratingCount: 0,
    authorId,
  });

  const saved = await recipe.save();
  await AuditLog.logAction(
    "create",
    saved._id,
    user,
    { title: saved.title },
    req
  );
  return saved;
}

export async function updateRecipe(id, data, user, req = null) {
  const existing = await Recipe.findById(id);
  if (!existing) return null;

  // If title or slug changed, regenerate slug (respect provided slug first)
  if (data.title || data.slug) {
    const baseSlug = data.slug
      ? slugify(data.slug)
      : slugify(data.title || existing.title);
    if (baseSlug && baseSlug !== existing.slug) {
      existing.slug = await generateUniqueSlug(baseSlug);
    }
  }

  Object.assign(existing, data);
  const updated = await existing.save();
  await AuditLog.logAction("update", id, user, { title: updated.title }, req);
  return updated;
}

export async function getRecipe(id) {
  return await Recipe.findById(id).populate("authorId", "name email");
}

export async function deleteRecipe(id, user, req = null) {
  const recipe = await Recipe.findById(id);
  if (!recipe) return false;

  await Recipe.findByIdAndDelete(id);
  await AuditLog.logAction("delete", id, user, { title: recipe.title }, req);
  return true;
}

export async function publishRecipe(id, publishAt, user, req = null) {
  const recipe = await Recipe.findById(id);
  if (!recipe) return null;

  recipe.status =
    publishAt && new Date(publishAt) > now()
      ? STATUS.SCHEDULED
      : STATUS.PUBLISHED;
  recipe.publishAt = publishAt ? new Date(publishAt) : now();
  recipe.rejection = undefined;

  const updated = await recipe.save();
  await AuditLog.logAction(
    "publish",
    id,
    user,
    {
      publishAt: updated.publishAt,
      status: updated.status,
    },
    req
  );
  return updated;
}

export async function unpublishRecipe(id, user, req = null) {
  const recipe = await Recipe.findById(id);
  if (!recipe) return null;

  recipe.status = STATUS.DRAFT;
  recipe.publishAt = null;

  const updated = await recipe.save();
  await AuditLog.logAction("unpublish", id, user, {}, req);
  return updated;
}

export async function rejectRecipe(id, user, reason, req = null) {
  const recipe = await Recipe.findById(id);
  if (!recipe) return null;

  recipe.status = STATUS.REJECTED;
  recipe.rejection = { reason, at: now(), by: user._id || user.id };

  const updated = await recipe.save();
  await AuditLog.logAction("reject", id, user, { reason }, req);
  return updated;
}

// Bulk operations limited to publish/unpublish/delete
export async function bulkAction(ids, action, user, req = null) {
  const results = { processed: [], failed: [] };

  for (const id of ids) {
    try {
      let res = null;
      if (action === "publish") res = await publishRecipe(id, null, user, req);
      else if (action === "unpublish")
        res = await unpublishRecipe(id, user, req);
      else if (action === "delete") res = await deleteRecipe(id, user, req);
      else throw new Error("Unsupported action");

      if (!res) results.failed.push({ id, error: "NOT_FOUND" });
      else results.processed.push(id);
    } catch (e) {
      results.failed.push({ id, error: e.message });
    }
  }

  await AuditLog.logAction(
    "bulk",
    null,
    user,
    {
      action,
      processed: results.processed.length,
    },
    req
  );
  return results;
}

// Listing with filtering, sorting, cursor pagination
export async function listRecipes(query) {
  const {
    search,
    status,
    author,
    tag,
    category,
    dateFrom,
    dateTo,
    sort = "updatedAt",
    direction = "desc",
    page = 1,
    limit = 20,
  } = query;

  let filter = {};

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { slug: { $regex: search, $options: "i" } },
    ];
  }
  if (status) filter.status = status;
  if (author) filter.authorId = author;
  if (tag) filter.tags = { $in: [tag] };
  if (category) filter.category = category;
  if (dateFrom || dateTo) {
    filter.createdAt = {};
    if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
    if (dateTo) filter.createdAt.$lte = new Date(dateTo);
  }

  // Sorting - handle both old and new sort formats
  let sortObj = {};
  const sortDirection = direction === "desc" ? -1 : 1;

  if (sort === "rating") {
    sortObj = { ratingAvg: sortDirection, updatedAt: -1 };
  } else if (sort === "totalTime" || sort === "time") {
    // For time sorting, use aggregation pipeline
    const pipeline = [
      { $match: filter },
      { $addFields: { totalTime: { $add: ["$prepTime", "$cookTime"] } } },
      { $sort: { totalTime: sortDirection, updatedAt: -1 } },
      { $skip: (Number(page) - 1) * Number(limit) },
      { $limit: Number(limit) },
      {
        $lookup: {
          from: "users",
          localField: "authorId",
          foreignField: "_id",
          as: "author",
        },
      },
      {
        $lookup: {
          from: "medias",
          localField: "images",
          foreignField: "_id",
          as: "images",
          pipeline: [{ $project: { url: 1, alt: 1, originalName: 1 } }],
        },
      },
      { $addFields: { author: { $arrayElemAt: ["$author", 0] } } },
    ];

    const items = await Recipe.aggregate(pipeline);
    const total = await Recipe.countDocuments(filter);
    const totalPages = Math.ceil(total / Number(limit));

    return {
      items,
      pageInfo: {
        currentPage: Number(page),
        totalPages,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1,
      },
      total,
    };
  } else {
    // Handle standard field sorting (createdAt, updatedAt, title, etc.)
    const validSortFields = [
      "createdAt",
      "updatedAt",
      "title",
      "ratingAvg",
      "views",
    ];
    const sortField = validSortFields.includes(sort) ? sort : "updatedAt";
    sortObj[sortField] = sortDirection;
  }

  // Standard pagination (not cursor-based)
  const skip = (Number(page) - 1) * Number(limit);

  const recipes = await Recipe.find(filter)
    .sort(sortObj)
    .skip(skip)
    .limit(Number(limit))
    .populate("authorId", "name email")
    .populate("category", "name slug description")
    .populate("tags", "name slug description")
    .populate("images", "url alt originalName");

  const total = await Recipe.countDocuments(filter);
  const totalPages = Math.ceil(total / Number(limit));

  return {
    items: recipes,
    pageInfo: {
      currentPage: Number(page),
      totalPages,
      hasNext: Number(page) < totalPages,
      hasPrev: Number(page) > 1,
    },
    total,
  };
}

// Audit logging functions
export async function getAuditLogs(query = {}) {
  const {
    action,
    userId,
    entityId,
    dateFrom,
    dateTo,
    limit = 50,
    cursor,
  } = query;

  let filter = {};

  if (action) filter.action = action;
  if (userId) filter.userId = userId;
  if (entityId) filter.entityId = entityId;
  if (dateFrom || dateTo) {
    filter.createdAt = {};
    if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
    if (dateTo) filter.createdAt.$lte = new Date(dateTo);
  }
  if (cursor) {
    filter._id = { $lt: cursor }; // Reverse chronological
  }

  const logs = await AuditLog.find(filter)
    .sort({ createdAt: -1 })
    .limit(Number(limit) + 1)
    .populate("userId", "name email");

  const hasNext = logs.length > Number(limit);
  if (hasNext) logs.pop();

  return {
    items: logs,
    pageInfo: {
      nextCursor: logs.length > 0 ? logs[logs.length - 1]._id : null,
      hasNext,
    },
    total: await AuditLog.countDocuments(filter),
  };
}

export const RecipeStatus = STATUS;

// Public API methods
export async function findWithPagination(filters = {}, options = {}) {
  const {
    page = 1,
    limit = 12,
    sort = { createdAt: -1 },
    populate = [],
  } = options;

  const skip = (page - 1) * limit;

  let query = Recipe.find(filters);

  // Apply population
  if (populate && populate.length > 0) {
    populate.forEach((pop) => {
      query = query.populate(pop);
    });
  }

  const [docs, total] = await Promise.all([
    query.sort(sort).skip(skip).limit(limit).exec(),
    Recipe.countDocuments(filters),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    docs,
    page,
    limit,
    totalDocs: total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

export async function findById(id, options = {}) {
  const { populate = [] } = options;

  let query = Recipe.findById(id);

  if (populate && populate.length > 0) {
    populate.forEach((pop) => {
      query = query.populate(pop);
    });
  }

  return await query.exec();
}

export async function findOne(filters, options = {}) {
  const { populate = [] } = options;

  let query = Recipe.findOne(filters);

  if (populate && populate.length > 0) {
    populate.forEach((pop) => {
      query = query.populate(pop);
    });
  }

  return await query.exec();
}

export async function incrementViews(id) {
  return await Recipe.findByIdAndUpdate(
    id,
    { $inc: { views: 1 } },
    { new: true }
  );
}

export default {
  createRecipe,
  updateRecipe,
  getRecipe,
  deleteRecipe,
  publishRecipe,
  unpublishRecipe,
  rejectRecipe,
  bulkAction,
  listRecipes,
  getAuditLogs,
  findWithPagination,
  findById,
  findOne,
  incrementViews,
  RecipeStatus,
};
