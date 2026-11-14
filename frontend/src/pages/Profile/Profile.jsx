import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiCalendar,
  FiEdit2,
  FiMail,
  FiMapPin,
  FiMessageCircle,
  FiTrash2,
  FiUserCheck,
  FiUserPlus,
} from "react-icons/fi";
import { toast } from "react-toastify";
import api, { errorMessage } from "@services/api";
import { formatDate } from "@services/format";
import { useAuth } from "@contexts/AuthContext";
import { useChat } from "@contexts/ChatContext";
import Avatar from "@components/ui/Avatar";
import Loader from "@components/ui/Loader";
import EmptyState from "@components/ui/EmptyState";
import ConfirmDialog from "@components/ui/ConfirmDialog";
import ServiceGrid from "@components/services/ServiceGrid";

export default function Profile() {
  const { userId: routeId } = useParams();
  const profileId = Number(routeId);
  const navigate = useNavigate();
  const { isLoggedIn, userId, logout } = useAuth();
  const { openConversationWith } = useChat();

  const [profile, setProfile] = useState(undefined);
  const [services, setServices] = useState([]);
  const [isFriend, setIsFriend] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isOwnProfile = isLoggedIn && profileId === userId;

  useEffect(() => {
    setProfile(undefined);
    api
      .get(`/users/${profileId}`)
      .then(({ data }) => setProfile(data))
      .catch(() => setProfile(null));
    api
      .get("/services", { params: { userId: profileId } })
      .then(({ data }) => setServices(data))
      .catch(() => setServices([]));
  }, [profileId]);

  useEffect(() => {
    if (!isLoggedIn || isOwnProfile) return;
    api
      .get("/friends")
      .then(({ data }) => setIsFriend(data.some((friend) => friend.id === profileId)))
      .catch(() => {});
  }, [isLoggedIn, isOwnProfile, profileId]);

  const requireLogin = () => navigate("/connexion", { state: { from: `/profil/${profileId}` } });

  const toggleFriend = async () => {
    if (!isLoggedIn) return requireLogin();
    try {
      if (isFriend) {
        await api.delete(`/friends/${profileId}`);
        toast.info(`${profile.username} a été retiré(e) de vos amis`);
      } else {
        await api.post("/friends", { friend_id: profileId });
        toast.success(`${profile.username} a été ajouté(e) à vos amis`);
      }
      setIsFriend(!isFriend);
    } catch (error) {
      toast.error(errorMessage(error));
    }
    return undefined;
  };

  const handleContact = async () => {
    if (!isLoggedIn) return requireLogin();
    try {
      await openConversationWith(profileId);
    } catch (error) {
      toast.error(errorMessage(error));
    }
    return undefined;
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete(`/users/${userId}`);
      logout();
      toast.success("Votre compte a été supprimé. Merci d'avoir fait partie de Mingle.");
      navigate("/");
    } catch (error) {
      toast.error(errorMessage(error));
      setConfirmDelete(false);
    }
  };

  if (profile === undefined) return <Loader />;

  if (profile === null) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title="Profil introuvable"
          action={
            <Link to="/" className="btn-primary">
              Retour à l&apos;accueil
            </Link>
          }
        >
          Ce membre n&apos;existe pas ou a supprimé son compte.
        </EmptyState>
      </div>
    );
  }

  const serviceTypes = profile.service_type
    ? profile.service_type
        .split(",")
        .map((type) => type.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="container-page py-12">
      <motion.section
        className="card relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="h-32 bg-gradient-to-r from-primary via-secondary to-light sm:h-40" />
        <div className="px-6 pb-8 sm:px-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <Avatar
                src={profile.avatar}
                name={profile.username}
                size="xl"
                className="-mt-14 ring-4 sm:-mt-16"
              />
              <div className="pb-1 pt-1 sm:pt-4">
                <h1 className="text-3xl">{profile.username}</h1>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-dark/60">
                  <span className="flex items-center gap-1.5">
                    <FiMapPin /> {profile.localisation}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FiCalendar /> Membre depuis {formatDate(profile.created_at, "MMMM yyyy")}
                  </span>
                  {profile.mail && (
                    <span className="flex items-center gap-1.5">
                      <FiMail /> {profile.mail}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {isOwnProfile ? (
                <>
                  <Link to="/profil/modifier" className="btn-dark">
                    <FiEdit2 /> Modifier mon profil
                  </Link>
                  <button
                    type="button"
                    className="btn-outline text-red-600 hover:border-red-200 hover:bg-red-50"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <FiTrash2 /> Supprimer mon compte
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className="btn-primary" onClick={handleContact}>
                    <FiMessageCircle /> Contacter
                  </button>
                  <button type="button" className="btn-outline" onClick={toggleFriend}>
                    {isFriend ? <FiUserCheck /> : <FiUserPlus />}
                    {isFriend ? "Ami(e)" : "Ajouter en ami"}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="mt-8 grid gap-8 md:grid-cols-[2fr_1fr]">
            <div>
              <h2 className="mb-2 text-sm font-bold uppercase tracking-widest text-dark/45">
                À propos
              </h2>
              <p className="whitespace-pre-line text-dark/75">
                {profile.biographie ||
                  (isOwnProfile
                    ? "Vous n'avez pas encore rédigé de biographie. Présentez-vous à la communauté !"
                    : "Ce membre n'a pas encore rédigé de biographie.")}
              </p>
            </div>
            <div>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-dark/45">
                Services proposés
              </h2>
              {serviceTypes.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {serviceTypes.map((type) => (
                    <span key={type} className="badge bg-light text-dark">
                      {type}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-dark/50">Non renseigné</p>
              )}
            </div>
          </div>
        </div>
      </motion.section>

      <section className="mt-14">
        <h2 className="mb-6 text-2xl">
          {isOwnProfile ? "Mes services" : `Les services de ${profile.username.split(" ")[0]}`}
          <span className="ml-3 text-base font-semibold text-dark/40">{services.length}</span>
        </h2>
        {services.length > 0 ? (
          <ServiceGrid services={services} />
        ) : (
          <EmptyState
            title="Aucun service publié"
            action={
              isOwnProfile && (
                <Link to="/publier" className="btn-primary">
                  Publier un service
                </Link>
              )
            }
          />
        )}
      </section>

      <ConfirmDialog
        open={confirmDelete}
        title="Supprimer définitivement votre compte ?"
        confirmLabel="Supprimer mon compte"
        danger
        onConfirm={handleDeleteAccount}
        onCancel={() => setConfirmDelete(false)}
      >
        Vos services, commentaires et conversations seront supprimés. Cette action est irréversible.
      </ConfirmDialog>
    </div>
  );
}
