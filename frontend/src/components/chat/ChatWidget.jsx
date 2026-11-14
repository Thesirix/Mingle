import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiMessageCircle, FiX } from "react-icons/fi";
import { useAuth } from "@contexts/AuthContext";
import { useChat } from "@contexts/ChatContext";
import ConversationList from "./ConversationList";
import ConversationView from "./ConversationView";

const REFRESH_INTERVAL = 15000;

export default function ChatWidget() {
  const { isLoggedIn } = useAuth();
  const { isOpen, open, close, activeConversation, setActiveConversation, refreshConversations } =
    useChat();

  // Rafraîchit la liste des conversations tant que la messagerie est ouverte
  useEffect(() => {
    if (!isOpen) return undefined;
    refreshConversations().catch(() => {});
    const interval = setInterval(() => refreshConversations().catch(() => {}), REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [isOpen, refreshConversations]);

  if (!isLoggedIn) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[80] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {isOpen && (
          <motion.section
            aria-label="Messagerie"
            className="flex h-[min(620px,calc(100vh-7rem))] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-dark/5 bg-white shadow-soft sm:w-[400px]"
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            style={{ transformOrigin: "bottom right" }}
          >
            {!activeConversation && (
              <header className="flex items-center justify-between bg-dark px-5 py-4 text-white">
                <h2 className="text-lg text-white">Messagerie</h2>
                <button
                  type="button"
                  className="rounded-full p-1.5 hover:bg-white/10"
                  onClick={close}
                  aria-label="Fermer la messagerie"
                >
                  <FiX className="text-xl" />
                </button>
              </header>
            )}
            <div className="min-h-0 flex-1">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeConversation?.id ?? "list"}
                  className="h-full"
                  initial={{ opacity: 0, x: activeConversation ? 30 : -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: activeConversation ? -30 : 30 }}
                  transition={{ duration: 0.18 }}
                >
                  {activeConversation ? (
                    <ConversationView
                      conversation={activeConversation}
                      onBack={() => setActiveConversation(null)}
                    />
                  ) : (
                    <ConversationList />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={isOpen ? close : open}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl text-white shadow-lg shadow-primary/40"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        aria-label={isOpen ? "Fermer la messagerie" : "Ouvrir la messagerie"}
        aria-expanded={isOpen}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isOpen ? "close" : "open"}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {isOpen ? <FiX /> : <FiMessageCircle />}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
