import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useUser } from "../context/UserContext";
import type { Message } from "../types/Types";
import { formatMessageDate } from "../utils/utils";

type ChatProps = {
  friendUsername: string;
  onFetch: () => void;
};

const Chat = ({ friendUsername }: ChatProps) => {
  const { user } = useUser();
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [hasMore, setHasMore] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const lastMessageRef = useRef(null);

  // Handle incoming socket messages
  const handlePrivateMessage = (message: Message) => {
    if (!message || message.sender === user?.username) return;

    const date = new Date(message.sentAt);
    const key = `${date.getFullYear()}:${
      date.getMonth() + 1
    }:${date.getDate()}`;

    setMessages((prev) => {
      const updated = { ...prev };
      if (!updated[key]) updated[key] = [];
      updated[key] = [...updated[key], message].sort(
        (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
      );
      return updated;
    });
  };

  useEffect(() => {
    const lastMessage = lastMessageRef.current;
    if (!lastMessage) return;

    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && console.log("in view"),
      { threshold: 0.1 } // visible when 10% of the element is in view
    );

    observer.observe(lastMessage);
    return () => observer.disconnect();
  }, [messages]);

  // Connect socket
  useEffect(() => {
    if (!user || socketRef.current) return;
    const socket = io("http://localhost:8000");
    socketRef.current = socket;
    socket.on("connect", () => socket.emit("join", user.username));
    socket.on("private_message", handlePrivateMessage);

    return () => {
      socket.off("private_message", handlePrivateMessage);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  // Fetch messages
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

        const sorted = data.sort(
          (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
        );

        const grouped: Record<string, Message[]> = {};
        for (const m of sorted) {
          const date = new Date(m.sentAt);
          const key = `${date.getFullYear()}:${
            date.getMonth() + 1
          }:${date.getDate()}`;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(m);
        }

        setMessages(grouped);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
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

    const optimisticMessage: Message = {
      id: Date.now(),
      chatId: 0,
      content: newMessage.trim(),
      senderUsername: user.username,
      receiverUsername: friendUsername,
      sentAt: new Date().toISOString(),
      status: "sent",
    } as any;

    const date = new Date(optimisticMessage.sentAt);
    const key = `${date.getFullYear()}:${
      date.getMonth() + 1
    }:${date.getDate()}`;

    setMessages((prev) => {
      const updated = { ...prev };
      if (!updated[key]) updated[key] = [];
      updated[key] = [...updated[key], optimisticMessage];
      return updated;
    });

    socketRef.current.emit("private_message", payload);
    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto flex flex-col-reverse gap-3 pr-5 pl-3 h-full py-2">
        {loading ? (
          <div className="size-5 mt-5 border-2 border-indigo-500 rounded-full animate-spin border-t-transparent self-center" />
        ) : Object.keys(messages).length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            No messages yet
          </div>
        ) : (
          Object.keys(messages)
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
            .map((date) => (
              <div key={date} className="flex flex-col gap-2">
                <div className="dark:text-white sticky top-0 my-2 flex w-full justify-center">
                  <p className="bg-gray-900 rounded-md px-2">
                    {formatMessageDate(date)}
                  </p>
                </div>

                {messages[date].map((msg, idx) => {
                  // console.log("index:", idx);
                  // console.log("content", msg.content);
                  const isLast = idx === 0;

                  return (
                    <div
                      key={idx}
                      ref={isLast ? lastMessageRef : null}
                      className={`p-3 rounded-2xl w-fit max-w-[50%] ${
                        msg.status === "sent"
                          ? "ml-auto bg-blue-600 text-white text-right"
                          : "mr-auto bg-gray-200 dark:bg-gray-700 text-black dark:text-white text-left"
                      }`}
                    >
                      <p className="whitespace-pre-line break-words text-left">
                        {msg.content}
                      </p>
                      <p className="text-sm text-gray-300 mt-1 self-end">
                        {new Date(msg.sentAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  );
                })}
              </div>
            ))
        )}
      </div>

      <div className="flex items-center border-t pt-3 mt-3 px-5">
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
