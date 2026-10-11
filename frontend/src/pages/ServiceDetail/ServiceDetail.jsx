import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft, FiCalendar, FiEdit2, FiMapPin, FiMessageCircle, FiTag } from "react-icons/fi";
import { toast } from "react-toastify";
import api, { errorMessage } from "@services/api";
import { formatDate } from "@services/format";
import { useAuth } from "@contexts/AuthContext";
import { useChat } from "@contexts/ChatContext";
import Avatar from "@components/ui/Avatar";
import Loader from "@components/ui/Loader";
import EmptyState from "@components/ui/EmptyState";
import { ServiceImage } from "@components/services/ServiceCard";
import CommentSection from "@components/comments/CommentSection";

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, userId } = useAuth();
  const { openConversationWith } = useChat();
  const [service, setService] = useState(undefined);

  useEffect(() => {
    api
      .get(`/services/${id}`)
      .then(({ data }) => setService(data))
      .catch(() => setService(null));
  }, [id]);

  if (service === undefined) return <Loader />;

  if (service === null) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title="Service introuvable"
          action={
            <Link to="/services" className="btn-primary">
              Voir tous les services
            </Link>
          }
        >
          Ce service n&apos;existe pas ou a été désactivé par son auteur.
        </EmptyState>
      </div>
    );
  }

  const isOwner = service.user_id === userId;

  const handleContact = async () => {
    if (!isLoggedIn) {
      navigate("/connexion", { state: { from: `/services/${id}` } });
      return;
    }
    try {
      await openConversationWith(service.user_id);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  return (
    <div className="container-page py-10">
      <button type="button" onClick={() => navigate(-1)} className="btn-ghost -ml-3 mb-6">
        <FiArrowLeft /> Retour
      </button>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <motion.div
            className="aspect-[16/9] overflow-hidden rounded-4xl shadow-soft"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <ServiceImage service={service} />
          </motion.div>

          <article className="card p-6 sm:p-8">
            <div className="mb-4 flex flex-wrap gap-2">
              {service.category_titre && (
                <Link
                  to={`/services?categorie=${service.category_id}`}
                  className="badge bg-light text-dark hover:bg-secondary"
                >
                  <FiTag /> {service.category_titre}
                </Link>
              )}
              <span className="badge bg-cream text-dark/60">
                <FiCalendar /> Publié le {formatDate(service.created_at)}
              </span>
              {!service.status && <span className="badge bg-dark text-white">Désactivé</span>}
            </div>
            <h1 className="text-3xl sm:text-4xl">{service.titre}</h1>
            <p className="mt-6 whitespace-pre-line leading-relaxed text-dark/75">
              {service.description}
            </p>
          </article>

          <CommentSection serviceId={service.id} />
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6 text-center">
            <Avatar src={service.avatar} name={service.username} size="xl" className="mx-auto" />
            <p className="mt-4 text-sm text-dark/50">Proposé par</p>
            <h2 className="text-xl">{service.username}</h2>
            <p className="mt-1 flex items-center justify-center gap-1 text-sm text-dark/60">
              <FiMapPin /> {service.localisation}
            </p>

            <div className="mt-6 space-y-3">
              {isOwner ? (
                <Link to="/tableau-de-bord" className="btn-dark w-full">
                  <FiEdit2 /> Gérer mes services
                </Link>
              ) : (
                <button type="button" className="btn-primary w-full" onClick={handleContact}>
                  <FiMessageCircle /> Contacter {service.username.split(" ")[0]}
                </button>
              )}
              <Link to={`/profil/${service.user_id}`} className="btn-outline w-full">
                Voir le profil
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
