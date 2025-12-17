"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/context/SocketContext";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

type Notification = {
  id: string;
  content: string;
  sender: string;
};

export default function MessageNotification() {
  const { socket } = useSocket();
  const { user } = useUser();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!socket || !user) return;

    const handleMessage = (msg: any) => {
      // Ignore messages sent by the user
      if (msg.sender?.username === user.username) return;

      setNotifications((prev) => [
        ...prev,
        {
          id: msg.tempId,
          content: msg.content,
          sender: msg.sender.username,
        },
      ]);
    };

    socket.on("private_message", handleMessage);

    return () => {
      socket.off("private_message", handleMessage);
    };
  }, [socket, user]);

  if (notifications.length === 0) return null;

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="fixed bottom-5 w-[250px] right-5 flex flex-col gap-2 z-50">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="bg-blue-600 text-white p-3 rounded-lg shadow-lg flex justify-between items-start max-w-xs animate-slide-in cursor-pointer"
          onClick={() => {
            router.push(`/messages/chat/${n.sender}`);
          }}
        >
          <div>
            <p className="font-semibold">@{n.sender}</p>
            <p className="text-sm">{n.content}</p>
          </div>
          <X
            onClick={(e) => {
              e.stopPropagation();
              removeNotification(n.id);
            }}
            className="rounded-md hover:text-red-500 ml-2 text-white font-bold text-lg leading-none"
          />
        </div>
      ))}
      <style jsx>{`
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
