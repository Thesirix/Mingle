const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");
const { HttpError } = require("./asyncHandler");

const MAX_UPLOAD_SIZE = 3 * 1024 * 1024;
const UPLOAD_DIR = path.join(__dirname, "..", "..", "public", "uploads");

/**
 * Détermine l'extension à partir des premiers octets du fichier :
 * le type MIME déclaré par le client n'est pas fiable.
 */
const detectImageExtension = (data) => {
  if (!data || data.length < 12) return null;
  if (data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) return ".jpg";
  if (data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return ".png";
  }
  if (data.subarray(0, 4).toString("ascii") === "GIF8") return ".gif";
  if (
    data.subarray(0, 4).toString("ascii") === "RIFF" &&
    data.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return ".webp";
  }
  return null;
};

/**
 * Enregistre une image envoyée via express-fileupload sous un nom aléatoire
 * (le nom fourni par le client n'est jamais utilisé) et renvoie son URL publique.
 */
const saveImage = async (file) => {
  const extension = detectImageExtension(file.data);

  if (!extension) {
    throw new HttpError(400, "Format d'image non supporté (jpeg, png, gif, webp)");
  }

  const fileName = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${extension}`;

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await file.mv(path.join(UPLOAD_DIR, fileName));

  return `/uploads/${fileName}`;
};

/** Supprime une image précédemment enregistrée par saveImage. */
const removeImage = async (publicPath) => {
  if (!publicPath || !publicPath.startsWith("/uploads/")) return;

  const fileName = path.basename(publicPath);
  // Les images de catégories fournies avec le projet ne sont jamais supprimées
  if (publicPath !== `/uploads/${fileName}`) return;

  await fs.unlink(path.join(UPLOAD_DIR, fileName)).catch(() => {});
};

module.exports = { MAX_UPLOAD_SIZE, detectImageExtension, saveImage, removeImage };
