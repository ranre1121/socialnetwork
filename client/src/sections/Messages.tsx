import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import Chat from "./Chat";
import profilePlaceholder from "../../public/images/profile-placeholder.png";

type Conversation = {
  username: string;
  name: string;
  lastMessage?: string;
  lastMessageTime?: string;
};

function formatMessageTime(dateString: string | undefined): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (isYesterday) {
    return "Yesterday";
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" }); // e.g. Sep 28
}

const Messages = () => {
  const { user } = useUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);

  async function fetchConversations() {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:8000/messages/conversations", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setConversations(data);
  }

  useEffect(() => {
    if (!user) return;

    fetchConversations();
  }, [user]);

  return (
    <div className="flex h-screen py-10 bg-white dark:bg-gray-900 text-black dark:text-white">
      {/* Centered container (accounts for Navbar on the left) */}
      <div className="flex flex-1 justify-center gap-5 max-w-[1100px] mx-auto pl-[80px]">
        {/* Sidebar */}
        <div className="w-[300px] bg-white dark:bg-gray-800 rounded-2xl shadow-md py-6 flex flex-col border border-gray-200 dark:border-gray-700 h-full">
          <h2 className="text-xl font-semibold mb-4 px-4">Messages</h2>
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
                  className={`py-4.5 px-4  cursor-pointer  transition ${
                    selectedChat?.username === c.username
                      ? "bg-gray-100 dark:bg-gray-700"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={profilePlaceholder}
                      className="size-8 rounded-full "
                    />

                    <span className="flex flex-col leading-4 w-full">
                      <p className="font-semibold dark:text-white">{c.name}</p>
                      <span className="flex w-full">
                        <p className="text-sm text-gray-500 truncate">
                          {c.lastMessage || "No messages yet"}
                        </p>
                        <p className="ml-auto text-xs text-gray-500">
                          {formatMessageTime(c.lastMessageTime)}
                        </p>
                      </span>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Section */}
        <div className="flex-1 h-full">
          {selectedChat ? (
            <div className="w-full h-full bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-200 dark:border-gray-700 flex flex-col">
              <Chat
                friendUsername={selectedChat.username}
                onFetch={() => fetchConversations()}
              />
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
