import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useUser } from "../context/UserContext";

type Message = {
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
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!user) return;

    // ✅ fetch old messages first
    async function fetchMessages() {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8000/messages/${friendUsername}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setMessages(data);
    }

    fetchMessages();

    // ✅ connect socket for live updates
    const newSocket = io("http://localhost:8000");
    setSocket(newSocket);

    newSocket.emit("join", user.username);

    newSocket.on("private_message", (message: Message) => {
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
      newSocket.disconnect();
    };
  }, [user, friendUsername]);

  const sendMessage = () => {
    if (!newMessage.trim() || !user || !socket) return;

    socket.emit("private_message", {
      sender: user.username,
      receiver: friendUsername,
      content: newMessage,
    });

    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-[500px] w-[400px] border rounded-lg bg-gray-50 dark:bg-gray-800">
      <div className="flex-1 overflow-y-auto p-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-2 my-1 rounded max-w-[70%] ${
              msg.sender === user?.username
                ? "ml-auto bg-blue-500 text-white"
                : "mr-auto bg-gray-300 dark:bg-gray-600"
            }`}
          >
            {msg.content}
            <div className="text-xs opacity-70">
              {new Date(msg.createdAt).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      <div className="flex border-t">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 p-2 dark:bg-gray-700 dark:text-white"
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} className="px-4 bg-blue-600 text-white">
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
