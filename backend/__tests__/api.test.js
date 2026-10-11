process.env.JWT_SECRET = "test-secret";

jest.mock("../src/models", () => {
  const manager = () => ({
    find: jest.fn(),
    findAll: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  });

  return {
    user: { ...manager(), findByEmailWithPassword: jest.fn() },
    service: manager(),
    category: manager(),
    comment: { ...manager(), findByServiceId: jest.fn(), findWithAuthor: jest.fn() },
    faq: manager(),
    friend: { findFriendsOf: jest.fn(), add: jest.fn(), remove: jest.fn() },
    conversation: {
      ...manager(),
      findForUser: jest.fn(),
      findForUserById: jest.fn(),
      findBetween: jest.fn(),
      touch: jest.fn(),
    },
    message: { ...manager(), findByConversation: jest.fn() },
    contact: manager(),
  };
});

const request = require("supertest");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const models = require("../src/models");
const app = require("../src/app");
const { detectImageExtension } = require("../src/utils/upload");

const tokenFor = (id, isAdmin = false) =>
  `Bearer ${jwt.sign({ sub: String(id), isAdmin }, process.env.JWT_SECRET)}`;

beforeEach(() => jest.clearAllMocks());

describe("Authentification", () => {
  it("refuse un mot de passe incorrect", async () => {
    models.user.findByEmailWithPassword.mockResolvedValue({
      id: 1,
      user_pass: await argon2.hash("Bon-mot-de-passe!"),
      is_admin: false,
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ mail: "a@b.fr", user_pass: "mauvais" });

    expect(res.status).toBe(401);
    expect(res.body.token).toBeUndefined();
  });

  it("renvoie un jeton pour des identifiants valides", async () => {
    models.user.findByEmailWithPassword.mockResolvedValue({
      id: 7,
      user_pass: await argon2.hash("Bon-mot-de-passe!"),
      is_admin: true,
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ mail: "A@B.fr", user_pass: "Bon-mot-de-passe!" });

    expect(res.status).toBe(200);
    expect(models.user.findByEmailWithPassword).toHaveBeenCalledWith("a@b.fr");
    expect(jwt.decode(res.body.token)).toMatchObject({ sub: "7", isAdmin: true });
  });

  it("valide les données d'inscription", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ username: "Al", mail: "pas-un-mail", localisation: "Paris", user_pass: "court" });

    expect(res.status).toBe(400);
    expect(models.user.insert).not.toHaveBeenCalled();
  });

  it("hache le mot de passe à l'inscription", async () => {
    models.user.insert.mockResolvedValue(3);
    models.user.find.mockResolvedValue({ id: 3, username: "Alice" });

    const res = await request(app).post("/api/auth/register").send({
      username: "Alice",
      mail: "alice@example.com",
      localisation: "Paris",
      user_pass: "Secret123!",
    });

    expect(res.status).toBe(201);
    const saved = models.user.insert.mock.calls[0][0];
    expect(saved.user_pass).not.toBe("Secret123!");
    expect(await argon2.verify(saved.user_pass, "Secret123!")).toBe(true);
  });

  it("répond 409 si l'adresse mail est déjà utilisée", async () => {
    models.user.insert.mockRejectedValue(Object.assign(new Error(), { code: "ER_DUP_ENTRY" }));

    const res = await request(app).post("/api/auth/register").send({
      username: "Alice",
      mail: "alice@example.com",
      localisation: "Paris",
      user_pass: "Secret123!",
    });

    expect(res.status).toBe(409);
  });
});

describe("Utilisateurs", () => {
  it("masque l'adresse mail aux autres utilisateurs", async () => {
    models.user.find.mockResolvedValue({
      id: 2,
      username: "Bob",
      mail: "bob@x.fr",
      is_admin: false,
    });

    const res = await request(app).get("/api/users/2").set("Authorization", tokenFor(5));

    expect(res.status).toBe(200);
    expect(res.body.mail).toBeUndefined();
  });

  it("affiche l'adresse mail à son propriétaire", async () => {
    models.user.find.mockResolvedValue({
      id: 2,
      username: "Bob",
      mail: "bob@x.fr",
      is_admin: false,
    });

    const res = await request(app).get("/api/users/2").set("Authorization", tokenFor(2));

    expect(res.body.mail).toBe("bob@x.fr");
  });

  it("interdit de modifier le profil d'un autre utilisateur", async () => {
    const res = await request(app)
      .put("/api/users/2")
      .set("Authorization", tokenFor(5))
      .send({ username: "Pirate" });

    expect(res.status).toBe(403);
    expect(models.user.update).not.toHaveBeenCalled();
  });

  it("exige une authentification pour supprimer un compte", async () => {
    const res = await request(app).delete("/api/users/2");

    expect(res.status).toBe(401);
    expect(models.user.delete).not.toHaveBeenCalled();
  });
});

