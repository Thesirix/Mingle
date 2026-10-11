import { lazy, Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Loader from "@components/ui/Loader";

import Home from "@pages/Home/Home";
import NotFound from "@pages/NotFound/NotFound";
import ProtectedRoute from "./ProtectedRoute";
import PageTransition from "./PageTransition";

const Services = lazy(() => import("@pages/Services/Services"));
const ServiceDetail = lazy(() => import("@pages/ServiceDetail/ServiceDetail"));
const Categories = lazy(() => import("@pages/Categories/Categories"));
const EditCategory = lazy(() => import("@pages/Categories/EditCategory"));
const Publish = lazy(() => import("@pages/Publish/Publish"));
const Dashboard = lazy(() => import("@pages/Dashboard/Dashboard"));
const Profile = lazy(() => import("@pages/Profile/Profile"));
const EditProfile = lazy(() => import("@pages/Profile/EditProfile"));
const Auth = lazy(() => import("@pages/Auth/Auth"));
const FAQ = lazy(() => import("@pages/FAQ/FAQ"));
const About = lazy(() => import("@pages/About/About"));
const Contact = lazy(() => import("@pages/Contact/Contact"));
const Terms = lazy(() => import("@pages/Legal/Terms"));
const Privacy = lazy(() => import("@pages/Legal/Privacy"));

const page = (element) => (
  <PageTransition>
    <Suspense fallback={<Loader />}>{element}</Suspense>
  </PageTransition>
);
const privatePage = (element, options) =>
  page(<ProtectedRoute {...options}>{element}</ProtectedRoute>);

export default function AnimatedRoutes() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={page(<Home />)} />
        <Route path="/services" element={page(<Services />)} />
        <Route path="/services/:id" element={page(<ServiceDetail />)} />
        <Route path="/categories" element={page(<Categories />)} />
        <Route
          path="/categories/:id/modifier"
          element={privatePage(<EditCategory />, { adminOnly: true })}
        />
        <Route path="/publier" element={privatePage(<Publish />)} />
        <Route path="/tableau-de-bord" element={privatePage(<Dashboard />)} />
        <Route path="/profil/modifier" element={privatePage(<EditProfile />)} />
        <Route path="/profil/:userId" element={page(<Profile />)} />
        <Route path="/connexion" element={page(<Auth />)} />
        <Route path="/faq" element={page(<FAQ />)} />
        <Route path="/a-propos" element={page(<About />)} />
        <Route path="/contact" element={page(<Contact />)} />
        <Route path="/conditions-utilisation" element={page(<Terms />)} />
        <Route path="/politique-de-confidentialite" element={page(<Privacy />)} />
        <Route path="*" element={page(<NotFound />)} />
      </Routes>
    </AnimatePresence>
  );
}
