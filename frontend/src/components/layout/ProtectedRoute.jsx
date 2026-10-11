import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import Loader from "@components/ui/Loader";

/** Redirige vers la page de connexion si l'utilisateur n'est pas connecté. */
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isLoggedIn, isAdmin, isReady } = useAuth();
  const location = useLocation();

  if (!isReady) return <Loader />;

  if (!isLoggedIn) {
    return <Navigate to="/connexion" replace state={{ from: location.pathname }} />;
  }

  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;

  return children;
}
