import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useUser } from "../context/UserContext";

type Message = {
  id?: number;
  sender: string;
  receiver: string;
  content: string;
  createdAt: string;
};

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

  useEffect(() => {
    if (!user) return;
    if (socketRef.current) return;

    const socket = io("http://localhost:8000");

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join", user.username);
    });

    socket.on("connect_error", (err) => {
      console.error("[socket] connect_error", err);
    });

    const handlePrivateMessage = (message: Message) => {
      setMessages((prev) => {
        const exists = prev.some((m) => {
          if (message.id && m.id && m.id === message.id) return true;

          return (
            m.sender === message.sender &&
            m.content === message.content &&
            m.createdAt === message.createdAt
          );
        });
        if (exists) {
          return prev;
        }
        onFetch();
        return [...prev, message];
      });
    };

    socket.on("private_message", handlePrivateMessage);

    socket.on("disconnect", (reason) => {
      console.debug("[socket] disconnected:", reason);
    });

    return () => {
      console.debug("[socket] cleanup: removing listeners and disconnecting");
      socket.off("private_message", handlePrivateMessage);
      socket.off("connect");
      socket.off("connect_error");
      socket.off("reconnect");
      socket.off("disconnect");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (!friendUsername) return;

    async function fetchMessages() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:8000/messages/${friendUsername}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data: Message[] = await res.json();
        setMessages(data || []);
      } catch (err) {
        console.error("fetchMessages error", err);
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

    socketRef.current.emit("private_message", payload);

    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-full pb-3">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id ?? `${msg.sender}-${msg.createdAt}`}
            className={`p-3 rounded-2xl max-w-[70%] ${
              msg.sender === user?.username
                ? "ml-auto bg-blue-600 text-white"
                : "mr-auto bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
            }`}
          >
            <p className="break-words break-all whitespace-pre-wrap">
              {msg.content}
            </p>
            <div className="text-xs opacity-70 mt-1">
              {new Date(msg.createdAt).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex items-center border-t pt-3 mt-3">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white focus:outline-none"
          placeholder="Type a message..."
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
