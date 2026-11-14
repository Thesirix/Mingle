import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:5000";
export const TOKEN_KEY = "mingle_token";

const api = axios.create({ baseURL: `${BACKEND_URL}/api` });

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
  return /^https?:\/\//.test(path) ? path : `${BACKEND_URL}${path}`;
};

/** Message d'erreur lisible à partir d'une erreur axios. */
export const errorMessage = (error, fallback = "Une erreur est survenue, veuillez réessayer.") => {
  if (!error.response) return "Impossible de joindre le serveur.";
  return error.response.data?.error ?? fallback;
};

export default api;
