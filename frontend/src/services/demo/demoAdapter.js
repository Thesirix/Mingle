// Backend simulé pour la démo statique (GitHub Pages).
// Il remplace l'adaptateur HTTP d'axios et reproduit les routes de backend/src/router.js.
// Les données vivent dans le localStorage du visiteur.
import { AxiosError } from "axios";
import createSeed from "./seed";

const STORAGE_KEY = "mingle_demo_db_v1";
const TOKEN_TTL = 7 * 24 * 3600;

/* ------------------------------------------------------------------ stockage */

const load = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.users) return saved;
  } catch {
    // stockage indisponible ou corrompu : on repart du jeu de démo
  }
  return createSeed();
};

let db = load();

const save = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // quota dépassé ou navigation privée : les données restent en mémoire
  }
};

export const resetDemo = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // rien à faire
  }
  db = createSeed();
};

const now = () => new Date().toISOString();
const nextId = (rows) => rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;

/* --------------------------------------------------------------- jeton (JWT) */

const base64Url = (value) =>
  btoa(JSON.stringify(value)).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");

const signToken = (user) =>
  [
    base64Url({ alg: "none", typ: "JWT" }),
    base64Url({
      sub: String(user.id),
      isAdmin: Boolean(user.is_admin),
      exp: Math.floor(Date.now() / 1000) + TOKEN_TTL,
    }),
    "demo",
  ].join(".");

const readAuth = (headers) => {
  const header = headers?.get?.("Authorization") ?? headers?.Authorization;
  const token = typeof header === "string" ? header.replace(/^Bearer\s+/, "") : null;
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    const user = db.users.find((row) => row.id === Number(payload.sub));
    if (!user || payload.exp * 1000 < Date.now()) return null;
    return { id: user.id, isAdmin: Boolean(user.is_admin) };
  } catch {
    return null;
  }
};

/* ------------------------------------------------------------------- erreurs */

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const requireAuth = (auth) => {
  if (!auth) throw new HttpError(401, "Authentification requise");
  return auth;
};

const requireAdmin = (auth) => {
  requireAuth(auth);
  if (!auth.isAdmin) throw new HttpError(403, "Accès réservé aux administrateurs");
  return auth;
};

/* --------------------------------------------------------------- projections */

const profileOf = (user) => {
  if (!user) return null;
  const { user_pass: password, ...profile } = user;
  return { ...profile };
};

const summaryOf = ({ id, username, localisation, avatar }) => ({
  id,
  username,
  localisation,
  avatar,
});

const userById = (id) => db.users.find((user) => user.id === Number(id));

const serviceView = (service) => {
  const author = userById(service.user_id);
  const category = db.categories.find((row) => row.id === service.category_id);
  return {
    id: service.id,
    titre: service.titre,
    description: service.description,
    illustration: service.illustration,
    status: service.status,
    created_at: service.created_at,
    user_id: service.user_id,
    username: author?.username,
    avatar: author?.avatar ?? null,
    localisation: author?.localisation,
    category_id: service.category_id,
    category_titre: category?.titre ?? null,
    comment_count: db.comments.filter((comment) => comment.service_id === service.id).length,
  };
};

const categoryView = (category) => ({
  ...category,
  service_count: db.services.filter(
    (service) => service.category_id === category.id && service.status
  ).length,
});

const commentView = (comment) => {
  const author = userById(comment.user_id);
  return { ...comment, username: author?.username, avatar: author?.avatar ?? null };
};

const conversationsFor = (userId) =>
  db.conversations
    .filter((row) => row.user_one_id === userId || row.user_two_id === userId)
    .map((row) => {
      const other = userById(row.user_one_id === userId ? row.user_two_id : row.user_one_id);
      return {
        id: row.id,
        last_message: row.last_message,
        last_message_time: row.last_message_time,
        created_at: row.created_at,
        other_id: other?.id,
        other_username: other?.username,
        other_avatar: other?.avatar ?? null,
      };
    })
    .sort((a, b) =>
      (b.last_message_time ?? b.created_at).localeCompare(a.last_message_time ?? a.created_at)
    );

const friendsOf = (userId) =>
  db.friends
    .filter((row) => row.user_id === userId)
    .map((row) => userById(row.friend_id))
    .filter(Boolean)
    .map(summaryOf)
    .sort((a, b) => a.username.localeCompare(b.username));

