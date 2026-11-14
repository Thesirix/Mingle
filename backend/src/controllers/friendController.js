const models = require("../models");
const { asyncHandler, HttpError } = require("../utils/asyncHandler");

const browse = asyncHandler(async (req, res) => {
  res.json(await models.friend.findFriendsOf(req.auth.id));
});

const add = asyncHandler(async (req, res) => {
  const friendId = req.body.friend_id;

  if (friendId === req.auth.id) {
    throw new HttpError(400, "Vous ne pouvez pas vous ajouter vous-même");
  }

  if (!(await models.user.find(friendId))) {
    throw new HttpError(404, "Utilisateur introuvable");
  }

  await models.friend.add(req.auth.id, friendId);

  res.status(201).json(await models.friend.findFriendsOf(req.auth.id));
});

const destroy = asyncHandler(async (req, res) => {
  const removed = await models.friend.remove(req.auth.id, req.params.id);

  if (!removed) throw new HttpError(404, "Cet utilisateur n'est pas dans vos amis");

  res.sendStatus(204);
});

module.exports = { browse, add, destroy };
