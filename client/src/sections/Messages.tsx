import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import Chat from "./Chat";
import profilePlaceholder from "../../public/images/profile-placeholder.png";
import { useLocation } from "react-router-dom";
import type { Conversation } from "../types/Types";
import { formatMessageTime } from "../utils/messagesUtils";

const Messages = () => {
  const { user } = useUser();
  const location = useLocation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<
    Conversation | null | undefined
  >(null);

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

  useEffect(() => {
    if (location.state) {
      console.log(1);
      console.log(selectedChat);
      console.log(conversations);
      setSelectedChat(
        conversations.find((c) => c.friendUsername === location.state.username)
      );
    }
  }, [conversations]);

  return (
    <div className="flex h-screen py-10 bg-gray-50 dark:bg-gray-900 text-black dark:text-white">
      <div className="flex flex-1 justify-center gap-5 max-w-[1100px] mx-auto pl-[80px]">
        <div className="w-[300px] bg-white dark:bg-gray-800 rounded-2xl shadow-md py-6 flex flex-col border border-gray-200 dark:border-gray-700 h-full overflow-x-hidden">
          <h2 className="text-xl font-semibold mb-4 px-4">Messages</h2>
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {conversations.map((c) => (
              <div
                key={c.friendUsername}
                onClick={() => setSelectedChat(c)}
                className={`py-4.5 px-4 cursor-pointer transition ${
                  selectedChat?.friendUsername === c.friendUsername
                    ? "bg-gray-100 dark:bg-gray-700"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <img
                    src={profilePlaceholder}
                    className="size-8 rounded-full"
                  />

                  <span className="flex flex-col leading-4 w-full">
                    <p className="font-semibold dark:text-white">
                      {c.friendName}
                    </p>

                    <span className="text-xs flex items-center text-gray-400 overflow-hidden">
                      <p className="flex-1 max-w-40 truncate">
                        {c?.lastMessage?.content || "No messages yet"}
                      </p>

                      <p className="ml-auto flex-shrink-0 whitespace-nowrap">
                        {formatMessageTime(c?.lastMessage?.sentAt) || ""}
                      </p>
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 h-full">
          {selectedChat ? (
            <div className="w-full h-full bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-200 dark:border-gray-700 flex flex-col">
              <Chat
                friendUsername={selectedChat.friendUsername}
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
