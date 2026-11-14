const models = require("../models");
const ConversationManager = require("../models/ConversationManager");
const { asyncHandler, HttpError } = require("../utils/asyncHandler");

const findOwnConversation = async (req) => {
  const conversation = await models.conversation.find(req.params.id);

  if (!conversation || !ConversationManager.isParticipant(conversation, req.auth.id)) {
    throw new HttpError(404, "Conversation introuvable");
  }

  return conversation;
};

const browse = asyncHandler(async (req, res) => {
  res.json(await models.conversation.findForUser(req.auth.id));
});

/** Renvoie la conversation existante avec cet utilisateur ou en crée une. */
const open = asyncHandler(async (req, res) => {
  const otherId = req.body.user_id;

  if (otherId === req.auth.id) {
    throw new HttpError(400, "Vous ne pouvez pas vous écrire à vous-même");
  }

  if (!(await models.user.find(otherId))) {
    throw new HttpError(404, "Utilisateur introuvable");
  }

  const existing = await models.conversation.findBetween(req.auth.id, otherId);
  const id = existing?.id ?? (await models.conversation.insert(req.auth.id, otherId));

  res.status(existing ? 200 : 201).json(await models.conversation.findForUserById(req.auth.id, id));
});

const destroy = asyncHandler(async (req, res) => {
  const conversation = await findOwnConversation(req);

  await models.conversation.delete(conversation.id);

  res.sendStatus(204);
});

const browseMessages = asyncHandler(async (req, res) => {
  const conversation = await findOwnConversation(req);

  res.json(await models.message.findByConversation(conversation.id));
});

const addMessage = asyncHandler(async (req, res) => {
  const conversation = await findOwnConversation(req);
  const { content } = req.body;

  const id = await models.message.insert({
    conversation_id: conversation.id,
    sender_id: req.auth.id,
    content,
  });
  await models.conversation.touch(conversation.id, content);

  res.status(201).json(await models.message.find(id));
});

module.exports = { browse, open, destroy, browseMessages, addMessage };
