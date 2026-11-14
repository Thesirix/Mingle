import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import api, { TOKEN_KEY } from "@services/api";

const AuthContext = createContext(null);

const readStoredToken = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;

  try {
    const { exp } = jwtDecode(token);
    if (exp && exp * 1000 < Date.now()) throw new Error("expired");
    return token;
  } catch {
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(readStoredToken);
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(!token);

  const payload = useMemo(() => (token ? jwtDecode(token) : null), [token]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const { data } = await api.get("/auth/me");
    setUser(data);
    return data;
  }, []);

  // Charge le profil de l'utilisateur connecté
  useEffect(() => {
    if (!token) {
      setIsReady(true);
      return;
    }

    setIsReady(false);
    refreshUser()
      .catch(logout)
      .finally(() => setIsReady(true));
  }, [token, refreshUser, logout]);

  // Déconnexion automatique si le serveur refuse le jeton
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && localStorage.getItem(TOKEN_KEY)) {
          logout();
        }
        return Promise.reject(error);
      }
    );
    return () => api.interceptors.response.eject(interceptor);
  }, [logout]);

  const login = useCallback(async (mail, password) => {
    const { data } = await api.post("/auth/login", { mail, user_pass: password });
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
  }, []);

  const register = useCallback(
    (values) => api.post("/auth/register", values).then(({ data }) => data),
    []
  );

  const value = useMemo(
    () => ({
      token,
      user,
      setUser,
      userId: payload ? Number(payload.sub) : null,
      isLoggedIn: Boolean(token),
      isAdmin: Boolean(payload?.isAdmin),
      isReady,
      login,
      register,
      logout,
      refreshUser,
    }),
    [token, user, payload, isReady, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth doit être utilisé dans un AuthProvider");
  return context;
};
