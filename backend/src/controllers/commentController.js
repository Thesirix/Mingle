const models = require("../models");
const { asyncHandler, HttpError } = require("../utils/asyncHandler");

const browseByService = asyncHandler(async (req, res) => {
  res.json(await models.comment.findByServiceId(req.params.id));
});

const add = asyncHandler(async (req, res) => {
  const service = await models.service.find(req.params.id);

  if (!service) throw new HttpError(404, "Service introuvable");

  const id = await models.comment.insert({
    service_id: service.id,
    user_id: req.auth.id,
    content: req.body.content,
  });

  res.status(201).json(await models.comment.findWithAuthor(id));
});

const edit = asyncHandler(async (req, res) => {
  const comment = await models.comment.find(req.params.id);

  if (!comment) throw new HttpError(404, "Commentaire introuvable");

  if (comment.user_id !== req.auth.id) {
    throw new HttpError(403, "Vous ne pouvez modifier que vos commentaires");
  }

  await models.comment.update(comment.id, { content: req.body.content });

  res.json(await models.comment.findWithAuthor(comment.id));
});

const destroy = asyncHandler(async (req, res) => {
  const comment = await models.comment.find(req.params.id);

  if (!comment) throw new HttpError(404, "Commentaire introuvable");

  if (comment.user_id !== req.auth.id && !req.auth.isAdmin) {
    throw new HttpError(403, "Vous ne pouvez supprimer que vos commentaires");
  }

  await models.comment.delete(comment.id);

  res.sendStatus(204);
});

module.exports = { browseByService, add, edit, destroy };
