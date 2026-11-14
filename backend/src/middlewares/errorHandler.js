const notFound = (req, res) => {
  res.status(404).json({ error: "Ressource introuvable" });
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (err.code === "ER_DUP_ENTRY") {
    const error = /'(users\.)?mail'/.test(err.sqlMessage ?? "")
      ? "Un compte existe déjà avec cette adresse mail"
      : "Cette ressource existe déjà";
    return res.status(409).json({ error });
  }

  if (err.code === "ER_NO_REFERENCED_ROW_2") {
    return res.status(400).json({ error: "Référence invalide" });
  }

  if (err.status && err.status < 500) {
    return res.status(err.status).json({ error: err.message });
  }

  console.error(err);
  return res.status(500).json({ error: "Erreur interne du serveur" });
};

module.exports = { notFound, errorHandler };
