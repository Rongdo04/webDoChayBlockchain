// repositories/taxonomy.repo.js
import Taxonomy from "../models/Taxonomy.js";
import AuditLog from "../models/AuditLog.js";

// Helper to generate unique slug
async function generateUniqueSlug(baseSlug, type) {
  let slug = baseSlug;
  let counter = 2;
  while (await Taxonomy.findOne({ slug, type })) {
    slug = `${baseSlug}-${counter++}`;
  }
  return slug;
}

// Basic slugify function
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

// Normalize name (trim and basic cleanup)
function normalizeName(name) {
  return name.trim().replace(/\s+/g, " ");
}

// Create taxonomy item
export async function createTaxonomy(data, type, user, req = null) {
  const normalizedName = normalizeName(data.name);

  // Check for existing name
  const existing = await Taxonomy.findByNameAndType(normalizedName, type);
  if (existing) {
    const error = new Error(`${type} with this name already exists`);
    error.status = 409;
    error.code = "TAXONOMY_DUPLICATE";
    error.details = { name: normalizedName, type };
    throw error;
  }

  const baseSlug = data.slug ? slugify(data.slug) : slugify(normalizedName);
  const uniqueSlug = await generateUniqueSlug(baseSlug, type);

  const taxonomy = new Taxonomy({
    name: normalizedName,
    type,
    slug: uniqueSlug,
    description: data.description || "",
    isActive: data.isActive !== undefined ? data.isActive : true,
  });

  const saved = await taxonomy.save();

  // Log audit
  await AuditLog.create({
    action: "create",
    entityType: "system",
    entityId: saved._id,
    userId: user._id || user.id,
    userEmail: user.email,
    userRole: user.role,
    metadata: {
      type,
      name: saved.name,
      slug: saved.slug,
    },
    ipAddress: req?.ip || req?.connection?.remoteAddress,
    userAgent: req?.get?.("User-Agent"),
  });

  return saved;
}

// Update taxonomy item
export async function updateTaxonomy(id, data, user, req = null) {
  const taxonomy = await Taxonomy.findById(id);
  if (!taxonomy) return null;

  const updateData = {};

  // Handle name update with duplicate check
  if (data.name !== undefined) {
    const normalizedName = normalizeName(data.name);
    if (normalizedName !== taxonomy.name) {
      const existing = await Taxonomy.findByNameAndType(
        normalizedName,
        taxonomy.type
      );
      if (existing && existing._id.toString() !== id) {
        const error = new Error(
          `${taxonomy.type} with this name already exists`
        );
        error.status = 409;
        error.code = "TAXONOMY_DUPLICATE";
        error.details = { name: normalizedName, type: taxonomy.type };
        throw error;
      }
      updateData.name = normalizedName;

      // Update slug if name changed
      const baseSlug = slugify(normalizedName);
      updateData.slug = await generateUniqueSlug(baseSlug, taxonomy.type);
    }
  }

  // Handle other fields
  if (data.description !== undefined)
    updateData.description = data.description.trim();
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  // Apply updates
  Object.assign(taxonomy, updateData);
  const updated = await taxonomy.save();

  // Log audit
  await AuditLog.create({
    action: "update",
    entityType: "system",
    entityId: id,
    userId: user._id || user.id,
    userEmail: user.email,
    userRole: user.role,
    metadata: {
      type: taxonomy.type,
      changes: updateData,
    },
    ipAddress: req?.ip || req?.connection?.remoteAddress,
    userAgent: req?.get?.("User-Agent"),
  });

  return updated;
}

// Get single taxonomy item
export async function getTaxonomy(id) {
  return await Taxonomy.findById(id);
}

// Delete taxonomy item
export async function deleteTaxonomy(id, user, req = null) {
  const taxonomy = await Taxonomy.findById(id);
  if (!taxonomy) return false;

  await Taxonomy.findByIdAndDelete(id);

  // Log audit
  await AuditLog.create({
    action: "delete",
    entityType: "system",
    entityId: id,
    userId: user._id || user.id,
    userEmail: user.email,
    userRole: user.role,
    metadata: {
      type: taxonomy.type,
      name: taxonomy.name,
      usageCount: taxonomy.usageCount,
    },
    ipAddress: req?.ip || req?.connection?.remoteAddress,
    userAgent: req?.get?.("User-Agent"),
  });

  return true;
}