const pick = (source, fields) =>
  Object.fromEntries(
    fields.filter((field) => source[field] !== undefined).map((field) => [field, source[field]])
  );

const toBool = (value) => value === true || value === "true" || value === "1" || value === 1;

/* ------------------------------------------------------------------- images */

// Les images envoyées sont réduites puis stockées en data URL dans le navigateur.
const fileToDataUrl = (file) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const scale = Math.min(1, 900 / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      image.onerror = () => resolve(null);
      image.src = reader.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });

const readBody = async (data) => {
  if (!data) return {};
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  }
  if (typeof FormData !== "undefined" && data instanceof FormData) {
    const body = {};
    await Promise.all(
      [...data.entries()].map(async ([key, value]) => {
        body[key] = value instanceof Blob ? await fileToDataUrl(value) : value;
      })
    );
    return body;
  }
  return data;
};

/* -------------------------------------------------------------------- routes */

const routes = [];
const route = (method, pattern, handler) => {
  const regex = new RegExp(`^${pattern.replace(/:(\w+)/g, "(?<$1>\\d+)")}$`);
  routes.push({ method, regex, handler });
};

// Authentification
route("POST", "/auth/register", ({ body }) => {
  const mail = String(body.mail ?? "").trim().toLowerCase();
  if (db.users.some((user) => user.mail === mail)) {
    throw new HttpError(409, "Un compte existe déjà avec cette adresse mail");
  }
  const user = {
    id: nextId(db.users),
    username: String(body.username ?? "").trim(),
    mail,
    user_pass: body.user_pass,
    localisation: String(body.localisation ?? "").trim(),
    avatar: null,
    biographie: null,
    service_type: null,
    is_admin: false,
    created_at: now(),
  };
  db.users.push(user);
  return [201, profileOf(user)];
});

route("POST", "/auth/login", ({ body }) => {
  const mail = String(body.mail ?? "").trim().toLowerCase();
  const user = db.users.find((row) => row.mail === mail);
  if (!user || user.user_pass !== body.user_pass) {
    throw new HttpError(401, "Email ou mot de passe incorrect");
  }
  return [200, { token: signToken(user), userId: user.id }];
});

route("GET", "/auth/me", ({ auth }) => {
  requireAuth(auth);
  const user = userById(auth.id);
  if (!user) throw new HttpError(404, "Utilisateur introuvable");
  return [200, profileOf(user)];
});

// Utilisateurs
route("GET", "/users", ({ params }) => {
  const search = params.search?.trim().toLowerCase();
  const rows = db.users
    .filter((user) => !search || user.username.toLowerCase().includes(search))
    .sort((a, b) => a.username.localeCompare(b.username))
    .slice(0, 20)
    .map(summaryOf);
  return [200, rows];
});

route("GET", "/users/:id", ({ id, auth }) => {
  const user = profileOf(userById(id));
  if (!user) throw new HttpError(404, "Utilisateur introuvable");
  if (!auth || (auth.id !== user.id && !auth.isAdmin)) {
    delete user.mail;
    delete user.is_admin;
  }
  return [200, user];
});

route("PUT", "/users/:id", ({ id, auth, body }) => {
  requireAuth(auth);
  if (auth.id !== id && !auth.isAdmin) {
    throw new HttpError(403, "Vous ne pouvez modifier que votre propre profil");
  }
  const user = userById(id);
  if (!user) throw new HttpError(404, "Utilisateur introuvable");

  const data = pick(body, ["username", "mail", "localisation", "biographie", "service_type"]);
  if (data.mail) {
    data.mail = data.mail.toLowerCase();
    if (db.users.some((row) => row.mail === data.mail && row.id !== id)) {
      throw new HttpError(409, "Un compte existe déjà avec cette adresse mail");
    }
  }
  if (body.user_pass) data.user_pass = body.user_pass;
  if (body.avatar) data.avatar = body.avatar;

  Object.assign(user, data);
  return [200, profileOf(user)];
});

