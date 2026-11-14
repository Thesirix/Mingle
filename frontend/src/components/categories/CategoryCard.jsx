import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowUpRight, FiEdit2 } from "react-icons/fi";
import { assetUrl } from "@services/api";

export default function CategoryCard({ category, canEdit = false }) {
  const image = assetUrl(category.category_image);
  const count = category.service_count ?? 0;

  return (
    <motion.article
      layout
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="group relative isolate flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-3xl bg-dark p-6 text-white shadow-card sm:aspect-[4/4.6]"
    >
      {image ? (
        <img
          src={image}
          alt=""
          className="absolute inset-0 -z-10 h-full w-full object-cover transition duration-700 group-hover:scale-110"
        />
      ) : (
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary to-dark" />
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-dark via-dark/60 to-dark/5" />

      <span className="badge mb-3 w-fit bg-white/15 text-white backdrop-blur">
        {count} service{count > 1 ? "s" : ""}
      </span>
      <h3 className="text-2xl text-white">{category.titre}</h3>
      {category.description && (
        <p className="mt-2 line-clamp-2 text-sm text-white/75">{category.description}</p>
      )}

      <Link
        to={`/services?categorie=${category.id}`}
        className="mt-5 inline-flex w-fit items-center gap-2 text-sm font-bold text-secondary after:absolute after:inset-0"
      >
        Découvrir
        <FiArrowUpRight className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </Link>

      {canEdit && (
        <Link
          to={`/categories/${category.id}/modifier`}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-dark transition hover:bg-white"
          aria-label={`Modifier la catégorie ${category.titre}`}
        >
          <FiEdit2 />
        </Link>
      )}
    </motion.article>
  );
}
