import { useState, useCallback } from "react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import type { Conversation } from "@/types/Types";

export const useConversations = () => {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("http://localhost:8000/messages/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        setUser(null);
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      const data = await res.json();
      setConversations(data || []);
    } catch (err) {
      console.error("Error fetching conversations:", err);
    } finally {
      setLoading(false);
    }
  }, [user, setUser, router]);

  return { conversations, loading, fetchConversations };
};
