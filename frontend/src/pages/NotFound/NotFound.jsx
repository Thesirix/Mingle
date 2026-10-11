import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiHome } from "react-icons/fi";

const POLYGONS = [
  {
    d: "M353,9 L626.664028,170 L626.664028,487 L353,642 L79.3359724,487 L79.3359724,170 L353,9 Z",
    color: "#DD8F16",
    delay: "0s",
  },
  {
    d: "M78.5,529 L147,569.186414 L147,648.311216 L78.5,687 L10,648.311216 L10,569.186414 L78.5,529 Z",
    color: "#0590E5",
    delay: "0.2s",
  },
  {
    d: "M773,186 L827,217.538705 L827,279.636651 L773,310 L719,279.636651 L719,217.538705 L773,186 Z",
    color: "#263B2B",
    delay: "0.4s",
  },
  {
    d: "M639,529 L773,607.846761 L773,763.091627 L639,839 L505,763.091627 L505,607.846761 L639,529 Z",
    color: "#FFD166",
    delay: "0.6s",
  },
  {
    d: "M281,801 L383,861.025276 L383,979.21169 L281,1037 L179,979.21169 L179,861.025276 L281,801 Z",
    color: "#DD8F16",
    delay: "0.8s",
  },
];

export default function NotFound() {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.backgroundColor = "#FFEDC5";
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center gap-12 py-16 md:flex-row">
      <svg viewBox="0 0 837 1045" className="w-48 md:w-72" aria-hidden="true">
        <g fill="none" strokeWidth="8">
          {POLYGONS.map((polygon) => (
            <path
              key={polygon.d}
              d={polygon.d}
              stroke={polygon.color}
              className="animate-float"
              style={{ animationDelay: polygon.delay }}
            />
          ))}
        </g>
      </svg>
      <div className="text-center md:text-left">
        <h1 className="text-8xl font-extrabold text-primary">404</h1>
        <p className="mt-2 text-2xl font-bold">Page non trouvée</p>
        <p className="mt-2 max-w-sm text-dark/60">
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
          <button type="button" className="btn-outline" onClick={() => navigate(-1)}>
            <FiArrowLeft /> Retour
          </button>
          <Link to="/" className="btn-primary">
            <FiHome /> Accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
