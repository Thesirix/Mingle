const models = require("../models");
const { asyncHandler, HttpError } = require("../utils/asyncHandler");

const browse = asyncHandler(async (req, res) => {
  res.json(await models.category.findAll());
});

const read = asyncHandler(async (req, res) => {
  const category = await models.category.find(req.params.id);

  if (!category) throw new HttpError(404, "Catégorie introuvable");

  res.json(category);
});

const add = asyncHandler(async (req, res) => {
  const id = await models.category.insert(req.body);

  res
    .status(201)
    .location(`/api/categories/${id}`)
    .json(await models.category.find(id));
});

const edit = asyncHandler(async (req, res) => {
  const updated = await models.category.update(req.params.id, req.body);

  if (!updated) throw new HttpError(404, "Catégorie introuvable");

  res.json(await models.category.find(req.params.id));
});

const destroy = asyncHandler(async (req, res) => {
  const deleted = await models.category.delete(req.params.id);

  if (!deleted) throw new HttpError(404, "Catégorie introuvable");

  res.sendStatus(204);
});

module.exports = { browse, read, add, edit, destroy };
