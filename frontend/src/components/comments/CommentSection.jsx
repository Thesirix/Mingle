import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FiEdit2, FiMessageSquare, FiSend, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import api, { errorMessage } from "@services/api";
import { noInjuries } from "@services/noInjuries";
import { timeAgo } from "@services/format";
import { useAuth } from "@contexts/AuthContext";
import Avatar from "@components/ui/Avatar";
import ConfirmDialog from "@components/ui/ConfirmDialog";

function CommentItem({ comment, onUpdated, onDelete }) {
  const { userId, isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(comment.content);
  const isAuthor = comment.user_id === userId;

  const handleSave = async (event) => {
    event.preventDefault();
    try {
      const { data } = await api.put(`/comments/${comment.id}`, {
        content: noInjuries(content),
      });
      onUpdated(data);
      setIsEditing(false);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex gap-4"
    >
      <Link to={`/profil/${comment.user_id}`}>
        <Avatar src={comment.avatar} name={comment.username} size="sm" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="rounded-2xl rounded-tl-sm bg-cream px-4 py-3">
          <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
            <Link
              to={`/profil/${comment.user_id}`}
              className="text-sm font-bold hover:text-primary"
            >
              {comment.username}
            </Link>
            <span className="text-xs text-dark/45">{timeAgo(comment.created_at)}</span>
          </div>
          {isEditing ? (
            <form onSubmit={handleSave} className="mt-2 space-y-2">
              <label htmlFor={`comment-${comment.id}`} className="sr-only">
                Modifier le commentaire
              </label>
              <textarea
                id={`comment-${comment.id}`}
                className="input"
                rows={3}
                value={content}
                onChange={(event) => setContent(event.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="btn-ghost px-3 py-1.5"
                  onClick={() => {
                    setContent(comment.content);
                    setIsEditing(false);
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-primary px-4 py-1.5"
                  disabled={!content.trim()}
                >
                  Enregistrer
                </button>
              </div>
            </form>
          ) : (
            <p className="whitespace-pre-line text-sm text-dark/80">{comment.content}</p>
          )}
        </div>
        {!isEditing && (isAuthor || isAdmin) && (
          <div className="mt-1 flex gap-3 pl-2 text-xs font-semibold text-dark/50">
            {isAuthor && (
              <button
                type="button"
                className="flex items-center gap-1 hover:text-dark"
                onClick={() => setIsEditing(true)}
              >
                <FiEdit2 /> Modifier
              </button>
            )}
            <button
              type="button"
              className="flex items-center gap-1 hover:text-red-600"
              onClick={() => onDelete(comment)}
            >
              <FiTrash2 /> Supprimer
            </button>
          </div>
        )}
      </div>
    </motion.li>
  );
}

export default function CommentSection({ serviceId }) {
  const { isLoggedIn, user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => {
    api
      .get(`/services/${serviceId}/comments`)
      .then(({ data }) => setComments(data))
      .catch(() => setComments([]));
  }, [serviceId]);

  const handleAdd = async (event) => {
    event.preventDefault();
    if (!newComment.trim()) return;

    setSending(true);
    try {
      const { data } = await api.post(`/services/${serviceId}/comments`, {
        content: noInjuries(newComment),
      });
      setComments((current) => [data, ...current]);
      setNewComment("");
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/comments/${toDelete.id}`);
      setComments((current) => current.filter((comment) => comment.id !== toDelete.id));
      toast.success("Commentaire supprimé");
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setToDelete(null);
    }
  };

  return (
    <section className="card p-6 sm:p-8" aria-labelledby="comments-title">
      <h2 id="comments-title" className="mb-6 flex items-center gap-2 text-xl">
        <FiMessageSquare className="text-primary" /> Commentaires
        <span className="badge bg-light text-dark">{comments.length}</span>
      </h2>

      {isLoggedIn ? (
        <form onSubmit={handleAdd} className="mb-8 flex gap-3">
          <Avatar src={user?.avatar} name={user?.username} size="sm" />
          <div className="flex-1">
            <label htmlFor="new-comment" className="sr-only">
              Votre commentaire
            </label>
            <textarea
              id="new-comment"
              className="input"
              rows={2}
              placeholder="Partagez votre expérience…"
              value={newComment}
              onChange={(event) => setNewComment(event.target.value)}
            />
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                className="btn-primary"
                disabled={sending || !newComment.trim()}
              >
                <FiSend /> Publier
              </button>
            </div>
          </div>
        </form>
      ) : (
        <p className="mb-8 rounded-2xl bg-light/50 px-4 py-3 text-sm">
          <Link to="/connexion" className="font-bold text-primary hover:underline">
            Connectez-vous
          </Link>{" "}
          pour laisser un commentaire.
        </p>
      )}

      {comments.length === 0 ? (
        <p className="text-center text-sm text-dark/50">
          Aucun commentaire pour le moment. Soyez le premier !
        </p>
      ) : (
        <ul className="space-y-5">
          <AnimatePresence initial={false}>
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onUpdated={(updated) =>
                  setComments((current) =>
                    current.map((item) => (item.id === updated.id ? updated : item))
                  )
                }
                onDelete={setToDelete}
              />
            ))}
          </AnimatePresence>
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Supprimer ce commentaire ?"
        confirmLabel="Supprimer"
        danger
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      >
        Cette action est définitive.
      </ConfirmDialog>
    </section>
  );
}
