import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FiChevronDown, FiGrid, FiLogOut, FiMenu, FiPlus, FiUser, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import { useAuth } from "@contexts/AuthContext";
import Logo from "@components/ui/Logo";
import Avatar from "@components/ui/Avatar";

const NAV_LINKS = [
  { to: "/", label: "Accueil", end: true },
  { to: "/services", label: "Services" },
  { to: "/categories", label: "Catégories" },
  { to: "/faq", label: "FAQ" },
];

function UserMenu() {
  const { user, userId, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleLogout = () => {
    setOpen(false);
    logout();
    toast.success("Vous êtes déconnecté. À bientôt !");
    navigate("/");
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="flex items-center gap-2 rounded-full border border-dark/10 bg-white py-1 pl-1 pr-3 transition hover:border-dark/25"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Avatar src={user?.avatar} name={user?.username} size="sm" />
        <span className="hidden max-w-[8rem] truncate text-sm font-semibold lg:block">
          {user?.username}
        </span>
        <FiChevronDown className={`transition ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-dark/5 bg-white p-2 shadow-soft"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
          >
            <Link
              role="menuitem"
              to={`/profil/${userId}`}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-light/50"
              onClick={() => setOpen(false)}
            >
              <FiUser /> Mon profil
            </Link>
            <Link
              role="menuitem"
              to="/tableau-de-bord"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-light/50"
              onClick={() => setOpen(false)}
            >
              <FiGrid /> Mes services
            </Link>
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
              onClick={handleLogout}
            >
              <FiLogOut /> Déconnexion
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Header() {
  const { isLoggedIn, userId, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => setMobileOpen(false), [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-dark/5 bg-white/80 shadow-sm backdrop-blur-lg"
          : "bg-transparent"
      }`}
    >
      <div className="container-page flex h-[72px] items-center justify-between gap-4">
        <Link to="/" aria-label="Mingle, accueil" className="text-dark">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navigation principale">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `relative rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive ? "text-dark" : "text-dark/60 hover:text-dark"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-light"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  {link.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link to="/publier" className="btn-primary">
            <FiPlus /> Publier un service
          </Link>
          {isLoggedIn ? (
            <UserMenu />
          ) : (
            <Link to="/connexion" className="btn-outline">
              Connexion
            </Link>
          )}
        </div>

        <button
          type="button"
          className="rounded-full p-2 text-2xl md:hidden"
          onClick={() => setMobileOpen((value) => !value)}
          aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            className="overflow-hidden border-t border-dark/5 bg-white md:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            aria-label="Navigation mobile"
          >
            <div className="container-page flex flex-col gap-1 py-4">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `rounded-xl px-4 py-3 font-semibold ${
                      isActive ? "bg-light" : "hover:bg-dark/5"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="my-2 h-px bg-dark/5" />
              {isLoggedIn ? (
                <>
                  <Link
                    to={`/profil/${userId}`}
                    className="rounded-xl px-4 py-3 font-semibold hover:bg-dark/5"
                  >
                    Mon profil
                  </Link>
                  <Link
                    to="/tableau-de-bord"
                    className="rounded-xl px-4 py-3 font-semibold hover:bg-dark/5"
                  >
                    Mes services
                  </Link>
                  <button
                    type="button"
                    className="rounded-xl px-4 py-3 text-left font-semibold text-red-600 hover:bg-red-50"
                    onClick={() => {
                      logout();
                      toast.success("Vous êtes déconnecté. À bientôt !");
                    }}
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <Link
                  to="/connexion"
                  className="rounded-xl px-4 py-3 font-semibold hover:bg-dark/5"
                >
                  Connexion / Inscription
                </Link>
              )}
              <Link to="/publier" className="btn-primary mt-2">
                <FiPlus /> Publier un service
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
