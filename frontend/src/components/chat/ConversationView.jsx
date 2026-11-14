import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiSend, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import api, { errorMessage } from "@services/api";
import { formatDate } from "@services/format";
import { noInjuries } from "@services/noInjuries";
import { useAuth } from "@contexts/AuthContext";
import { useChat } from "@contexts/ChatContext";
import Avatar from "@components/ui/Avatar";
import ConfirmDialog from "@components/ui/ConfirmDialog";

const POLL_INTERVAL = 4000;

export default function ConversationView({ conversation, onBack }) {
  const { userId } = useAuth();
  const { refreshConversations, setActiveConversation } = useChat();
  const [messages, setMessages] = useState(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      api
        .get(`/conversations/${conversation.id}/messages`)
        .then(({ data }) => !cancelled && setMessages(data))
        .catch(() => !cancelled && setMessages((current) => current ?? []));

    load();
    inputRef.current?.focus();
    const interval = setInterval(load, POLL_INTERVAL);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [conversation.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  const handleSend = async (event) => {
    event.preventDefault();
    const content = noInjuries(draft.trim());
    if (!content) return;

    setSending(true);
    try {
      const { data } = await api.post(`/conversations/${conversation.id}/messages`, { content });
      setMessages((current) => [...(current ?? []), data]);
      setDraft("");
      refreshConversations().catch(() => {});
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/conversations/${conversation.id}`);
      await refreshConversations();
      setActiveConversation(null);
      toast.success("Conversation supprimée");
    } catch (error) {
      toast.error(errorMessage(error));
      setConfirmDelete(false);
    }
  };

  // Regroupe les messages par jour pour afficher des séparateurs de date
  let lastDay = null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-dark/5 px-4 py-3">
        <button
          type="button"
          className="btn-ghost p-2"
          onClick={onBack}
          aria-label="Retour aux conversations"
        >
          <FiArrowLeft />
        </button>
        <Link
          to={`/profil/${conversation.other_id}`}
          className="flex min-w-0 flex-1 items-center gap-3"
        >
          <Avatar src={conversation.other_avatar} name={conversation.other_username} size="sm" />
          <span className="truncate font-bold hover:text-primary">
            {conversation.other_username}
          </span>
        </Link>
        <button
          type="button"
          className="btn-ghost p-2 text-dark/50 hover:bg-red-50 hover:text-red-600"
          onClick={() => setConfirmDelete(true)}
          aria-label="Supprimer la conversation"
        >
          <FiTrash2 />
        </button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto bg-cream/60 px-4 py-4">
        {messages?.length === 0 && (
          <p className="mt-8 text-center text-sm text-dark/50">
            Démarrez la conversation avec {conversation.other_username} 👋
          </p>
        )}
        {messages?.map((message) => {
          const isMine = message.sender_id === userId;
          const day = formatDate(message.sent_at, "EEEE d MMMM");
          const showDay = day !== lastDay;
          lastDay = day;

          return (
            <div key={message.id}>
              {showDay && (
                <p className="my-3 text-center text-[11px] font-semibold uppercase tracking-wider text-dark/40">
                  {day}
                </p>
              )}
              <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                    isMine
                      ? "rounded-br-md bg-primary text-white"
                      : "rounded-bl-md bg-white text-dark"
                  }`}
                >
                  <p className="whitespace-pre-line break-words">{message.content}</p>
                  <p
                    className={`mt-1 text-right text-[10px] ${
                      isMine ? "text-white/70" : "text-dark/40"
                    }`}
                  >
                    {formatDate(message.sent_at, "HH:mm")}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-dark/5 p-3">
        <label htmlFor="chat-input" className="sr-only">
          Votre message
        </label>
        <input
          id="chat-input"
          ref={inputRef}
          type="text"
          className="input rounded-full"
          placeholder="Écrire un message…"
          maxLength={1000}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          autoComplete="off"
        />
        <button
          type="submit"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary-dark disabled:opacity-50"
          disabled={sending || !draft.trim()}
          aria-label="Envoyer"
        >
          <FiSend />
        </button>
      </form>

      <ConfirmDialog
        open={confirmDelete}
        title="Supprimer cette conversation ?"
        confirmLabel="Supprimer"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      >
        Tous les messages échangés avec {conversation.other_username} seront supprimés pour vous
        deux.
      </ConfirmDialog>
    </div>
  );
}
