import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useUser } from "../context/UserContext";
import type { Message } from "../types/Types";

type ChatProps = {
  friendUsername: string;
  onFetch: () => void;
};

const Chat = ({ friendUsername, onFetch }: ChatProps) => {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const handlePrivateMessage = (message: Message) => {
    if (!message) return;
    if (message.senderUsername === user?.username) return;
    setMessages((prev) =>
      [...prev, message].sort(
        (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
      )
    );
    onFetch();
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim() || !user || !socketRef.current) return;
    const payload = {
      sender: user.username,
      receiver: friendUsername,
      content: newMessage.trim(),
    };
    const optimisticMessage: Message = {
      id: Date.now(),
      chatId: 0,
      senderId: user.id,
      receiverId: 0,
      content: newMessage.trim(),
      sentAt: new Date().toISOString(),
      senderUsername: user.username,
      receiverUsername: friendUsername,
      status: "sent",
    };
    setMessages((prev) => [...prev, optimisticMessage]);
    socketRef.current.emit("private_message", payload);
    setNewMessage("");
  };

  return (
    <div className="flex-1 overflow-y-auto space-y-3 flex flex-col justify-end">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
          No messages yet
        </div>
      ) : (
        messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-3 rounded-2xl w-fit max-w-[50%] flex items-center gap-2 ${
              msg.status === "sent"
                ? "ml-auto bg-blue-600 text-white text-right"
                : "mr-auto bg-gray-200 dark:bg-gray-700 text-black dark:text-white text-left"
            }`}
          >
            <p className="break-words break-all whitespace-pre-wrap">
              {msg.content}
            </p>
            <div className="text-xs opacity-70 mt-1 text-right">
              {new Date(msg.sentAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default Chat;
