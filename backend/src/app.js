const fs = require("node:fs");
const path = require("node:path");
const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");

const router = require("./router");
const { MAX_UPLOAD_SIZE } = require("./utils/upload");
const { notFound, errorHandler } = require("./middlewares/errorHandler");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
    optionsSuccessStatus: 200,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(
  fileUpload({
    limits: { fileSize: MAX_UPLOAD_SIZE },
    abortOnLimit: true,
    responseOnLimit: JSON.stringify({
      error: "Le fichier dépasse la taille maximale autorisée (3 Mo)",
    }),
  })
);

// Images envoyées par les utilisateurs (avatars, illustrations de services)
app.use("/uploads", express.static(path.join(__dirname, "..", "public", "uploads")));

app.use("/api", router);
app.use("/api", notFound);

// En production, l'API peut aussi servir le build React
const reactDist = path.join(__dirname, "..", "..", "frontend", "dist");
const reactIndexFile = path.join(reactDist, "index.html");

if (fs.existsSync(reactIndexFile)) {
  app.use(express.static(reactDist));
  app.get("*", (req, res) => res.sendFile(reactIndexFile));
}

app.use(errorHandler);

module.exports = app;
