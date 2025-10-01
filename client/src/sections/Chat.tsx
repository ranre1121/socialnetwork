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
};

const Chat = ({ friendUsername }: ChatProps) => {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!user) return;

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

    const socket = io("http://localhost:8000", {
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.emit("join", user.username);

    socket.on("private_message", (message: Message) => {
      if (
        (message.sender === user.username &&
          message.receiver === friendUsername) ||
        (message.sender === friendUsername &&
          message.receiver === user.username)
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user, friendUsername]);

  // scroll to bottom when messages change
  // scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" }); // 👈 instant
    }
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim() || !user || !socketRef.current) return;

    const payload = {
      sender: user.username,
      receiver: friendUsername,
      content: newMessage,
    };
    socketRef.current.emit("private_message", payload);
    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-full pb-3">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-2xl max-w-[70%] ${
              msg.sender === user?.username
                ? "ml-auto bg-blue-600 text-white"
                : "mr-auto bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
            }`}
          >
            <p>{msg.content}</p>
            <div className="text-xs opacity-70 mt-1">
              {new Date(msg.createdAt).toLocaleTimeString()}
            </div>
          </div>
        ))}
        {/* invisible div for auto-scroll */}
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
