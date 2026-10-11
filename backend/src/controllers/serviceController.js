const models = require("../models");
const { asyncHandler, HttpError } = require("../utils/asyncHandler");
const { saveImage, removeImage } = require("../utils/upload");

const toPositiveInt = (value) => {
  const number = parseInt(value, 10);
  return Number.isInteger(number) && number > 0 ? number : undefined;
};

const findOwnedService = async (req) => {
  const service = await models.service.find(req.params.id);

  if (!service) throw new HttpError(404, "Service introuvable");

  if (service.user_id !== req.auth.id && !req.auth.isAdmin) {
    throw new HttpError(403, "Ce service ne vous appartient pas");
  }

  return service;
};

const assertCategoryExists = async (categoryId) => {
  if (categoryId && !(await models.category.find(categoryId))) {
    throw new HttpError(400, "Catégorie inexistante");
  }
};

const browse = asyncHandler(async (req, res) => {
  const userId = toPositiveInt(req.query.userId);

  res.json(
    await models.service.findAll({
      userId,
      categoryId: toPositiveInt(req.query.categoryId),
      search: req.query.search?.trim() || undefined,
      // Un utilisateur voit aussi ses propres services désactivés
      includeInactive: Boolean(userId && req.auth?.id === userId),
    })
  );
});

const read = asyncHandler(async (req, res) => {
  const service = await models.service.find(req.params.id);

  if (!service || (!service.status && service.user_id !== req.auth?.id)) {
    throw new HttpError(404, "Service introuvable");
  }

  res.json(service);
});

const add = asyncHandler(async (req, res) => {
  const { titre, description, category_id: categoryId } = req.body;

  await assertCategoryExists(categoryId);

  const illustration = req.files?.image ? await saveImage(req.files.image) : null;

  const id = await models.service.insert({
    titre,
    description,
    illustration,
    user_id: req.auth.id,
    category_id: categoryId,
  });

  res
    .status(201)
    .location(`/api/services/${id}`)
    .json(await models.service.find(id));
});

const edit = asyncHandler(async (req, res) => {
  const service = await findOwnedService(req);
  const data = { ...req.body };
  delete data.illustration;

  await assertCategoryExists(data.category_id);

  if (req.files?.image) {
    data.illustration = await saveImage(req.files.image);
  }

  await models.service.update(service.id, data);

  if (data.illustration) await removeImage(service.illustration);

  res.json(await models.service.find(service.id));
});

const destroy = asyncHandler(async (req, res) => {
  const service = await findOwnedService(req);

  await models.service.delete(service.id);
  await removeImage(service.illustration);

  res.sendStatus(204);
});

module.exports = { browse, read, add, edit, destroy };
