// controllers/admin/taxonomy.controller.js
import {
  createTaxonomy,
  updateTaxonomy,
  getTaxonomy,
  deleteTaxonomy,
  listTaxonomy,
  mergeTaxonomy,
  getTaxonomyStats,
} from "../../repositories/taxonomy.repo.js";

function notFound(id, type) {
  const error = new Error(`${type} not found`);
  error.status = 404;
  error.code = "TAXONOMY_NOT_FOUND";
  error.details = { id, type };
  return error;
}

// Generic controller for both categories and tags
function createTypeController(type) {
  return {
    // List items
    list: async (req, res) => {
      const result = await listTaxonomy(type, req.query);
      res.json(result);
    },

    // Get single item
    getOne: async (req, res, next) => {
      const item = await getTaxonomy(req.params.id);
      if (!item || item.type !== type) {
        return next(notFound(req.params.id, type));
      }
      res.json(item);
    },

    // Create new item
    create: async (req, res) => {
      const item = await createTaxonomy(req.body, type, req.user, req);
      res.status(201).json(item);
    },

    // Update item
    update: async (req, res, next) => {
      const item = await updateTaxonomy(req.params.id, req.body, req.user, req);
      if (!item) {
        return next(notFound(req.params.id, type));
      }
      res.json(item);
    },

    // Delete item
    remove: async (req, res, next) => {
      const deleted = await deleteTaxonomy(req.params.id, req.user, req);
      if (!deleted) {
        return next(notFound(req.params.id, type));
      }
      res.status(204).end();
    },

    // Get statistics
    stats: async (req, res) => {
      const stats = await getTaxonomyStats(type);
      res.json(stats);
    },
  };
}

// Create controllers for categories and tags
export const categories = createTypeController("category");
export const tags = createTypeController("tag");

// Merge controller (works for both types)
export const merge = async (req, res) => {
  const result = await mergeTaxonomy(
    req.body.fromIds,
    req.body.toId,
    req.user,
    req
  );
  res.json(result);
};

export default {
  categories,
  tags,
  merge,
};
