import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:5000";
export const TOKEN_KEY = "mingle_token";

// Démo statique (GitHub Pages) : l'API est simulée dans le navigateur
export const IS_DEMO = import.meta.env.VITE_DEMO === "true";

const api = axios.create({ baseURL: `${BACKEND_URL}/api` });

if (IS_DEMO) {
  api.defaults.adapter = async (config) => {
    const { default: demoAdapter } = await import("./demo/demoAdapter");
    return demoAdapter(config);
  };
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    // eslint-disable-next-line no-param-reassign
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Transforme un chemin renvoyé par l'API (/uploads/...) en URL absolue. */
export const assetUrl = (path) => {
  if (!path) return null;
  if (/^(https?:|data:|blob:)/.test(path)) return path;
  // En démo, les images du jeu de données sont servies avec le site
  return IS_DEMO ? `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}` : `${BACKEND_URL}${path}`;
};

/** Message d'erreur lisible à partir d'une erreur axios. */
export const errorMessage = (error, fallback = "Une erreur est survenue, veuillez réessayer.") => {
  if (!error.response) return "Impossible de joindre le serveur.";
  return error.response.data?.error ?? fallback;
};

export default api;
