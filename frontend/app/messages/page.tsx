"use client";
import { useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { useConversations } from "@/hooks/useConversations";
import ImageComponent from "@/components/ImageComponent";
import { formatMessageTime } from "@/utils/utils";

export default function Messages() {
  const { user } = useUser();
  const router = useRouter();
  const { conversations, loading, fetchConversations } = useConversations();

  useEffect(() => {
    if (user) fetchConversations();
  }, [user, fetchConversations]);

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
                  <div className="flex  w-full leading-5">
                    <div>
                      <p>{c.companion.name}</p>
                      <span className="truncate flex-1">
                        {c.lastMessage?.content || "No messages yet"}
                      </span>
                    </div>

                    <div className="flex ml-auto items-center text-sm text-gray-500 dark:text-gray-300">
                      {(c.unreadMessages ?? 0) > 0 && (
                        <div className="ml-auto bg-red-500 mr-5 text-white rounded-full font-semibold w-6 h-6 text-xs flex items-center justify-center">
                          {c.unreadMessages ?? 0}
                        </div>
                      )}
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
