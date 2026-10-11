import { Link } from "react-router-dom";
import Logo from "@components/ui/Logo";

const COLUMNS = [
  {
    title: "Explorer",
    links: [
      { to: "/services", label: "Tous les services" },
      { to: "/categories", label: "Catégories" },
      { to: "/publier", label: "Publier un service" },
    ],
  },
  {
    title: "Mingle",
    links: [
      { to: "/a-propos", label: "À propos" },
      { to: "/faq", label: "FAQ" },
      { to: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Informations légales",
    links: [
      { to: "/conditions-utilisation", label: "Conditions d'utilisation" },
      { to: "/politique-de-confidentialite", label: "Politique de confidentialité" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-24 bg-dark text-white">
      <div className="container-page grid gap-12 py-16 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo className="text-white" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/65">
            La plateforme d&apos;entraide où chacun peut proposer son aide et trouver du soutien,
            gratuitement, près de chez soi.
          </p>
        </div>
        {COLUMNS.map((column) => (
          <div key={column.title}>
            <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-secondary">
              {column.title}
            </h2>
            <ul className="space-y-3">
              {column.links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-white/75 transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <p className="container-page py-6 text-center text-xs text-white/50">
          © {new Date().getFullYear()} Mingle. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
