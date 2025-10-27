import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useUser } from "../context/UserContext";
import type { Message } from "../types/Types";

type ChatProps = {
  friendUsername: string;
  onFetch: () => void;
};

const Chat = ({ friendUsername }: ChatProps) => {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const handlePrivateMessage = (message: Message) => {
    if (!message) return;
    if (message.sender === user?.username) return;
    setMessages((prev) =>
      [...prev, message].sort(
        (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
      )
    );
  };

  useEffect(() => {
    if (!user || socketRef.current) return;
    const socket = io("http://localhost:8000");
    socketRef.current = socket;
    socket.on("connect", () => {
      socket.emit("join", user.username);
    });
    socket.on("private_message", handlePrivateMessage);
    socket.on("connect_error", (err) => console.error(err));
    socket.on("disconnect", () => {});
    return () => {
      socket.off("private_message", handlePrivateMessage);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  useEffect(() => {
    if (!user || !friendUsername) return;
    async function fetchMessages() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:8000/messages/${friendUsername}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error("Failed to fetch messages");
        const data: Message[] = await res.json();
        setMessages(
          data.sort(
            (a, b) =>
              new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
          )
        );
      } catch (err) {
        console.error(err);
      }
    }
    fetchMessages();
  }, [user, friendUsername]);

  const sendMessage = () => {
    if (!newMessage.trim() || !user || !socketRef.current) return;
    const payload = {
      sender: user.username,
      receiver: friendUsername,
      content: newMessage.trim(),
    };
    const optimisticMessage: any = {
      content: newMessage.trim(),
      senderUsername: user.username,
      receiverUsername: friendUsername,
      status: "sent",
      sentAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);
    socketRef.current.emit("private_message", payload);

    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-5 pl-3 h-full py-2">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            No messages yet
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded-2xl w-fit max-w-[50%] flex flex-col ${
                msg.status === "sent"
                  ? "ml-auto bg-blue-600 text-white text-right"
                  : "mr-auto bg-gray-200 dark:bg-gray-700 text-black dark:text-white text-left"
              }`}
            >
              <span className="flex gap-3 items-center">
                <p className="break-words break-all whitespace-pre-wrap">
                  {msg.content}
                </p>
                <p className="text-sm text-gray-300 self-end">
                  {new Date(msg.sentAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex items-center border-t pt-3 mt-3 px-5 ">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white focus:outline-none"
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="ml-3 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
