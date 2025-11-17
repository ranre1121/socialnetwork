"use client";
import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useUser } from "@/context/UserContext";
import type { MessageData, Message } from "@/types/Types";
import { formatMessageDate } from "@/utils/utils";
import { ArrowLeft, CheckCheck, Clock3 } from "lucide-react";
import { Check } from "lucide-react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

const Chat = () => {
  const { user } = useUser();
  const { username } = useParams<{ username: string }>();
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [hasMore, setHasMore] = useState(true);
  const [lastReadId, setLastReadId] = useState<number>(0);
  const [companionLastReadId, setCompanionLastReadId] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [chatId, setChatId] = useState<number | null>(null);
  const messageRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const socketRef = useRef<Socket | null>(null);
  const lastMessageRef = useRef<HTMLDivElement | null>(null);

  async function fetchMessages(date: string) {
    const container = scrollRef.current;
    const prevScrollHeight = container?.scrollHeight || 0;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        date === ""
          ? `http://localhost:8000/messages/${username}`
          : `http://localhost:8000/messages/${username}?before=${date}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data: MessageData = await res.json();

      if (data.messages.length === 0) {
        setHasMore(false);
        return;
      }

      const sorted = data.messages.sort(
        (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
      );

      const grouped: Record<string, Message[]> = {};
      for (const m of sorted) {
        const d = new Date(m.sentAt);
        const key = `${d.getFullYear()}:${d.getMonth() + 1}:${d.getDate()}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(m);
      }

      setMessages((prev) => {
        const merged = { ...prev };

        for (const date in grouped) {
          if (!merged[date]) merged[date] = grouped[date];
          else {
            const combined = [...merged[date], ...grouped[date]];
            const unique = Array.from(
              new Map(combined.map((m) => [m.id, m])).values()
            );
            merged[date] = unique.sort(
              (a, b) =>
                new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
            );
          }
        }

        setLastReadId(data.lastReadId);
        setChatId(data.messages[0].chatId);
        setCompanionLastReadId(data.companionLastReadId);

        return merged;
      });

      requestAnimationFrame(() => {
        if (container) {
          const newScrollHeight = container.scrollHeight;
          const diff = newScrollHeight - prevScrollHeight;
          container.scrollTop += diff;
        }
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleReadMessage = (messageId: number) => {
    console.log(messageId);
    setCompanionLastReadId(messageId);
  };

  const handlePrivateMessage = (message: Message) => {
    if (!message) return;

    if (message.sender?.username === user?.username) {
      setMessages((prev) => {
        const updated = { ...prev };

        for (const key in updated) {
          updated[key] = updated[key].map((msg) =>
            msg.tempId === message.tempId ? { ...msg, status: "sent" } : msg
          );
        }

        return updated;
      });
    } else {
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
    }
  };

  useEffect(() => {
    const lastMessage = lastMessageRef.current;
    if (!lastMessage || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          const date = entry.target.getAttribute("data-sent-at");
          if (date) {
            fetchMessages(date);
          }
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(lastMessage);
    return () => observer.disconnect();
  }, [messages, hasMore]);

  useEffect(() => {
    if (!user || !username) return;
    setHasMore(true);
    fetchMessages("");
  }, [user, username]);

  useEffect(() => {
    if (!lastReadId) return;

    let attempts = 0;

    const tryScroll = () => {
      const el = messageRefs.current[lastReadId];
      if (el) {
        el.scrollIntoView({ behavior: "auto", block: "center" });
      } else if (attempts < 10) {
        attempts++;
        requestAnimationFrame(tryScroll);
      }
    };

    requestAnimationFrame(tryScroll);
  }, [messages]);

  useEffect(() => {
    if (!user || socketRef.current) return;
    const socket = io("http://localhost:8000");
    socketRef.current = socket;
    socket.on("connect", () => socket.emit("join", user.username));
    socket.on("private_message", handlePrivateMessage);
    socket.on("read_message", handleReadMessage);

    return () => {
      socket.off("private_message", handlePrivateMessage);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  const sendMessage = () => {
    if (!newMessage.trim() || !user || !socketRef.current) return;

    const pendingMessage: Message = {
      tempId: crypto.randomUUID(),
      id: Date.now(),
      chatId: 0,
      content: newMessage.trim(),
      senderUsername: user.username,
      receiverUsername: username,
      sentAt: new Date().toISOString(),
      status: "pending",
    } as any;

    const date = new Date(pendingMessage.sentAt);
    const key = `${date.getFullYear()}:${
      date.getMonth() + 1
    }:${date.getDate()}`;

    setMessages((prev) => {
      const updated = { ...prev };
      if (!updated[key]) updated[key] = [];
      updated[key] = [...updated[key], pendingMessage];
      return updated;
    });

    socketRef.current.emit("private_message", pendingMessage);

    const container = scrollRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }

    setNewMessage("");
  };
  useEffect(() => {
    if (!user || !chatId) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const id = Number(entry.target.getAttribute("data-message-id"));
          if (!id) return;

          if (id > lastReadId) {
            socketRef.current?.emit("read_message", {
              chatId: chatId,
              messageId: id,
              username: user.username,
            });
            setLastReadId(id);
          }

          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.5 }
    );

    Object.values(messageRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [messages, chatId]);

  return (
    <div className="flex flex-col h-screen w-full items-center justify-center py-10">
      <div className="bg-white dark:bg-gray-800 w-full max-w-[850px] h-full max-h-[900px] flex flex-col border-gray-700 rounded-2xl overflow-hidden backdrop-blur">
        <div className="flex items-center gap-3 border-gray-700 border-b p-5">
          <button
            onClick={() => {
              router.push("/messages");
            }}
            className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="size-5 text-gray-600 dark:text-gray-300" />
          </button>
          <h2
            className="text-lg font-semibold cursor-pointer hover:underline"
            onClick={() => {
              router.replace(`/profile/${username}`);
            }}
          >
            @{username}
          </h2>
        </div>
        <div
          className="flex-1 overflow-y-auto flex flex-col-reverse gap-3 px-5 py-3"
          ref={scrollRef}
        >
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
                  <div className=" sticky top-0 my-2 flex w-full justify-center">
                    <p className="dark:bg-gray-900 dark:text-white bg-gray-200 text-black rounded-md px-2">
                      {formatMessageDate(date)}
                    </p>
                  </div>

                  {messages[date].map((msg, idx) => {
                    const isLast = idx === 0;
                    return (
                      <div key={idx}>
                        <div
                          ref={(el) => {
                            if (el) messageRefs.current[msg.id] = el;
                            else delete messageRefs.current[msg.id];

                            if (isLast) lastMessageRef.current = el;
                          }}
                          data-sent-at={isLast ? msg.sentAt : undefined}
                          data-message-id={msg.id}
                          className={`p-3 rounded-2xl w-fit max-w-[70%] ${
                            msg.status === "sent" || msg.status === "pending"
                              ? "ml-auto bg-blue-600 text-white"
                              : "mr-auto bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
                          }`}
                        >
                          <p className="whitespace-pre-line wrap-break-word text-left">
                            {msg.content}
                          </p>
                          <p>{msg.id}</p>

                          <span className="flex gap-3 items-center">
                            <p
                              className={`text-sm text-gray-300 mt-1 ${
                                msg.status === "sent" ||
                                msg.status === "pending"
                                  ? "ml-auto"
                                  : "mr-auto"
                              }`}
                            >
                              {new Date(msg.sentAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>

                            {msg.status === "pending" ? (
                              <Clock3 className="mt-1 size-4 text-gray-300" />
                            ) : msg.status === "sent" &&
                              companionLastReadId < msg.id ? (
                              <Check className="mt-1 size-4 text-gray-300" />
                            ) : msg.status === "sent" &&
                              companionLastReadId >= msg.id ? (
                              <CheckCheck className="mt-1 size-4 text-gray-300" />
                            ) : null}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
          )}
        </div>

        <div className="flex items-center border-t pt-3 pb-4 px-5 backdrop-blur">
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
            {companionLastReadId}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