route("DELETE", "/users/:id", ({ id, auth }) => {
  requireAuth(auth);
  if (auth.id !== id && !auth.isAdmin) {
    throw new HttpError(403, "Vous ne pouvez supprimer que votre propre profil");
  }
  if (!userById(id)) throw new HttpError(404, "Utilisateur introuvable");

  const removedServices = db.services.filter((s) => s.user_id === id).map((s) => s.id);
  const removedConversations = db.conversations
    .filter((c) => c.user_one_id === id || c.user_two_id === id)
    .map((c) => c.id);

  db.users = db.users.filter((user) => user.id !== id);
  db.services = db.services.filter((service) => service.user_id !== id);
  db.comments = db.comments.filter(
    (comment) => comment.user_id !== id && !removedServices.includes(comment.service_id)
  );
  db.friends = db.friends.filter((row) => row.user_id !== id && row.friend_id !== id);
  db.conversations = db.conversations.filter((c) => !removedConversations.includes(c.id));
  db.messages = db.messages.filter(
    (message) => message.sender_id !== id && !removedConversations.includes(message.conversation_id)
  );
  return [204, ""];
});

// Catégories
const findCategory = (id) => {
  const category = db.categories.find((row) => row.id === id);
  if (!category) throw new HttpError(404, "Catégorie introuvable");
  return category;
};

route("GET", "/categories", () => [
  200,
  [...db.categories].sort((a, b) => a.titre.localeCompare(b.titre)).map(categoryView),
]);

route("GET", "/categories/:id", ({ id }) => [200, categoryView(findCategory(id))]);

route("POST", "/categories", ({ auth, body }) => {
  requireAdmin(auth);
  const category = {
    id: nextId(db.categories),
    titre: body.titre,
    description: body.description || null,
    category_image: body.category_image || null,
  };
  db.categories.push(category);
  return [201, categoryView(category)];
});

route("PUT", "/categories/:id", ({ id, auth, body }) => {
  requireAdmin(auth);
  const category = findCategory(id);
  Object.assign(category, pick(body, ["titre", "description", "category_image"]));
  return [200, categoryView(category)];
});

route("DELETE", "/categories/:id", ({ id, auth }) => {
  requireAdmin(auth);
  findCategory(id);
  db.categories = db.categories.filter((row) => row.id !== id);
  db.services.forEach((service) => {
    // eslint-disable-next-line no-param-reassign
    if (service.category_id === id) service.category_id = null;
  });
  return [204, ""];
});

// Services
const positiveInt = (value) => {
  const number = parseInt(value, 10);
  return Number.isInteger(number) && number > 0 ? number : undefined;
};

const findOwnedService = (id, auth) => {
  requireAuth(auth);
  const service = db.services.find((row) => row.id === id);
  if (!service) throw new HttpError(404, "Service introuvable");
  if (service.user_id !== auth.id && !auth.isAdmin) {
    throw new HttpError(403, "Ce service ne vous appartient pas");
  }
  return service;
};

const assertCategory = (categoryId) => {
  if (categoryId && !db.categories.some((row) => row.id === categoryId)) {
    throw new HttpError(400, "Catégorie inexistante");
  }
};

route("GET", "/services", ({ params, auth }) => {
  const userId = positiveInt(params.userId);
  const categoryId = positiveInt(params.categoryId);
  const search = params.search?.trim().toLowerCase();
  const includeInactive = Boolean(userId && auth?.id === userId);

  const rows = db.services
    .filter((service) => includeInactive || service.status)
    .filter((service) => !userId || service.user_id === userId)
    .filter((service) => !categoryId || service.category_id === categoryId)
    .map(serviceView)
    .filter(
      (service) =>
        !search ||
        [service.titre, service.description, service.category_titre].some((text) =>
          text?.toLowerCase().includes(search)
        )
    )
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  return [200, rows];
});

route("GET", "/services/:id", ({ id, auth }) => {
  const service = db.services.find((row) => row.id === id);
  if (!service || (!service.status && service.user_id !== auth?.id)) {
    throw new HttpError(404, "Service introuvable");
  }
  return [200, serviceView(service)];
});

route("POST", "/services", ({ auth, body }) => {
  requireAuth(auth);
  const categoryId = positiveInt(body.category_id) ?? null;
  assertCategory(categoryId);
  const service = {
    id: nextId(db.services),
    titre: String(body.titre ?? "").trim(),
    description: String(body.description ?? "").trim(),
    illustration: body.image || null,
    status: true,
    user_id: auth.id,
    category_id: categoryId,
    created_at: now(),
  };
  db.services.push(service);
  return [201, serviceView(service)];
});

