// repositories/media.repo.js
import Media from "../models/Media.js";
import AuditLog from "../models/AuditLog.js";

// Media repository functions
export async function createMedia(data, user, req = null) {
  const media = new Media({
    filename: data.filename,
    originalName: data.originalName,
    mimeType: data.mimeType,
    size: data.size,
    type: data.type,
    url: data.url,
    thumbnailUrl: data.thumbnailUrl,
    alt: data.alt || "",
    tags: data.tags || [],
    uploaderId: user._id || user.id,
    uploaderName: user.name,
    storageType: data.storageType,
    storageKey: data.storageKey,
    metadata: data.metadata || {},
    status: data.status || "ready",
  });

  const saved = await media.save();
  await AuditLog.logAction(
    "create",
    saved._id,
    user,
    {
      filename: saved.filename,
      type: saved.type,
      size: saved.size,
    },
    req
  );

  return saved;
}

export async function updateMedia(id, data, user, req = null) {
  const media = await Media.findById(id);
  if (!media) return null;

  // Only allow updating specific fields
  const allowedFields = ["alt", "tags", "status", "url"];
  const updates = {};

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      updates[field] = data[field];
    }
  });

  Object.assign(media, updates);
  const updated = await media.save();

  await AuditLog.logAction(
    "update",
    id,
    user,
    {
      updates: Object.keys(updates),
      filename: updated.filename,
    },
    req
  );

  return updated;
}

export async function getMedia(id) {
  return await Media.findById(id).populate("uploaderId", "name email");
}

export async function deleteMedia(id, user, req = null) {
  const media = await Media.findById(id);
  if (!media) return null;

  await Media.findByIdAndDelete(id);
  await AuditLog.logAction(
    "delete",
    id,
    user,
    {
      filename: media.filename,
      type: media.type,
      storageType: media.storageType,
      storageKey: media.storageKey,
    },
    req
  );

  return media;
}

// Advanced listing with filtering
export async function listMedia(query) {
  const {
    type,
    search,
    tags,
    uploader,
    status = "ready",
    cursor,
    limit = 20,
    sort = "new",
  } = query;

  let filter = {};

  // Basic filters
  if (status) filter.status = status;
  if (type && ["image", "video"].includes(type)) {
    filter.type = type;
  }
  if (uploader) filter.uploaderId = uploader;

  // Search across filename, original name, and alt text
  if (search) {
    filter.$or = [
      { filename: { $regex: search, $options: "i" } },
      { originalName: { $regex: search, $options: "i" } },
      { alt: { $regex: search, $options: "i" } },
    ];
  }

  // Tag filtering (can be comma-separated)
  if (tags) {
    const tagArray = Array.isArray(tags)
      ? tags
      : tags.split(",").map((t) => t.trim().toLowerCase());
    filter.tags = { $in: tagArray };
  }

  // Cursor pagination
  if (cursor) {
    const sortDirection = sort === "oldest" ? 1 : -1;
    filter._id = sortDirection === -1 ? { $lt: cursor } : { $gt: cursor };
  }

  // Sorting options
  let sortObj = {};
  switch (sort) {
    case "oldest":
      sortObj = { createdAt: 1 };
      break;
    case "name":
      sortObj = { filename: 1 };
      break;
    case "size":
      sortObj = { size: -1 };
      break;
    case "type":
      sortObj = { type: 1, createdAt: -1 };
      break;
    case "usage":
      sortObj = { usageCount: -1, lastUsedAt: -1 };
      break;
    default: // 'new'
      sortObj = { createdAt: -1 };
  }

  const media = await Media.find(filter)
    .sort(sortObj)
    .limit(Number(limit) + 1) // +1 to check if there's more
    .populate("uploaderId", "name email");

  const hasNext = media.length > Number(limit);
  if (hasNext) media.pop();

  return {
    items: media,
    pageInfo: {
      nextCursor: media.length > 0 ? media[media.length - 1]._id : null,
      hasNext,
    },
    total: await Media.countDocuments(filter),
  };
}

// Bulk operations
export async function bulkDeleteMedia(ids, user, req = null) {
  const results = { processed: [], failed: [] };

  for (const id of ids) {
    try {
      const deleted = await deleteMedia(id, user, req);
      if (!deleted) {
        results.failed.push({ id, error: "NOT_FOUND" });
      } else {
        results.processed.push({ id, media: deleted });
      }
    } catch (e) {
      results.failed.push({ id, error: e.message });
    }
  }

  await AuditLog.logAction(
    "bulk_delete",
    null,
    user,
    {
      processed: results.processed.length,
      failed: results.failed.length,
    },
    req
  );

  return results;
}

export async function bulkUpdateTags(ids, tags, user, req = null) {
  const results = { processed: [], failed: [] };

  for (const id of ids) {
    try {
      const updated = await updateMedia(id, { tags }, user, req);
      if (!updated) {
        results.failed.push({ id, error: "NOT_FOUND" });
      } else {
        results.processed.push(id);
      }
    } catch (e) {
      results.failed.push({ id, error: e.message });
    }
  }

  await AuditLog.logAction(
    "bulk_update_tags",
    null,
    user,
    {
      tags,
      processed: results.processed.length,
    },
    req
  );

  return results;
}

// Media usage tracking
export async function incrementMediaUsage(id) {
  const media = await Media.findById(id);
  if (media) {
    return media.incrementUsage();
  }
  return null;
}

// Media statistics
export async function getMediaStats(query = {}) {
  const { uploader, dateFrom, dateTo } = query;

  let matchStage = {};
  if (uploader) matchStage.uploaderId = uploader;
  if (dateFrom || dateTo) {
    matchStage.createdAt = {};
    if (dateFrom) matchStage.createdAt.$gte = new Date(dateFrom);
    if (dateTo) matchStage.createdAt.$lte = new Date(dateTo);
  }

  const stats = await Media.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
        totalSize: { $sum: "$size" },
        avgSize: { $avg: "$size" },
        maxSize: { $max: "$size" },
        minSize: { $min: "$size" },
      },
    },
  ]);

  // Get overall stats
  const overallStats = await Media.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalCount: { $sum: 1 },
        totalSize: { $sum: "$size" },
        avgUsage: { $avg: "$usageCount" },
      },
    },
  ]);

  const result = {
    total: overallStats[0]?.totalCount || 0,
    totalSize: overallStats[0]?.totalSize || 0,
    avgUsage: Math.round(overallStats[0]?.avgUsage || 0),
    byType: {},
  };

  stats.forEach((stat) => {
    result.byType[stat._id] = {
      count: stat.count,
      totalSize: stat.totalSize,
      avgSize: Math.round(stat.avgSize),
      maxSize: stat.maxSize,
      minSize: stat.minSize,
    };
  });

  return result;
}

// Cleanup functions
export async function cleanupFailedUploads(olderThanHours = 24) {
  const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);

  const result = await Media.deleteMany({
    status: { $in: ["uploading", "failed"] },
    createdAt: { $lt: cutoff },
  });

  return { deleted: result.deletedCount };
}

export async function findUnusedMedia(olderThanDays = 30) {
  const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);

  return await Media.find({
    usageCount: 0,
    createdAt: { $lt: cutoff },
  }).select("_id filename type size createdAt");
}

export default {
  createMedia,
  updateMedia,
  getMedia,
  deleteMedia,
  listMedia,
  bulkDeleteMedia,
  bulkUpdateTags,
  incrementMediaUsage,
  getMediaStats,
  cleanupFailedUploads,
  findUnusedMedia,
};
