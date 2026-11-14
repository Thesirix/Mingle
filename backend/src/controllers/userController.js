const argon2 = require("argon2");
const models = require("../models");
const { asyncHandler, HttpError } = require("../utils/asyncHandler");
const { saveImage, removeImage } = require("../utils/upload");

const canManage = (req, userId) => req.auth.id === userId || req.auth.isAdmin;

const browse = asyncHandler(async (req, res) => {
  const search = req.query.search?.trim();
  res.json(await models.user.findAll({ search: search || undefined }));
});

const read = asyncHandler(async (req, res) => {
  const user = await models.user.find(req.params.id);

  if (!user) throw new HttpError(404, "Utilisateur introuvable");

  // L'adresse mail n'est visible que par son propriétaire
  if (!req.auth || !canManage(req, user.id)) {
    delete user.mail;
    delete user.is_admin;
  }

  res.json(user);
});

const edit = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!canManage(req, id)) {
    throw new HttpError(403, "Vous ne pouvez modifier que votre propre profil");
  }

  const existing = await models.user.find(id);
  if (!existing) throw new HttpError(404, "Utilisateur introuvable");

  const data = { ...req.body };
  delete data.avatar;

  if (data.mail) data.mail = data.mail.toLowerCase();

  if (data.user_pass) {
    data.user_pass = await argon2.hash(data.user_pass);
  } else {
    delete data.user_pass;
  }

  if (req.files?.avatar) {
    data.avatar = await saveImage(req.files.avatar);
  }

  await models.user.update(id, data);

  if (data.avatar) await removeImage(existing.avatar);

  res.json(await models.user.find(id));
});

const destroy = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!canManage(req, id)) {
    throw new HttpError(403, "Vous ne pouvez supprimer que votre propre profil");
  }

  const existing = await models.user.find(id);
  if (!existing) throw new HttpError(404, "Utilisateur introuvable");

  await models.user.delete(id);
  await removeImage(existing.avatar);

  res.sendStatus(204);
});

module.exports = { browse, read, edit, destroy };
