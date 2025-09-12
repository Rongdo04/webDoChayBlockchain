// controllers/admin/recipesController.js
import {
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
} from "../../repositories/recipes.repo.js";

function notFound(id) {
  const e = new Error("Recipe not found");
  e.status = 404;
  e.code = "RECIPE_NOT_FOUND";
  e.details = { id };
  return e;
}

export const list = async (req, res) => {
  const result = await listRecipes(req.query);
  res.json(result);
};

export const getOne = async (req, res, next) => {
  const recipe = await getRecipe(req.params.id);
  if (!recipe) return next(notFound(req.params.id));
  res.json(recipe);
};

export const create = async (req, res) => {
  const recipe = await createRecipe(
    req.body,
    req.user._id || req.user.id,
    req.user,
    req
  );
  res.status(201).json(recipe);
};

export const update = async (req, res, next) => {
  const recipe = await updateRecipe(req.params.id, req.body, req.user, req);
  if (!recipe) return next(notFound(req.params.id));
  res.json(recipe);
};

export const remove = async (req, res, next) => {
  const ok = await deleteRecipe(req.params.id, req.user, req);
  if (!ok) return next(notFound(req.params.id));
  res.status(204).end();
};

export const publish = async (req, res, next) => {
  const recipe = await publishRecipe(
    req.params.id,
    req.body.publishAt,
    req.user,
    req
  );
  if (!recipe) return next(notFound(req.params.id));
  res.json(recipe);
};

export const unpublish = async (req, res, next) => {
  const recipe = await unpublishRecipe(req.params.id, req.user, req);
  if (!recipe) return next(notFound(req.params.id));
  res.json(recipe);
};

export const reject = async (req, res, next) => {
  const recipe = await rejectRecipe(
    req.params.id,
    req.user,
    req.body.reason,
    req
  );
  if (!recipe) return next(notFound(req.params.id));
  res.json(recipe);
};

export const bulk = async (req, res) => {
  const result = await bulkAction(req.body.ids, req.body.action, req.user, req);
  res.json(result);
};

export const auditLogs = async (req, res) => {
  const result = await getAuditLogs(req.query);
  res.json(result);
};

export default {
  list,
  getOne,
  create,
  update,
  remove,
  publish,
  unpublish,
  reject,
  bulk,
  auditLogs,
};
