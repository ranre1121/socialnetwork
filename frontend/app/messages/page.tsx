"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import Chat from "@/components/Chat";
import profilePlaceholder from "@/public/images/profile-placeholder.png";
import { ArrowLeft } from "lucide-react";
import type { Conversation } from "@/types/Types";
import { formatMessageTime } from "@/utils/utils";
import ImageComponent from "@/components/ImageComponent";

export default function Messages() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchConversations() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/messages/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setConversations(data);
    } catch (err) {
      console.error("Error fetching conversations:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!user) return;
    fetchConversations();
  }, [user]);

  return (
    <div className="flex h-screen w-screen py-10 bg-gray-50 dark:bg-gray-900 text-black dark:text-white">
      <div className="flex flex-1 flex-col items-center justify-start">
        <div className="w-[850px] h-[900px] bg-white dark:bg-gray-800 rounded-2xl shadow-md py-5 px-2 flex flex-col overflow-hidden">
          <h1 className="text-xl font-semibold mb-2 mx-4 border-b border-gray-700 pb-5">
            Messages
          </h1>

          <div className="flex-1 -mt-1 overflow-y-auto flex flex-col gap-2">
            {loading ? (
              <div className="size-5 mt-5 border-2 border-indigo-500 rounded-full animate-spin border-t-transparent self-center" />
            ) : conversations.length === 0 ? (
              <p className="text-gray-400 dark:text-gray-500 self-center mt-2">
                No conversations yet
              </p>
            ) : (
              conversations.map((c) => (
                <div
                  key={c.companion.username}
                  onClick={() =>
                    router.push(`/messages/chat/${c.companion.username}`)
                  }
                  className="py-3 px-4 flex rounded-lg items-center gap-3 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition"
                >
                  <ImageComponent src={c.companion.profilePicture} size={30} />
                  <div className="flex flex-col w-full leading-5">
                    <p>{c.companion.name}</p>
                    <div className="flex text-sm text-gray-500 dark:text-gray-300">
                      <span className="truncate flex-1">
                        {c.lastMessage?.content || "No messages yet"}
                      </span>
                      <span className="ml-auto shrink-0 text-xs">
                        {formatMessageTime(c.lastMessage?.sentAt) || ""}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
