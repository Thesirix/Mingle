import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import api, { errorMessage } from "@services/api";
import Loader from "@components/ui/Loader";
import EmptyState from "@components/ui/EmptyState";
import ConfirmDialog from "@components/ui/ConfirmDialog";
import CategoryForm from "@components/categories/CategoryForm";

export default function EditCategory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(undefined);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    api
      .get(`/categories/${id}`)
      .then(({ data }) => setCategory(data))
      .catch(() => setCategory(null));
  }, [id]);

  const handleSave = async (values) => {
    try {
      await api.put(`/categories/${id}`, values);
      toast.success("Catégorie mise à jour");
      navigate("/categories");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/categories/${id}`);
      toast.success("Catégorie supprimée");
      navigate("/categories");
    } catch (error) {
      toast.error(errorMessage(error));
      setConfirmDelete(false);
    }
  };

  if (category === undefined) return <Loader />;

  if (category === null) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title="Catégorie introuvable"
          action={
            <Link to="/categories" className="btn-primary">
              Retour aux catégories
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-page max-w-2xl py-12">
      <Link to="/categories" className="btn-ghost -ml-3 mb-6">
        <FiArrowLeft /> Catégories
      </Link>
      <div className="card p-6 sm:p-8">
        <h1 className="mb-6 text-2xl">Modifier « {category.titre} »</h1>
        <CategoryForm
          initialValues={{
            titre: category.titre,
            description: category.description ?? "",
            category_image: category.category_image ?? "",
          }}
          submitLabel="Enregistrer"
          onSubmit={handleSave}
        >
          <button
            type="button"
            className="btn-outline mr-auto text-red-600"
            onClick={() => setConfirmDelete(true)}
          >
            <FiTrash2 /> Supprimer
          </button>
        </CategoryForm>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Supprimer cette catégorie ?"
        confirmLabel="Supprimer"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      >
        Les services associés ne seront pas supprimés mais n&apos;auront plus de catégorie.
      </ConfirmDialog>
    </div>
  );
}
