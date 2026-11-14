const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const models = require("../models");
const { asyncHandler, HttpError } = require("../utils/asyncHandler");

const expiresIn = () => {
  const value = process.env.JWT_EXPIRES_IN ?? "7d";
  return /^\d+$/.test(value) ? Number(value) : value;
};

const signToken = (user) =>
  jwt.sign({ sub: String(user.id), isAdmin: Boolean(user.is_admin) }, process.env.JWT_SECRET, {
    expiresIn: expiresIn(),
  });

const register = asyncHandler(async (req, res) => {
  const { username, mail, localisation, user_pass: password } = req.body;

  const id = await models.user.insert({
    username,
    mail: mail.toLowerCase(),
    localisation,
    user_pass: await argon2.hash(password),
  });

  res
    .status(201)
    .location(`/api/users/${id}`)
    .json(await models.user.find(id));
});

const login = asyncHandler(async (req, res) => {
  const user = await models.user.findByEmailWithPassword(req.body.mail.toLowerCase());

  const isValid = user && (await argon2.verify(user.user_pass, req.body.user_pass));

  if (!isValid) {
    throw new HttpError(401, "Email ou mot de passe incorrect");
  }

  res.json({ token: signToken(user), userId: user.id });
});

const me = asyncHandler(async (req, res) => {
  const user = await models.user.find(req.auth.id);

  if (!user) throw new HttpError(404, "Utilisateur introuvable");

  res.json(user);
});

module.exports = { register, login, me };
