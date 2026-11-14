const models = require("../models");
const { asyncHandler, HttpError } = require("../utils/asyncHandler");

const browse = asyncHandler(async (req, res) => {
  res.json(await models.faq.findAll());
});

const add = asyncHandler(async (req, res) => {
  const id = await models.faq.insert(req.body);

  res.status(201).json(await models.faq.find(id));
});

const edit = asyncHandler(async (req, res) => {
  const updated = await models.faq.update(req.params.id, req.body);

  if (!updated) throw new HttpError(404, "Question introuvable");

  res.json(await models.faq.find(req.params.id));
});

const destroy = asyncHandler(async (req, res) => {
  const deleted = await models.faq.delete(req.params.id);

  if (!deleted) throw new HttpError(404, "Question introuvable");

  res.sendStatus(204);
});

module.exports = { browse, add, edit, destroy };
