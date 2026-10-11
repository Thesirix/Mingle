import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "@services/api";
import { useAuth } from "./AuthContext";

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { isLoggedIn } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);

  const refreshConversations = useCallback(async () => {
    const { data } = await api.get("/conversations");
    setConversations(data);
    return data;
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      refreshConversations().catch(() => {});
    } else {
      setIsOpen(false);
      setConversations([]);
      setActiveConversation(null);
    }
  }, [isLoggedIn, refreshConversations]);

  /** Ouvre (ou crée) la conversation avec un utilisateur et affiche la messagerie. */
  const openConversationWith = useCallback(
    async (userId) => {
      const { data } = await api.post("/conversations", { user_id: userId });
      await refreshConversations();
      setActiveConversation(data);
      setIsOpen(true);
    },
    [refreshConversations]
  );

  const value = useMemo(
    () => ({
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      conversations,
      refreshConversations,
      activeConversation,
      setActiveConversation,
      openConversationWith,
    }),
    [isOpen, conversations, refreshConversations, activeConversation, openConversationWith]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat doit être utilisé dans un ChatProvider");
  return context;
};
