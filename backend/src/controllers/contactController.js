const models = require("../models");
const { asyncHandler } = require("../utils/asyncHandler");

const add = asyncHandler(async (req, res) => {
  const { email, subject, message } = req.body;

  await models.contact.insert({ email, subject, message });

  res.status(201).json({ message: "Votre message a bien été envoyé" });
});

module.exports = { add };
