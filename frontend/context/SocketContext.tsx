"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useUser } from "@/context/UserContext";

type SocketContextType = {
  socket: Socket | null;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user || socketRef.current) return;

    const socket = io("http://localhost:8000", {
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join", user.username);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