// List taxonomy items by type
export async function listTaxonomy(type, query = {}) {
  const { search, active, sort = "name", limit = 50, cursor } = query;

  let filter = { type };

  // Apply filters
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { slug: { $regex: search, $options: "i" } },
    ];
  }

  if (active !== undefined) {
    filter.isActive = active === "true";
  }

  // Sorting
  let sortObj = {};
  if (sort === "usage") {
    sortObj = { usageCount: -1, name: 1 };
  } else if (sort === "date") {
    sortObj = { createdAt: -1 };
  } else {
    sortObj = { name: 1 }; // default: alphabetical
  }

  // Cursor pagination
  if (cursor) {
    const isDescending = Object.values(sortObj).some((val) => val === -1);
    filter._id = isDescending ? { $lt: cursor } : { $gt: cursor };
  }

  const items = await Taxonomy.find(filter)
    .sort(sortObj)
    .limit(Number(limit) + 1);

  const hasNext = items.length > Number(limit);
  if (hasNext) items.pop();

  return {
    items,
    pageInfo: {
      nextCursor: items.length > 0 ? items[items.length - 1]._id : null,
      hasNext,
    },
    total: await Taxonomy.countDocuments({ type }),
  };
}

// Merge taxonomy items (merge fromIds into toId)
export async function mergeTaxonomy(fromIds, toId, user, req = null) {
  const targetTaxonomy = await Taxonomy.findById(toId);
  if (!targetTaxonomy) {
    const error = new Error("Target taxonomy not found");
    error.status = 404;
    error.code = "TAXONOMY_NOT_FOUND";
    throw error;
  }

  const sourceTaxonomies = await Taxonomy.find({
    _id: { $in: fromIds },
    type: targetTaxonomy.type,
  });

  if (sourceTaxonomies.length !== fromIds.length) {
    const error = new Error(
      "Some source taxonomies not found or type mismatch"
    );
    error.status = 400;
    error.code = "TAXONOMY_MERGE_ERROR";
    throw error;
  }

  // Calculate total usage count
  const totalUsage = sourceTaxonomies.reduce(
    (sum, item) => sum + item.usageCount,
    0
  );

  // Update target usage count
  targetTaxonomy.usageCount += totalUsage;
  await targetTaxonomy.save();

  // Delete source taxonomies
  await Taxonomy.deleteMany({ _id: { $in: fromIds } });

  // Log audit for merge operation (using 'update' action since 'merge' not in enum)
  await AuditLog.create({
    action: "update",
    entityType: "system", // Use 'system' since 'taxonomy' not in enum
    entityId: toId,
    userId: user._id || user.id,
    userEmail: user.email,
    userRole: user.role,
    metadata: {
      type: targetTaxonomy.type,
      operation: "merge",
      fromIds,
      fromNames: sourceTaxonomies.map((t) => t.name),
      toName: targetTaxonomy.name,
      totalUsage,
    },
    ipAddress: req?.ip || req?.connection?.remoteAddress,
    userAgent: req?.get?.("User-Agent"),
  });

  return {
    target: targetTaxonomy,
    merged: sourceTaxonomies.length,
    totalUsage,
  };
}

// Get taxonomy statistics
export async function getTaxonomyStats(type) {
  const total = await Taxonomy.countDocuments({ type });
  const active = await Taxonomy.countDocuments({ type, isActive: true });
  const totalUsage = await Taxonomy.aggregate([
    { $match: { type } },
    { $group: { _id: null, total: { $sum: "$usageCount" } } },
  ]);

  return {
    total,
    active,
    inactive: total - active,
    totalUsage: totalUsage[0]?.total || 0,
  };
}

// Search functions for public suggest API
export async function searchCategories(searchTerm, limit = 10) {
  return await Taxonomy.find({
    type: "category",
    isActive: true,
    $or: [
      { name: { $regex: searchTerm, $options: "i" } },
      { slug: { $regex: searchTerm, $options: "i" } },
    ],
  })
    .sort({ usageCount: -1, name: 1 })
    .limit(limit)
    .select("name slug");
}

export async function searchTags(searchTerm, limit = 10) {
  return await Taxonomy.find({
    type: "tag",
    isActive: true,
    $or: [
      { name: { $regex: searchTerm, $options: "i" } },
      { slug: { $regex: searchTerm, $options: "i" } },
    ],
  })
    .sort({ usageCount: -1, name: 1 })
    .limit(limit)
    .select("name slug");
}

// Public API methods
export async function findCategories(filters = {}, options = {}) {
  const { limit, sort = { usageCount: -1, name: 1 } } = options;

  let query = Taxonomy.find({ ...filters, type: "category" });

  if (sort) query = query.sort(sort);
  if (limit) query = query.limit(limit);

  return await query.exec();
}

export async function findTags(filters = {}, options = {}) {
  const { limit, sort = { usageCount: -1, name: 1 } } = options;

  let query = Taxonomy.find({ ...filters, type: "tag" });

  if (sort) query = query.sort(sort);
  if (limit) query = query.limit(limit);

  return await query.exec();
}

export default {
  createTaxonomy,
  updateTaxonomy,
  getTaxonomy,
  deleteTaxonomy,
  listTaxonomy,
  mergeTaxonomy,
  getTaxonomyStats,
  searchCategories,
  searchTags,
  findCategories,
  findTags,
};
