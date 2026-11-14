const express = require("express");
const { body } = require("express-validator");

const { requireAuth, optionalAuth, requireAdmin } = require("./middlewares/auth");
const v = require("./middlewares/validators");

const auth = require("./controllers/authController");
const users = require("./controllers/userController");
const services = require("./controllers/serviceController");
const categories = require("./controllers/categoryController");
const comments = require("./controllers/commentController");
const faq = require("./controllers/faqController");
const friends = require("./controllers/friendController");
const conversations = require("./controllers/conversationController");
const contact = require("./controllers/contactController");

const router = express.Router();

const withId = v.validate(v.idParam());
const userIdBody = (field) =>
  v.validate(body(field).isInt({ min: 1 }).withMessage("Utilisateur invalide").toInt());

// Authentification
router.post("/auth/register", v.validateRegister, auth.register);
router.post("/auth/login", v.validateLogin, auth.login);
router.get("/auth/me", requireAuth, auth.me);

// Utilisateurs
router.get("/users", users.browse);
router.get("/users/:id", withId, optionalAuth, users.read);
router.put("/users/:id", requireAuth, v.validateUserUpdate, users.edit);
router.delete("/users/:id", requireAuth, withId, users.destroy);

// Catégories (écriture réservée aux administrateurs)
router.get("/categories", categories.browse);
router.get("/categories/:id", withId, categories.read);
router.post("/categories", requireAuth, requireAdmin, v.validateCategory, categories.add);
router.put(
  "/categories/:id",
  requireAuth,
  requireAdmin,
  withId,
  v.validateCategory,
  categories.edit
);
router.delete("/categories/:id", requireAuth, requireAdmin, withId, categories.destroy);

// Services
router.get("/services", optionalAuth, services.browse);
router.get("/services/:id", withId, optionalAuth, services.read);
router.post("/services", requireAuth, v.validateServiceCreate, services.add);
router.put("/services/:id", requireAuth, v.validateServiceUpdate, services.edit);
router.delete("/services/:id", requireAuth, withId, services.destroy);

// Commentaires
router.get("/services/:id/comments", withId, comments.browseByService);
router.post("/services/:id/comments", requireAuth, withId, v.validateComment, comments.add);
router.put("/comments/:id", requireAuth, withId, v.validateComment, comments.edit);
router.delete("/comments/:id", requireAuth, withId, comments.destroy);

// FAQ (écriture réservée aux administrateurs)
router.get("/faq", faq.browse);
router.post("/faq", requireAuth, requireAdmin, v.validateFaq, faq.add);
router.put("/faq/:id", requireAuth, requireAdmin, withId, v.validateFaq, faq.edit);
router.delete("/faq/:id", requireAuth, requireAdmin, withId, faq.destroy);

// Amis
router.get("/friends", requireAuth, friends.browse);
router.post("/friends", requireAuth, userIdBody("friend_id"), friends.add);
router.delete("/friends/:id", requireAuth, withId, friends.destroy);

// Messagerie
router.get("/conversations", requireAuth, conversations.browse);
router.post("/conversations", requireAuth, userIdBody("user_id"), conversations.open);
router.delete("/conversations/:id", requireAuth, withId, conversations.destroy);
router.get("/conversations/:id/messages", requireAuth, withId, conversations.browseMessages);
router.post(
  "/conversations/:id/messages",
  requireAuth,
  v.validateMessage,
  conversations.addMessage
);

// Formulaire de contact
router.post("/contact", v.validateContact, contact.add);

module.exports = router;
