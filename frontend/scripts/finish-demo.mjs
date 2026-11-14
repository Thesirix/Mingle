// Termine la build de démo : copie les images du jeu de données
// et ajoute 404.html pour que les routes du site marchent sur GitHub Pages.
import { cpSync, copyFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

cpSync(path.join(root, "..", "backend", "public", "uploads"), path.join(dist, "uploads"), {
  recursive: true,
});
copyFileSync(path.join(dist, "index.html"), path.join(dist, "404.html"));

console.log("Démo prête dans frontend/dist");
