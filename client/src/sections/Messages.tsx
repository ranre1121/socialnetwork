import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import Chat from "./Chat";
import profilePlaceholder from "../../public/images/profile-placeholder.png";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import type { Conversation } from "../types/Types";
import { formatMessageTime } from "../utils/messagesUtils";

const Messages = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchConversations() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/messages/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setConversations(data);
    } catch (err) {
      console.error("Error fetching conversations:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!user) return;
    fetchConversations();
  }, [user]);

  useEffect(() => {
    if (location.state?.username && conversations.length > 0) {
      const target = conversations.find(
        (c) => c.companion.username === location.state.username
      );
      setSelectedChat(target || null);
    }
  }, [conversations, location.state]);

  return (
    <div className="flex h-screen w-screen py-10 bg-gray-50 dark:bg-gray-900 text-black dark:text-white">
      <div className="flex flex-1 flex-col items-center justify-start">
        <div className="w-[850px] h-[900px] bg-white dark:bg-gray-800 rounded-2xl shadow-md py-5 px-2 flex flex-col overflow-hidden">
          {!selectedChat ? (
            <>
              <h1 className="text-xl font-semibold mb-2 mx-4 border-b border-gray-700 pb-5">
                Messages
              </h1>

              <div className="flex-1 overflow-y-auto flex flex-col gap-2">
                {loading ? (
                  <div className="size-5 mt-5 border-2 border-indigo-500 rounded-full animate-spin border-t-transparent self-center" />
                ) : conversations.length === 0 ? (
                  <p className="text-gray-400 dark:text-gray-500 self-center mt-2">
                    No conversations yet
                  </p>
                ) : (
                  conversations.map((c) => (
                    <div
                      key={c.companion.username}
                      onClick={() => setSelectedChat(c)}
                      className="py-4 px-4 flex rounded-lg items-center gap-3 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition"
                    >
                      <img
                        src={profilePlaceholder}
                        alt="profile"
                        className="size-10 rounded-full"
                      />
                      <div className="flex flex-col w-full leading-5">
                        <p className="font-semibold">{c.companion.username}</p>
                        <div className="flex text-sm text-gray-500 dark:text-gray-300">
                          <span className="truncate flex-1">
                            {c.lastMessage?.content || "No messages yet"}
                          </span>
                          <span className="ml-auto flex-shrink-0 text-xs">
                            {formatMessageTime(c.lastMessage?.sentAt) || ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-5 px-3">
                <button
                  onClick={() => {
                    if (location.state) location.state = null;
                    setSelectedChat(null);
                    fetchConversations();
                  }}
                  className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <ArrowLeft className="size-5 text-gray-600 dark:text-gray-300" />
                </button>
                <h2
                  className="text-lg font-semibold cursor-pointer hover:underline"
                  onClick={() => {
                    navigate(`/profile/${selectedChat.companion.username}`);
                  }}
                >
                  @{selectedChat.companion.username}
                </h2>
              </div>
              <div className="flex-1 flex flex-col overflow-hidden border-t border-gray-200 dark:border-gray-500">
                <Chat
                  friendUsername={selectedChat.companion.username}
                  onFetch={() => fetchConversations()}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
