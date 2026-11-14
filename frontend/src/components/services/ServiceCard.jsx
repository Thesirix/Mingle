import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMapPin, FiMessageCircle } from "react-icons/fi";
import { assetUrl } from "@services/api";
import { timeAgo } from "@services/format";
import Avatar from "@components/ui/Avatar";
import { LogoMark } from "@components/ui/Logo";

export function ServiceImage({ service, className = "" }) {
  const url = assetUrl(service.illustration);

  if (url) {
    return <img src={url} alt="" className={`h-full w-full object-cover ${className}`} />;
  }

  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-light via-secondary/60 to-primary/70 ${className}`}
    >
      <LogoMark className="h-16 w-14 text-white/80" />
    </div>
  );
}

export default function ServiceCard({ service }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="card group overflow-hidden transition-shadow hover:shadow-soft"
    >
      <Link to={`/services/${service.id}`} className="flex h-full flex-col">
        <div className="relative aspect-[16/10] overflow-hidden">
          <ServiceImage
            service={service}
            className="transition duration-500 group-hover:scale-105"
          />
          {service.category_titre && (
            <span className="badge absolute left-4 top-4 bg-white/90 text-dark backdrop-blur">
              {service.category_titre}
            </span>
          )}
          {service.status === false && (
            <span className="badge absolute right-4 top-4 bg-dark text-white">Désactivé</span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="line-clamp-2 text-lg leading-snug transition group-hover:text-primary">
            {service.titre}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-dark/60">{service.description}</p>

          <div className="mt-auto flex items-center justify-between gap-3 pt-5">
            <div className="flex min-w-0 items-center gap-2.5">
              <Avatar src={service.avatar} name={service.username} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{service.username}</p>
                <p className="flex items-center gap-1 truncate text-xs text-dark/50">
                  <FiMapPin className="shrink-0" /> {service.localisation}
                </p>
              </div>
            </div>
            <div className="shrink-0 text-right text-xs text-dark/50">
              <p className="flex items-center justify-end gap-1">
                <FiMessageCircle /> {service.comment_count ?? 0}
              </p>
              <p>{timeAgo(service.created_at)}</p>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