route("PUT", "/services/:id", ({ id, auth, body }) => {
  const service = findOwnedService(id, auth);
  const data = pick(body, ["titre", "description"]);
  if (body.category_id !== undefined) {
    data.category_id = positiveInt(body.category_id) ?? null;
    assertCategory(data.category_id);
  }
  if (body.status !== undefined) data.status = toBool(body.status);
  if (body.image) data.illustration = body.image;
  Object.assign(service, data);
  return [200, serviceView(service)];
});

route("DELETE", "/services/:id", ({ id, auth }) => {
  findOwnedService(id, auth);
  db.services = db.services.filter((row) => row.id !== id);
  db.comments = db.comments.filter((comment) => comment.service_id !== id);
  return [204, ""];
});

// Commentaires
const findComment = (id) => {
  const comment = db.comments.find((row) => row.id === id);
  if (!comment) throw new HttpError(404, "Commentaire introuvable");
  return comment;
};

route("GET", "/services/:id/comments", ({ id }) => [
  200,
  db.comments
    .filter((comment) => comment.service_id === id)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map(commentView),
]);

route("POST", "/services/:id/comments", ({ id, auth, body }) => {
  requireAuth(auth);
  if (!db.services.some((row) => row.id === id)) throw new HttpError(404, "Service introuvable");
  const comment = {
    id: nextId(db.comments),
    service_id: id,
    user_id: auth.id,
    content: String(body.content ?? "").trim(),
    created_at: now(),
  };
  db.comments.push(comment);
  return [201, commentView(comment)];
});

route("PUT", "/comments/:id", ({ id, auth, body }) => {
  requireAuth(auth);
  const comment = findComment(id);
  if (comment.user_id !== auth.id) {
    throw new HttpError(403, "Vous ne pouvez modifier que vos commentaires");
  }
  comment.content = String(body.content ?? "").trim();
  return [200, commentView(comment)];
});

route("DELETE", "/comments/:id", ({ id, auth }) => {
  requireAuth(auth);
  const comment = findComment(id);
  if (comment.user_id !== auth.id && !auth.isAdmin) {
    throw new HttpError(403, "Vous ne pouvez supprimer que vos commentaires");
  }
  db.comments = db.comments.filter((row) => row.id !== id);
  return [204, ""];
});

// FAQ
const findFaq = (id) => {
  const entry = db.faq.find((row) => row.id === id);
  if (!entry) throw new HttpError(404, "Question introuvable");
  return entry;
};

route("GET", "/faq", () => [200, [...db.faq].sort((a, b) => a.id - b.id)]);

route("POST", "/faq", ({ auth, body }) => {
  requireAdmin(auth);
  const entry = { id: nextId(db.faq), title: body.title, content: body.content };
  db.faq.push(entry);
  return [201, entry];
});

route("PUT", "/faq/:id", ({ id, auth, body }) => {
  requireAdmin(auth);
  const entry = findFaq(id);
  Object.assign(entry, pick(body, ["title", "content"]));
  return [200, entry];
});

route("DELETE", "/faq/:id", ({ id, auth }) => {
  requireAdmin(auth);
  findFaq(id);
  db.faq = db.faq.filter((row) => row.id !== id);
  return [204, ""];
});

// Amis
route("GET", "/friends", ({ auth }) => [200, friendsOf(requireAuth(auth).id)]);

route("POST", "/friends", ({ auth, body }) => {
  requireAuth(auth);
  const friendId = positiveInt(body.friend_id);
  if (!friendId) throw new HttpError(400, "Utilisateur invalide");
  if (friendId === auth.id) throw new HttpError(400, "Vous ne pouvez pas vous ajouter vous-même");
  if (!userById(friendId)) throw new HttpError(404, "Utilisateur introuvable");
  if (!db.friends.some((row) => row.user_id === auth.id && row.friend_id === friendId)) {
    db.friends.push({ user_id: auth.id, friend_id: friendId });
  }
  return [201, friendsOf(auth.id)];
});

route("DELETE", "/friends/:id", ({ id, auth }) => {
  requireAuth(auth);
  const before = db.friends.length;
  db.friends = db.friends.filter((row) => !(row.user_id === auth.id && row.friend_id === id));
  if (db.friends.length === before) {
    throw new HttpError(404, "Cet utilisateur n'est pas dans vos amis");
  }
  return [204, ""];
});

