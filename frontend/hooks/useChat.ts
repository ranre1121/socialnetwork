"use client";
import { useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import type { Message, MessageData } from "@/types/Types";

export const useChat = (username: string, user: any) => {
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [hasMore, setHasMore] = useState(true);
  const [lastReadId, setLastReadId] = useState<number>(0);
  const [companionLastReadId, setCompanionLastReadId] = useState(0);
  const [chatId, setChatId] = useState<number | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const lastMessageRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const fetchMessages = useCallback(
    async (date: string) => {
      if (!user) return;
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
    },
    [username, user]
  );

  const handlePrivateMessage = (message: Message) => {
    if (!message) return;
    if (!user) return;

    if (message.sender?.username === user?.username) {
      setMessages((prev) => {
        const updated = { ...prev };
        for (const key in updated) {
          updated[key] = updated[key].map((msg) =>
            msg.tempId === message.tempId
              ? { ...msg, status: "sent", id: message.id }
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
        updated[key] = [...updated[key], message].sort(
          (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
        );
        return updated;
      });
    }
  };

  const handleReadMessage = (messageId: number) => {
    setCompanionLastReadId(messageId);
  };

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
    if (container) container.scrollTop = 0;

    setNewMessage("");
  };

  return {
    newMessage,
    setNewMessage,
    messages,
    loading,
    fetchMessages,
    sendMessage,
    hasMore,
    lastReadId,
    companionLastReadId,
    scrollRef,
    messageRefs,
    lastMessageRef,
    socketRef,
    handlePrivateMessage,
    handleReadMessage,
    chatId,
    setChatId,
  };
};