describe("Services", () => {
  it("interdit de supprimer le service d'un autre utilisateur", async () => {
    models.service.find.mockResolvedValue({ id: 1, user_id: 2, status: true });

    const res = await request(app).delete("/api/services/1").set("Authorization", tokenFor(5));

    expect(res.status).toBe(403);
    expect(models.service.delete).not.toHaveBeenCalled();
  });

  it("permet à l'administrateur de supprimer n'importe quel service", async () => {
    models.service.find.mockResolvedValue({ id: 1, user_id: 2, status: true });
    models.service.delete.mockResolvedValue(true);

    const res = await request(app)
      .delete("/api/services/1")
      .set("Authorization", tokenFor(9, true));

    expect(res.status).toBe(204);
  });

  it("attribue le service à l'utilisateur connecté, pas au corps de la requête", async () => {
    models.category.find.mockResolvedValue({ id: 1 });
    models.service.insert.mockResolvedValue(10);
    models.service.find.mockResolvedValue({ id: 10 });

    const res = await request(app)
      .post("/api/services")
      .set("Authorization", tokenFor(4))
      .send({
        titre: "Cours de guitare",
        description: "Initiation pour débutants",
        category_id: 1,
        user_id: 99,
      });

    expect(res.status).toBe(201);
    expect(models.service.insert.mock.calls[0][0].user_id).toBe(4);
  });

  it("filtre les services par utilisateur et inclut les inactifs pour leur propriétaire", async () => {
    models.service.findAll.mockResolvedValue([]);

    await request(app).get("/api/services?userId=4").set("Authorization", tokenFor(4));

    expect(models.service.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 4, includeInactive: true })
    );
  });

  it("masque un service désactivé aux visiteurs", async () => {
    models.service.find.mockResolvedValue({ id: 1, user_id: 2, status: false });

    const res = await request(app).get("/api/services/1");

    expect(res.status).toBe(404);
  });
});

describe("Administration", () => {
  it("réserve l'ajout de FAQ aux administrateurs", async () => {
    const res = await request(app)
      .post("/api/faq")
      .set("Authorization", tokenFor(2))
      .send({ title: "Question ?", content: "Réponse" });

    expect(res.status).toBe(403);
    expect(models.faq.insert).not.toHaveBeenCalled();
  });

  it("réserve la suppression des catégories aux administrateurs", async () => {
    const res = await request(app).delete("/api/categories/1").set("Authorization", tokenFor(2));

    expect(res.status).toBe(403);
  });
});

describe("Messagerie", () => {
  it("cache les conversations dont on n'est pas participant", async () => {
    models.conversation.find.mockResolvedValue({ id: 1, user_one_id: 2, user_two_id: 3 });

    const res = await request(app)
      .get("/api/conversations/1/messages")
      .set("Authorization", tokenFor(5));

    expect(res.status).toBe(404);
    expect(models.message.findByConversation).not.toHaveBeenCalled();
  });

  it("enregistre un message et met à jour la conversation", async () => {
    models.conversation.find.mockResolvedValue({ id: 1, user_one_id: 2, user_two_id: 3 });
    models.message.insert.mockResolvedValue(12);
    models.message.find.mockResolvedValue({ id: 12, content: "Salut" });

    const res = await request(app)
      .post("/api/conversations/1/messages")
      .set("Authorization", tokenFor(3))
      .send({ content: "  Salut  " });

    expect(res.status).toBe(201);
    expect(models.message.insert).toHaveBeenCalledWith({
      conversation_id: 1,
      sender_id: 3,
      content: "Salut",
    });
    expect(models.conversation.touch).toHaveBeenCalledWith(1, "Salut");
  });

  it("réutilise une conversation existante", async () => {
    models.user.find.mockResolvedValue({ id: 3 });
    models.conversation.findBetween.mockResolvedValue({ id: 8 });
    models.conversation.findForUserById.mockResolvedValue({ id: 8 });

    const res = await request(app)
      .post("/api/conversations")
      .set("Authorization", tokenFor(2))
      .send({ user_id: 3 });

    expect(res.status).toBe(200);
    expect(models.conversation.insert).not.toHaveBeenCalled();
  });
});

describe("Divers", () => {
  it("répond 404 en JSON pour une route inconnue", async () => {
    const res = await request(app).get("/api/inexistant");

    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });

  it("renvoie 500 sans divulguer l'erreur interne", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    models.faq.findAll.mockRejectedValue(new Error("connexion SQL perdue"));

    const res = await request(app).get("/api/faq");

    expect(res.status).toBe(500);
    expect(res.body.error).not.toMatch(/SQL/);
    console.error.mockRestore();
  });
});

describe("Upload", () => {
  it("détecte le format réel d'une image", () => {
    expect(detectImageExtension(Buffer.from("ffd8ffe000104a4649460001", "hex"))).toBe(".jpg");
    expect(detectImageExtension(Buffer.from("89504e470d0a1a0a00000000", "hex"))).toBe(".png");
    expect(detectImageExtension(Buffer.from("RIFF0000WEBPVP8 ", "ascii"))).toBe(".webp");
  });

  it("refuse un fichier qui n'est pas une image", () => {
    expect(detectImageExtension(Buffer.from("<?php echo 'x'; ?>", "ascii"))).toBeNull();
  });
});
