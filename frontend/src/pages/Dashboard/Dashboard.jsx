import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiCheckCircle,
  FiEdit2,
  FiEye,
  FiLayers,
  FiMessageSquare,
  FiPauseCircle,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import { toast } from "react-toastify";
import api, { errorMessage } from "@services/api";
import { formatDate } from "@services/format";
import { useAuth } from "@contexts/AuthContext";
import PageHeader from "@components/ui/PageHeader";
import Loader from "@components/ui/Loader";
import EmptyState from "@components/ui/EmptyState";
import Modal from "@components/ui/Modal";
import ConfirmDialog from "@components/ui/ConfirmDialog";
import ServiceForm, { toServiceFormData } from "@components/services/ServiceForm";
import { ServiceImage } from "@components/services/ServiceCard";

function StatCard({ icon: Icon, label, value, color, delay }) {
  return (
    <motion.div
      className="card flex items-center gap-4 p-5"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <span className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl ${color}`}>
        <Icon />
      </span>
      <div>
        <p className="text-2xl font-extrabold">{value}</p>
        <p className="text-sm text-dark/55">{label}</p>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { userId, user } = useAuth();
  const [services, setServices] = useState(null);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const fetchServices = useCallback(() => {
    api
      .get("/services", { params: { userId } })
      .then(({ data }) => setServices(data))
      .catch(() => setServices([]));
  }, [userId]);

  useEffect(fetchServices, [fetchServices]);

  const stats = useMemo(() => {
    const list = services ?? [];
    const active = list.filter((service) => service.status).length;
    return {
      total: list.length,
      active,
      inactive: list.length - active,
      comments: list.reduce((sum, service) => sum + Number(service.comment_count ?? 0), 0),
    };
  }, [services]);

  const replaceService = (updated) =>
    setServices((current) =>
      current.map((service) => (service.id === updated.id ? updated : service))
    );

  const toggleStatus = async (service) => {
    try {
      const { data } = await api.put(`/services/${service.id}`, { status: !service.status });
      replaceService(data);
      toast.success(data.status ? "Service réactivé" : "Service désactivé");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const handleEdit = async (values) => {
    try {
      const { data } = await api.put(`/services/${editing.id}`, toServiceFormData(values));
      replaceService(data);
      setEditing(null);
      toast.success("Service mis à jour");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/services/${toDelete.id}`);
      setServices((current) => current.filter((service) => service.id !== toDelete.id));
      toast.success("Service supprimé");
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setToDelete(null);
    }
  };

  return (
    <div className="container-page py-12">
      <PageHeader
        eyebrow="Tableau de bord"
        title={`Bonjour ${user?.username?.split(" ")[0] ?? ""} 👋`}
        actions={
          <Link to="/publier" className="btn-primary">
            <FiPlus /> Nouveau service
          </Link>
        }
      >
        Gérez vos services, suivez leur activité et mettez-les en pause quand vous le souhaitez.
      </PageHeader>

      <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={FiLayers}
          label="Services publiés"
          value={stats.total}
          color="bg-light text-primary"
          delay={0}
        />
        <StatCard
          icon={FiCheckCircle}
          label="Services actifs"
          value={stats.active}
          color="bg-green-50 text-green-700"
          delay={0.05}
        />
        <StatCard
          icon={FiPauseCircle}
          label="Services désactivés"
          value={stats.inactive}
          color="bg-dark/5 text-dark"
          delay={0.1}
        />
        <StatCard
          icon={FiMessageSquare}
          label="Commentaires reçus"
          value={stats.comments}
          color="bg-accent/10 text-accent"
          delay={0.15}
        />
      </div>

      <h2 className="mb-5 text-2xl">Mes services</h2>

      {services === null && <Loader />}

      {services?.length === 0 && (
        <EmptyState
          title="Vous n'avez encore publié aucun service"
          action={
            <Link to="/publier" className="btn-primary">
              <FiPlus /> Publier mon premier service
            </Link>
          }
        >
          Proposez votre aide à la communauté : elle apparaîtra ici.
        </EmptyState>
      )}

      {services?.length > 0 && (
        <ul className="space-y-4">
          {services.map((service, index) => (
            <motion.li
              key={service.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className={`card flex flex-col gap-5 p-4 sm:flex-row sm:items-center ${
                service.status ? "" : "opacity-70"
              }`}
            >
              <div className="h-28 w-full shrink-0 overflow-hidden rounded-2xl sm:h-20 sm:w-32">
                <ServiceImage service={service} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-lg">{service.titre}</h3>
                  <span
                    className={`badge ${
                      service.status ? "bg-green-50 text-green-700" : "bg-dark/10 text-dark/70"
                    }`}
                  >
                    {service.status ? "Actif" : "Désactivé"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-dark/55">
                  {service.category_titre ?? "Sans catégorie"} · Publié le{" "}
                  {formatDate(service.created_at)} · {service.comment_count} commentaire
                  {service.comment_count > 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to={`/services/${service.id}`} className="btn-ghost px-3" aria-label="Voir">
                  <FiEye />
                </Link>
                <button
                  type="button"
                  className="btn-outline px-4"
                  onClick={() => toggleStatus(service)}
                >
                  {service.status ? "Désactiver" : "Activer"}
                </button>
                <button type="button" className="btn-dark px-4" onClick={() => setEditing(service)}>
                  <FiEdit2 /> Modifier
                </button>
                <button
                  type="button"
                  className="btn-ghost px-3 text-red-600 hover:bg-red-50"
                  onClick={() => setToDelete(service)}
                  aria-label="Supprimer"
                >
                  <FiTrash2 />
                </button>
              </div>
            </motion.li>
          ))}
        </ul>
      )}

      <Modal open={Boolean(editing)} title="Modifier le service" onClose={() => setEditing(null)}>
        {editing && (
          <ServiceForm
            showStatus
            initialValues={{
              titre: editing.titre,
              description: editing.description,
              category_id: editing.category_id ? String(editing.category_id) : "",
              status: Boolean(editing.status),
            }}
            currentImage={editing.illustration}
            submitLabel="Enregistrer"
            onSubmit={handleEdit}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Supprimer ce service ?"
        confirmLabel="Supprimer"
        danger
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      >
        « {toDelete?.titre} » et ses commentaires seront définitivement supprimés.
      </ConfirmDialog>
    </div>
  );
}
