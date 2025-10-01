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
    <div className="flex h-screen py-10 bg-white dark:bg-gray-900 text-black dark:text-white">
      {/* Centered container (accounts for Navbar on the left) */}
      <div className="flex flex-1 justify-center gap-5 max-w-[1100px] mx-auto pl-[80px]">
        {/* Sidebar */}
        <div className="w-[300px] bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 flex flex-col border border-gray-200 dark:border-gray-700 h-full">
          <h2 className="text-xl font-semibold mb-4">Messages</h2>
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
                  className={`p-3 rounded-lg cursor-pointer mb-2 transition ${
                    selectedChat?.username === c.username
                      ? "bg-gray-100 dark:bg-gray-700"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
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

        {/* Chat Section */}
        <div className="flex-1 h-full">
          {selectedChat ? (
            <div className="w-full h-full bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-200 dark:border-gray-700 flex flex-col">
              <Chat friendUsername={selectedChat.username} />
            </div>
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 text-gray-500">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
