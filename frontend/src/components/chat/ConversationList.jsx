import { useEffect, useState } from "react";
import { FiSearch, FiUserPlus } from "react-icons/fi";
import { toast } from "react-toastify";
import api, { errorMessage } from "@services/api";
import { shortDateTime } from "@services/format";
import { useAuth } from "@contexts/AuthContext";
import { useChat } from "@contexts/ChatContext";
import Avatar from "@components/ui/Avatar";

export default function ConversationList() {
  const { userId } = useAuth();
  const { conversations, setActiveConversation, openConversationWith } = useChat();
  const [friends, setFriends] = useState([]);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    api
      .get("/friends")
      .then(({ data }) => setFriends(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const term = search.trim();
    if (term.length < 2) {
      setResults([]);
      return undefined;
    }
    const timeout = setTimeout(() => {
      api
        .get("/users", { params: { search: term } })
        .then(({ data }) => setResults(data.filter((user) => user.id !== userId)))
        .catch(() => setResults([]));
    }, 250);
    return () => clearTimeout(timeout);
  }, [search, userId]);

  const startConversation = async (user) => {
    try {
      await openConversationWith(user.id);
      setSearch("");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const addFriend = async (user) => {
    try {
      const { data } = await api.post("/friends", { friend_id: user.id });
      setFriends(data);
      toast.success(`${user.username} a été ajouté(e) à vos amis`);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const friendIds = new Set(friends.map((friend) => friend.id));

  return (
    <div className="flex h-full flex-col">
      <div className="p-4 pb-2">
        <div className="relative">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark/40" />
          <label htmlFor="chat-search" className="sr-only">
            Rechercher un membre
          </label>
          <input
            id="chat-search"
            type="search"
            className="input rounded-full pl-10"
            placeholder="Rechercher un membre…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {search.trim().length >= 2 ? (
          <ul className="px-2">
            {results.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-dark/50">Aucun membre trouvé</li>
            )}
            {results.map((user) => (
              <li
                key={user.id}
                className="flex items-center gap-3 rounded-2xl px-3 py-2 hover:bg-cream"
              >
                <Avatar src={user.avatar} name={user.username} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{user.username}</p>
                  <p className="truncate text-xs text-dark/50">{user.localisation}</p>
                </div>
                {!friendIds.has(user.id) && (
                  <button
                    type="button"
                    className="btn-ghost p-2"
                    onClick={() => addFriend(user)}
                    aria-label={`Ajouter ${user.username} en ami`}
                  >
                    <FiUserPlus />
                  </button>
                )}
                <button
                  type="button"
                  className="btn-primary px-3 py-1.5 text-xs"
                  onClick={() => startConversation(user)}
                >
                  Écrire
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <>
            {friends.length > 0 && (
              <div className="px-4 pb-2 pt-2">
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-dark/40">
                  Mes amis
                </p>
                <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
                  {friends.map((friend) => (
                    <button
                      key={friend.id}
                      type="button"
                      className="flex w-14 shrink-0 flex-col items-center gap-1 text-center"
                      onClick={() => startConversation(friend)}
                    >
                      <Avatar src={friend.avatar} name={friend.username} size="md" />
                      <span className="w-full truncate text-[11px] font-medium">
                        {friend.username.split(" ")[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="px-4 pb-1 pt-2 text-xs font-bold uppercase tracking-widest text-dark/40">
              Conversations
            </p>
            {conversations.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-dark/50">
                Aucune conversation pour l&apos;instant. Recherchez un membre ou contactez
                l&apos;auteur d&apos;un service pour commencer.
              </p>
            ) : (
              <ul className="px-2 pb-2">
                {conversations.map((conversation) => (
                  <li key={conversation.id}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-cream"
                      onClick={() => setActiveConversation(conversation)}
                    >
                      <Avatar
                        src={conversation.other_avatar}
                        name={conversation.other_username}
                        size="md"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="truncate font-semibold">{conversation.other_username}</p>
                          <span className="shrink-0 text-[11px] text-dark/40">
                            {shortDateTime(
                              conversation.last_message_time ?? conversation.created_at
                            )}
                          </span>
                        </div>
                        <p className="truncate text-sm text-dark/55">
                          {conversation.last_message ?? "Nouvelle conversation"}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}
