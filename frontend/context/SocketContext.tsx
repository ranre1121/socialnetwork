"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useUser } from "@/context/UserContext";

type SocketContextType = {
  socket: Socket | null;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, setUser } = useUser();

  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!user) return;

    const newSocket = io("http://localhost:8000", {
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      newSocket.emit("join", user.username);
    });
    newSocket.on("private_message", (payload) => {
      if (payload.sender.username === user.username) return;
      setUser((prev) => {
        if (!prev) return prev;
        const messages = prev.notifications.messages;

        const existing = messages.find((c) => c.chatId === payload.chatId);

        return {
          ...prev,
          notifications: {
            ...prev.notifications,
            messages: existing
              ? messages.map((c) =>
                  c.chatId === payload.chatId
                    ? { ...c, unreadMessages: c.unreadMessages + 1 }
                    : c
                )
              : [...messages, { chatId: payload.chatId, unreadMessages: 1 }],
          },
        };
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
