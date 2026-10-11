import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiPlus, FiSearch, FiX } from "react-icons/fi";
import api from "@services/api";
import PageHeader from "@components/ui/PageHeader";
import ServiceGrid from "@components/services/ServiceGrid";
import Loader from "@components/ui/Loader";
import EmptyState from "@components/ui/EmptyState";

export default function Services() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const categoryId = searchParams.get("categorie") ?? "";

  const [search, setSearch] = useState(query);
  const [services, setServices] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api
      .get("/categories")
      .then(({ data }) => setCategories(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setServices(null);
    api
      .get("/services", {
        params: { search: query || undefined, categoryId: categoryId || undefined },
      })
      .then(({ data }) => setServices(data))
      .catch(() => setServices([]));
  }, [query, categoryId]);

  // La recherche est appliquée 300 ms après la dernière frappe
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (search.trim() === query) return;
      const params = new URLSearchParams(searchParams);
      if (search.trim()) params.set("q", search.trim());
      else params.delete("q");
      setSearchParams(params, { replace: true });
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, query, searchParams, setSearchParams]);

  const selectCategory = (id) => {
    const params = new URLSearchParams(searchParams);
    if (id) params.set("categorie", id);
    else params.delete("categorie");
    setSearchParams(params);
  };

  const activeCategory = categories.find((category) => String(category.id) === categoryId);
  const hasFilters = Boolean(query || categoryId);

  return (
    <div className="container-page py-12">
      <PageHeader
        eyebrow="Services"
        title={activeCategory ? activeCategory.titre : "Tous les services"}
        actions={
          <Link to="/publier" className="btn-primary">
            <FiPlus /> Proposer un service
          </Link>
        }
      >
        {activeCategory?.description ??
          "Parcourez les coups de main proposés par les membres de la communauté."}
      </PageHeader>

      <div className="mb-10 space-y-5">
        <div className="relative max-w-xl">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-dark/40" />
          <label htmlFor="services-search" className="sr-only">
            Rechercher un service
          </label>
          <input
            id="services-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher un service, une compétence…"
            className="input rounded-full py-3 pl-11"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => selectCategory("")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              !categoryId ? "bg-dark text-white" : "bg-white text-dark hover:bg-light"
            }`}
          >
            Toutes
          </button>
          {categories.map((category) => {
            const active = String(category.id) === categoryId;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => selectCategory(active ? "" : category.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active ? "bg-dark text-white" : "bg-white text-dark hover:bg-light"
                }`}
              >
                {category.titre}
                <span className={`ml-2 text-xs ${active ? "text-white/60" : "text-dark/40"}`}>
                  {category.service_count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {services === null && <Loader />}

      {services?.length === 0 && (
        <EmptyState
          icon={FiSearch}
          title="Aucun service trouvé"
          action={
            hasFilters && (
              <button
                type="button"
                className="btn-outline"
                onClick={() => {
                  setSearch("");
                  setSearchParams({});
                }}
              >
                <FiX /> Réinitialiser les filtres
              </button>
            )
          }
        >
          {hasFilters
            ? "Essayez avec d'autres mots-clés ou une autre catégorie."
            : "Soyez le premier à proposer un service à la communauté !"}
        </EmptyState>
      )}

      {services?.length > 0 && (
        <>
          <p className="mb-5 text-sm font-medium text-dark/50">
            {services.length} service{services.length > 1 ? "s" : ""}
          </p>
          <ServiceGrid services={services} />
        </>
      )}
    </div>
  );
}
