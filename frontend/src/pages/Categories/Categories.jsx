import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiPlus, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import api, { errorMessage } from "@services/api";
import { useAuth } from "@contexts/AuthContext";
import PageHeader from "@components/ui/PageHeader";
import Loader from "@components/ui/Loader";
import EmptyState from "@components/ui/EmptyState";
import Reveal from "@components/ui/Reveal";
import CategoryCard from "@components/categories/CategoryCard";
import CategoryForm from "@components/categories/CategoryForm";

export default function Categories() {
  const { isAdmin } = useAuth();
  const [categories, setCategories] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    api
      .get("/categories")
      .then(({ data }) => setCategories(data))
      .catch(() => setCategories([]));
  }, []);

  const handleAdd = async (values, { resetForm }) => {
    try {
      const { data } = await api.post("/categories", values);
      setCategories((current) => [...current, data].sort((a, b) => a.titre.localeCompare(b.titre)));
      resetForm();
      setShowForm(false);
      toast.success("Catégorie ajoutée");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  return (
    <div className="container-page py-12">
      <PageHeader
        eyebrow="Catégories"
        title="Explorez par thématique"
        actions={
          isAdmin && (
            <button
              type="button"
              className="btn-dark"
              onClick={() => setShowForm((value) => !value)}
            >
              {showForm ? <FiX /> : <FiPlus />} {showForm ? "Fermer" : "Nouvelle catégorie"}
            </button>
          )
        }
      >
        Ménage, bricolage, numérique ou accompagnement : trouvez rapidement le coup de main dont
        vous avez besoin.
      </PageHeader>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="card mb-10 max-w-2xl p-6 sm:p-8">
              <h2 className="mb-6 text-xl">Nouvelle catégorie</h2>
              <CategoryForm submitLabel="Ajouter la catégorie" onSubmit={handleAdd} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {categories === null && <Loader />}
      {categories?.length === 0 && <EmptyState title="Aucune catégorie pour le moment" />}
      {categories?.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category, index) => (
            <Reveal key={category.id} delay={(index % 4) * 0.06}>
              <CategoryCard category={category} canEdit={isAdmin} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
