const { body, param, validationResult } = require("express-validator");

const SPECIAL_CHAR = /[!@#$%^&*(),.?":{}|<>]/;

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: errors.array()[0].msg,
      errors: errors.array(),
    });
  }

  return next();
};

const validate = (...rules) => [...rules, handleValidation];

const idParam = (name = "id") =>
  param(name).isInt({ min: 1 }).withMessage("Identifiant invalide").toInt();

const password = (field) =>
  body(field)
    .isLength({ min: 8 })
    .withMessage("Le mot de passe doit comporter au moins 8 caractères")
    .matches(SPECIAL_CHAR)
    .withMessage("Le mot de passe doit comporter au moins 1 caractère spécial");

const validateRegister = validate(
  body("username")
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Le nom d'utilisateur doit comporter entre 3 et 100 caractères"),
  body("mail").trim().isEmail().withMessage("Adresse mail invalide"),
  body("localisation")
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage("La ville doit comporter au moins 2 caractères"),
  password("user_pass")
);

const validateLogin = validate(
  body("mail").trim().isEmail().withMessage("Adresse mail invalide"),
  body("user_pass").notEmpty().withMessage("Mot de passe requis")
);

const validateUserUpdate = validate(
  idParam(),
  body("username")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Le nom d'utilisateur doit comporter entre 3 et 100 caractères"),
  body("mail").optional().trim().isEmail().withMessage("Adresse mail invalide"),
  body("localisation")
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage("La ville doit comporter au moins 2 caractères"),
  body("biographie")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("La biographie ne doit pas dépasser 2000 caractères"),
  body("service_type")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Les services proposés ne doivent pas dépasser 255 caractères"),
  body("user_pass")
    .optional({ values: "falsy" })
    .custom((value) => {
      if (value.length < 8 || !SPECIAL_CHAR.test(value)) {
        throw new Error(
          "Le mot de passe doit comporter au moins 8 caractères dont 1 caractère spécial"
        );
      }
      return true;
    })
);

const serviceRules = (optional) => {
  const field = (name) => (optional ? body(name).optional() : body(name));

  return [
    field("titre")
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage("Le titre doit comporter entre 3 et 100 caractères"),
    field("description")
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage("La description doit comporter entre 10 et 1000 caractères"),
    field("category_id").isInt({ min: 1 }).withMessage("Catégorie invalide").toInt(),
    body("status").optional().isBoolean().withMessage("Statut invalide").toBoolean(),
  ];
};

const validateServiceCreate = validate(...serviceRules(false));
const validateServiceUpdate = validate(idParam(), ...serviceRules(true));

const validateCategory = validate(
  body("titre")
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage("Le titre doit comporter entre 2 et 150 caractères"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("La description ne doit pas dépasser 500 caractères"),
  body("category_image")
    .optional({ values: "falsy" })
    .trim()
    .custom((value) => value.startsWith("/uploads/") || /^https?:\/\/\S+$/.test(value))
    .withMessage("L'image doit être une URL valide")
);

const validateComment = validate(
  body("content")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Le commentaire doit comporter entre 1 et 1000 caractères")
);

const validateFaq = validate(
  body("title")
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage("La question doit comporter entre 3 et 150 caractères"),
  body("content")
    .trim()
    .isLength({ min: 3 })
    .withMessage("La réponse doit comporter au moins 3 caractères")
);

const validateMessage = validate(
  idParam(),
  body("content")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Le message doit comporter entre 1 et 1000 caractères")
);

const validateContact = validate(
  body("email").trim().isEmail().withMessage("Adresse mail invalide"),
  body("subject")
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage("L'objet doit comporter entre 3 et 150 caractères"),
  body("message")
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage("Le message doit comporter au moins 10 caractères")
);

module.exports = {
  validate,
  idParam,
  validateRegister,
  validateLogin,
  validateUserUpdate,
  validateServiceCreate,
  validateServiceUpdate,
  validateCategory,
  validateComment,
  validateFaq,
  validateMessage,
  validateContact,
};
