const jwt = require("jsonwebtoken");

const readToken = (req) => {
  const header = req.get("Authorization");
  if (!header) return null;

  const [type, token] = header.split(" ");
  return type === "Bearer" && token ? token : null;
};

const decode = (token) => {
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  return { id: Number(payload.sub), isAdmin: Boolean(payload.isAdmin) };
};

/** Exige un utilisateur connecté et expose req.auth = { id, isAdmin }. */
const requireAuth = (req, res, next) => {
  const token = readToken(req);

  if (!token) {
    return res.status(401).json({ error: "Authentification requise" });
  }

  try {
    req.auth = decode(token);
    return next();
  } catch {
    return res.status(401).json({ error: "Session invalide ou expirée" });
  }
};

/** Renseigne req.auth si un jeton valide est présent, sans l'exiger. */
const optionalAuth = (req, res, next) => {
  const token = readToken(req);

  if (token) {
    try {
      req.auth = decode(token);
    } catch {
      // Jeton invalide : on traite la requête comme anonyme
    }
  }

  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.auth?.isAdmin) {
    return res.status(403).json({ error: "Accès réservé aux administrateurs" });
  }
  return next();
};

module.exports = { requireAuth, optionalAuth, requireAdmin };
