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
  const messagesRef = useRef(messages);
  messagesRef.current = messages; // keep ref up to date

  useEffect(() => {
    if (!user) return;

    // fetch history
    async function fetchMessages() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:8000/messages/${friendUsername}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data: Message[] = await res.json();
        console.log("fetched history:", data);
        setMessages(data || []);
      } catch (err) {
        console.error("fetchMessages error", err);
      }
    }

    fetchMessages();

    // create socket connection for this chat (connect only while Chat mounted)
    const socket = io("http://localhost:8000", {
      transports: ["websocket", "polling"], // allow upgrade
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("socket connected", socket.id);
      socket.emit("join", user.username);
    });

    socket.on("connect_error", (err) => {
      console.error("socket connect_error", err);
    });

    socket.on("disconnect", (reason) => {
      console.log("socket disconnect", reason);
    });

    // ensure no duplicate listeners
    socket.off("private_message");
    socket.on("private_message", (message: Message) => {
      console.log("socket private_message received:", message);

      // message belongs to this chat?
      if (
        (message.sender === user.username &&
          message.receiver === friendUsername) ||
        (message.sender === friendUsername &&
          message.receiver === user.username)
      ) {
        // append safely
        setMessages((prev) => [...prev, message]);
      } else {
        console.log("message for other chat; ignoring in this Chat instance");
      }
    });

    return () => {
      console.log("Chat unmount: disconnecting socket for", friendUsername);
      socket.off("private_message");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, friendUsername]);

  const sendMessage = () => {
    if (!newMessage.trim() || !user || !socketRef.current) return;

    const payload = {
      sender: user.username,
      receiver: friendUsername,
      content: newMessage,
    };
    console.log("emitting private_message", payload);

    // use ack callback to confirm server saved+emitted
    socketRef.current.emit("private_message", payload, (ack: any) => {
      console.log("server ack:", ack);
      // optional: if server returns message object, append it
      // if (ack && ack.message) {
      //   setMessages((prev) => [...prev, ack.message]);
      // }
    });

    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-full border rounded-lg bg-gray-50 dark:bg-gray-800">
      <div className="flex-1 overflow-y-auto p-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-2 my-1 rounded w-fit max-w-[50%] break-words whitespace-pre-wrap ${
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
