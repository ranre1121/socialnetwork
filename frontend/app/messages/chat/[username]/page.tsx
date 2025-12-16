"use client";
import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { useUser } from "@/context/UserContext";
import type { MessageData, Message } from "@/types/Types";
import { formatMessageDate } from "@/utils/utils";
import { ArrowLeft, CheckCheck, Clock3 } from "lucide-react";
import { Check } from "lucide-react";
import { useSocket } from "@/context/SocketContext";
import { ChevronDown } from "lucide-react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

const Chat = () => {
  const { user } = useUser();
  const { socket } = useSocket();
  const { username } = useParams<{ username: string }>();
  const [firstMount, setFirstMount] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [totalMessages, setTotalMessages] = useState(0);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [hasMore, setHasMore] = useState(true);
  const [lastRead, setLastRead] = useState<number>(0);
  const [companionLastRead, setCompanionLastRead] = useState(0);
  const [initialLastRead, setInitialLastRead] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [chatId, setChatId] = useState<number | null>(null);
  const messageRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const lastMessageRef = useRef<HTMLDivElement | null>(null);
  const [noReadFiring, setNoReadFiring] = useState(false);

  //intersection observers for infinite scroll
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

  //set user handling
  // useEffect(() => {
  //   const allMessages = Object.values(messages).flat();
  //   if (!allMessages.length) return;

  //   const latestMessage = allMessages[0];
  //   const latestCountId = latestMessage?.countId;

  //   if (!latestCountId) return;

  //   if (lastRead >= latestCountId) {
  //     setUser((prev) => {
  //       if (!prev) return prev;

  //       return {
  //         ...prev,
  //         notifications: {
  //           ...prev.notifications,
  //           messages: Math.max((prev.notifications?.messages ?? 0) - 1, 0),
  //         },
  //       };
  //     });
  //   }
  // }, [lastRead]);

  //initial fetch
  useEffect(() => {
    if (!user || !username) return;
    setHasMore(true);
    fetchMessages("");
  }, [user, username]);

  //socket connection
  useEffect(() => {
    if (!socket) return;

    socket.on("private_message", handlePrivateMessage);
    socket.on("read_message", handleReadMessage);

    return () => {
      socket.off("private_message", handlePrivateMessage);
      socket.off("read_message", handleReadMessage);
    };
  }, [socket]);

  //scrolling on mount to last read message
  useLayoutEffect(() => {
    if (!initialLastRead && initialLastRead !== 0) return;
    if (firstMount) return;

    const el = messageRefs.current[initialLastRead === 0 ? 1 : initialLastRead];
    if (!el) return;

    el.scrollIntoView({ behavior: "auto", block: "center" });
    setFirstMount(true);
  }, [firstMount, initialLastRead, messages]);

  //intersection observers for reading handling
  useEffect(() => {
    if (!user || !chatId) return;
    if (!firstMount) return;
    if (noReadFiring) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageCount = Number(
              entry.target.getAttribute("data-message-count")
            );
            if (!messageCount) return;

            const message = Object.values(messages)
              .flat()
              .find((m) => m.countId === messageCount);
            if (!message || message.status === "sent") return;

            if (messageCount > lastRead) {
              socket?.emit("read_message", {
                chatId: chatId,
                messageCount: messageCount,
                username: user.username,
              });

              setLastRead(messageCount);
            }

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    Object.values(messageRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [messages, chatId, firstMount, lastRead]);

  //send message
  const sendMessage = () => {
    if (!newMessage.trim() || !user || !socket) return;

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

    socket.emit("private_message", pendingMessage);

    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });

    setNewMessage("");
    setSent(true);
    setLastRead(totalMessages + 1);
  };

  //fetching logic
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
        return merged;
      });

      setLastRead(data.lastRead);

      setInitialLastRead(data.lastRead);
      setChatId(data.messages[0].chatId);
      setCompanionLastRead(data.companionLastRead);
      setTotalMessages(data.totalMessages);

      if (firstMount) {
        requestAnimationFrame(() => {
          if (container) {
            const newScrollHeight = container.scrollHeight;
            const diff = newScrollHeight - prevScrollHeight;
            container.scrollTop += diff;
          }
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  //socket event handlers
  const handleReadMessage = (messageId: number) => {
    setCompanionLastRead(messageId);
  };

  const handlePrivateMessage = (message: Message) => {
    if (!message) return;

    if (message.sender?.username === user?.username) {
      setMessages((prev) => {
        const updated = { ...prev };

        for (const key in updated) {
          updated[key] = updated[key].map((msg) =>
            msg.tempId === message.tempId
              ? {
                  ...msg,
                  status: "sent",
                  id: message.id,
                  countId: message.countId,
                }
              : msg
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
        updated[key] = [...updated[key], message];
        return updated;
      });
    }
    setTotalMessages((prev) => prev + 1);
  };

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
          className="flex-1 overflow-y-auto flex flex-col gap-3 px-5 py-3"
          ref={scrollRef}
        >
          {loading ? (
            <div className="size-5 mt-5 border-2 border-indigo-500 rounded-full animate-spin border-t-transparent self-center" />
          ) : Object.keys(messages).length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              No messages yet
            </div>
          ) : (
            Object.keys(messages).map((date) => (
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
                          if (el) messageRefs.current[msg.countId] = el;
                          else delete messageRefs.current[msg.countId];

                          if (isLast) lastMessageRef.current = el;
                        }}
                        data-sent-at={isLast ? msg.sentAt : undefined}
                        data-message-count={msg.countId}
                        className={`p-3 rounded-2xl w-fit max-w-[70%] ${
                          msg.status === "sent" || msg.status === "pending"
                            ? "ml-auto bg-blue-600 text-white"
                            : "mr-auto bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
                        }`}
                      >
                        <p className="whitespace-pre-line wrap-break-word text-left">
                          {msg.content}
                        </p>

                        <span className="flex gap-3 items-center">
                          <p
                            className={`text-sm dark:text-gray-300 mt-1 ${
                              msg.status === "sent" || msg.status === "pending"
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
                            companionLastRead < msg.countId ? (
                            <Check className="mt-1 size-4 text-gray-300" />
                          ) : msg.status === "sent" &&
                            companionLastRead >= msg.countId ? (
                            <CheckCheck className="mt-1 size-4 text-gray-300" />
                          ) : null}
                        </span>
                      </div>

                      {msg.countId === initialLastRead &&
                        msg.countId !== totalMessages &&
                        !sent && (
                          <div className="w-full text-center my-2 py-1 bg-gray-300 dark:bg-gray-600 text-black dark:text-white rounded-md">
                            New messages
                          </div>
                        )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center relative border-t border-gray-300 dark:border-gray-600 pt-3 pb-4 px-5 backdrop-blur">
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
          {totalMessages > lastRead && (
            <>
              <div className="absolute -top-15 right-5 bg-gray-300 dark:bg-gray-600 border border-gray-500 size-10 cursor-pointer flex items-center justify-center rounded-full">
                <ChevronDown
                  onClick={() => {
                    if (scrollRef.current) {
                      scrollRef.current.scrollTop =
                        scrollRef.current.scrollHeight;
                    }
                    setNoReadFiring(true);
                    setLastRead(totalMessages);
                    socket?.emit("read_message", {
                      chatId: chatId,
                      messageCount: totalMessages,
                      username: user?.username,
                    });
                    setNoReadFiring(false);
                  }}
                />
                <div className="absolute flex items-center justify-center size-6 text-xs text-white bg-blue-400 -top-3 rounded-full">
                  {totalMessages - lastRead}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
