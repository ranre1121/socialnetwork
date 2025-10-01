import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import Chat from "./Chat";

type Conversation = {
  username: string;
  name: string;
  lastMessage?: string;
  lastMessageTime?: string;
};

const Messages = () => {
  const { user } = useUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);

  useEffect(() => {
    if (!user) return;

    async function fetchConversations() {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/messages/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setConversations(data);
    }

    fetchConversations();
  }, [user]);

  return (
    <div className="flex h-screen dark:bg-gray-900 justify-center">
      {/* Sidebar with conversations */}
      <div className="w-[300px] border-r dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col ml-[400px]">
        <h2 className="p-4 text-xl font-bold dark:text-white">Messages</h2>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="text-gray-500 text-center mt-5">
              No conversations yet
            </p>
          ) : (
            conversations.map((c) => (
              <div
                key={c.username}
                onClick={() => setSelectedChat(c)}
                className={`p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  selectedChat?.username === c.username
                    ? "bg-gray-100 dark:bg-gray-700"
                    : ""
                }`}
              >
                <p className="font-semibold dark:text-white">{c.name}</p>
                <p className="text-sm text-gray-500 truncate">
                  {c.lastMessage || "No messages yet"}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat section */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <div className="w-full h-full">
            <Chat friendUsername={selectedChat.username} />
          </div>
        ) : (
          <div className="flex items-center justify-center flex-1 text-gray-500">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
