import { useState } from "react";
import { FiInfo, FiRotateCcw, FiX } from "react-icons/fi";
import { TOKEN_KEY } from "@services/api";

const ACCOUNTS = [
  { mail: "claire.martin@example.com", password: "Mingle123!", label: "membre" },
  { mail: "admin@mingle.fr", password: "Admin123!", label: "admin" },
];

/** Bandeau affiché uniquement dans la démo statique. */
export default function DemoBanner() {
  const [hidden, setHidden] = useState(false);

  const reset = async () => {
    const { resetDemo } = await import("@services/demo/demoAdapter");
    resetDemo();
    localStorage.removeItem(TOKEN_KEY);
    window.location.reload();
  };

  if (hidden) return null;

  return (
    <div className="bg-dark text-cream text-sm">
      <div className="container-page flex flex-wrap items-center gap-x-4 gap-y-2 py-2.5">
        <FiInfo className="shrink-0 text-secondary" aria-hidden="true" />
        <p className="flex-1 min-w-[16rem]">
          <strong>Démo en ligne</strong> : aucun serveur, les données restent dans votre
          navigateur. Comptes :{" "}
          {ACCOUNTS.map((account, index) => (
            <span key={account.mail}>
              {index > 0 && " · "}
              <code className="rounded bg-white/10 px-1">{account.mail}</code> /{" "}
              <code className="rounded bg-white/10 px-1">{account.password}</code> ({account.label})
            </span>
          ))}
        </p>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-full border border-cream/30 px-3 py-1 hover:bg-white/10"
        >
          <FiRotateCcw aria-hidden="true" /> Réinitialiser
        </button>
        <button
          type="button"
          onClick={() => setHidden(true)}
          aria-label="Masquer le bandeau"
          className="rounded-full p-1 hover:bg-white/10"
        >
          <FiX aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