// Messagerie
const findOwnConversation = (id, auth) => {
  requireAuth(auth);
  const conversation = db.conversations.find((row) => row.id === id);
  if (
    !conversation ||
    (conversation.user_one_id !== auth.id && conversation.user_two_id !== auth.id)
  ) {
    throw new HttpError(404, "Conversation introuvable");
  }
  return conversation;
};

route("GET", "/conversations", ({ auth }) => [200, conversationsFor(requireAuth(auth).id)]);

route("POST", "/conversations", ({ auth, body }) => {
  requireAuth(auth);
  const otherId = positiveInt(body.user_id);
  if (!otherId) throw new HttpError(400, "Utilisateur invalide");
  if (otherId === auth.id) throw new HttpError(400, "Vous ne pouvez pas vous écrire à vous-même");
  if (!userById(otherId)) throw new HttpError(404, "Utilisateur introuvable");

  const [one, two] = auth.id < otherId ? [auth.id, otherId] : [otherId, auth.id];
  let conversation = db.conversations.find(
    (row) => row.user_one_id === one && row.user_two_id === two
  );
  const created = !conversation;
  if (created) {
    conversation = {
      id: nextId(db.conversations),
      user_one_id: one,
      user_two_id: two,
      last_message: null,
      last_message_time: null,
      created_at: now(),
    };
    db.conversations.push(conversation);
  }
  return [
    created ? 201 : 200,
    conversationsFor(auth.id).find((row) => row.id === conversation.id),
  ];
});

route("DELETE", "/conversations/:id", ({ id, auth }) => {
  findOwnConversation(id, auth);
  db.conversations = db.conversations.filter((row) => row.id !== id);
  db.messages = db.messages.filter((message) => message.conversation_id !== id);
  return [204, ""];
});

route("GET", "/conversations/:id/messages", ({ id, auth }) => {
  findOwnConversation(id, auth);
  return [
    200,
    db.messages
      .filter((message) => message.conversation_id === id)
      .sort((a, b) => a.sent_at.localeCompare(b.sent_at) || a.id - b.id),
  ];
});

route("POST", "/conversations/:id/messages", ({ id, auth, body }) => {
  const conversation = findOwnConversation(id, auth);
  const content = String(body.content ?? "").trim();
  if (!content) throw new HttpError(400, "Le message doit comporter entre 1 et 1000 caractères");
  const message = {
    id: nextId(db.messages),
    conversation_id: id,
    sender_id: auth.id,
    content,
    sent_at: now(),
  };
  db.messages.push(message);
  conversation.last_message = content;
  conversation.last_message_time = message.sent_at;
  return [201, message];
});

// Formulaire de contact
route("POST", "/contact", ({ body }) => {
  db.contact.push({ id: nextId(db.contact), ...body, created_at: now() });
  return [201, { message: "Votre message a bien été envoyé" }];
});

/* -------------------------------------------------------------- adaptateur */

const wait = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export default async function demoAdapter(config) {
  await wait(120);

  const method = (config.method ?? "get").toUpperCase();
  const path = (config.url ?? "")
    .replace(/^https?:\/\/[^/]+/, "")
    .replace(/^\/api/, "")
    .split("?")[0];

  const respond = (status, data) => ({
    data,
    status,
    statusText: String(status),
    headers: {},
    config,
    request: {},
  });

  try {
    const match = routes
      .filter((entry) => entry.method === method)
      .map((entry) => ({ entry, result: entry.regex.exec(path) }))
      .find(({ result }) => result);

    if (!match) throw new HttpError(404, "Ressource introuvable");

    const [status, data] = await match.entry.handler({
      id: match.result.groups?.id ? Number(match.result.groups.id) : undefined,
      params: config.params ?? {},
      body: await readBody(config.data),
      auth: readAuth(config.headers),
    });

    if (method !== "GET") save();
    return respond(status, structuredClone(data));
  } catch (error) {
    const status = error.status ?? 500;
    const message = error.status ? error.message : "Erreur interne du serveur";
    throw new AxiosError(
      message,
      status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
      config,
      {},
      respond(status, { error: message })
    );
  }
}
