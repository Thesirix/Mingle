import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { FiChevronDown, FiEdit2, FiPlus, FiTrash2, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import api, { errorMessage } from "@services/api";
import { useAuth } from "@contexts/AuthContext";
import PageHeader from "@components/ui/PageHeader";
import FormField from "@components/ui/FormField";
import Loader from "@components/ui/Loader";
import ConfirmDialog from "@components/ui/ConfirmDialog";

const schema = Yup.object({
  title: Yup.string().trim().min(3, "3 caractères minimum").max(150).required("Question requise"),
  content: Yup.string().trim().min(3, "3 caractères minimum").required("Réponse requise"),
});

function FaqForm({ initialValues, submitLabel, onSubmit, onCancel }) {
  return (
    <Formik initialValues={initialValues} validationSchema={schema} onSubmit={onSubmit}>
      {({ isSubmitting }) => (
        <Form className="space-y-4">
          <FormField label="Question" name="title" />
          <FormField label="Réponse" name="content" as="textarea" rows={4} />
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-outline" onClick={onCancel}>
              Annuler
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {submitLabel}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}

function FaqItem({ item, isOpen, onToggle, isAdmin, onEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <motion.li layout className="card overflow-hidden">
      {isEditing ? (
        <div className="p-6">
          <FaqForm
            initialValues={{ title: item.title, content: item.content }}
            submitLabel="Enregistrer"
            onSubmit={async (values) => {
              if (await onEdit(item.id, values)) setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 pr-4">
            <button
              type="button"
              className="flex flex-1 items-center justify-between gap-4 px-6 py-5 text-left"
              onClick={onToggle}
              aria-expanded={isOpen}
            >
              <span className="font-bold">{item.title}</span>
              <FiChevronDown
                className={`shrink-0 text-xl text-primary transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isAdmin && (
              <>
                <button
                  type="button"
                  className="btn-ghost p-2"
                  onClick={() => setIsEditing(true)}
                  aria-label="Modifier"
                >
                  <FiEdit2 />
                </button>
                <button
                  type="button"
                  className="btn-ghost p-2 text-red-600 hover:bg-red-50"
                  onClick={() => onDelete(item)}
                  aria-label="Supprimer"
                >
                  <FiTrash2 />
                </button>
              </>
            )}
          </div>
          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <p className="whitespace-pre-line px-6 pb-6 leading-relaxed text-dark/70">
                  {item.content}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.li>
  );
}

export default function FAQ() {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => {
    api
      .get("/faq")
      .then(({ data }) => {
        setItems(data);
        setOpenId(data[0]?.id ?? null);
      })
      .catch(() => setItems([]));
  }, []);

  const handleAdd = async (values) => {
    try {
      const { data } = await api.post("/faq", values);
      setItems((current) => [...current, data]);
      setShowForm(false);
      toast.success("Question ajoutée");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const handleEdit = async (id, values) => {
    try {
      const { data } = await api.put(`/faq/${id}`, values);
      setItems((current) => current.map((item) => (item.id === id ? data : item)));
      toast.success("Question mise à jour");
      return true;
    } catch (error) {
      toast.error(errorMessage(error));
      return false;
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/faq/${toDelete.id}`);
      setItems((current) => current.filter((item) => item.id !== toDelete.id));
      toast.success("Question supprimée");
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setToDelete(null);
    }
  };

  return (
    <div className="container-page max-w-4xl py-12">
      <PageHeader
        eyebrow="FAQ"
        title="Questions fréquentes"
        actions={
          isAdmin && (
            <button
              type="button"
              className="btn-dark"
              onClick={() => setShowForm((value) => !value)}
            >
              {showForm ? <FiX /> : <FiPlus />} {showForm ? "Fermer" : "Ajouter une question"}
            </button>
          )
        }
      >
        Tout ce que vous devez savoir pour bien démarrer sur Mingle.
      </PageHeader>

      <AnimatePresence>
        {showForm && (
          <motion.div
            className="card mb-8 overflow-hidden p-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <FaqForm
              initialValues={{ title: "", content: "" }}
              submitLabel="Ajouter"
              onSubmit={handleAdd}
              onCancel={() => setShowForm(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {items === null ? (
        <Loader />
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <FaqItem
              key={item.id}
              item={item}
              isOpen={openId === item.id}
              onToggle={() => setOpenId(openId === item.id ? null : item.id)}
              isAdmin={isAdmin}
              onEdit={handleEdit}
              onDelete={setToDelete}
            />
          ))}
        </ul>
      )}

      <div className="mt-12 rounded-3xl bg-light/60 p-8 text-center">
        <h2 className="text-xl">Vous ne trouvez pas votre réponse ?</h2>
        <p className="mt-2 text-dark/60">Notre équipe vous répond dans les meilleurs délais.</p>
        <Link to="/contact" className="btn-primary mt-5">
          Nous contacter
        </Link>
      </div>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Supprimer cette question ?"
        confirmLabel="Supprimer"
        danger
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      >
        « {toDelete?.title} »
      </ConfirmDialog>
    </div>
  );
}
