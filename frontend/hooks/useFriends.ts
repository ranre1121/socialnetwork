import { useState, useCallback } from "react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";

export const useFriends = () => {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFriends = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/friends/list/${user.username}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.status === 401) {
        setUser(null);
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      const data = await res.json();
      setFriends(data || []);
    } catch (err) {
      console.error("Error fetching friends:", err);
    } finally {
      setLoading(false);
    }
  }, [user, setUser, router]);

  const deleteFriend = useCallback(
    async (friendUsername: string, onComplete?: () => void) => {
      if (!user) return;
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/friends/delete`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            username: user.username,
            friendUsername,
          }),
        });

        if (res.status === 401) {
          setUser(null);
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        if (!res.ok) return;
        if (onComplete) onComplete();
        fetchFriends();
      } catch (err) {
        console.error("Error deleting friend:", err);
      }
    },
    [user, setUser, router, fetchFriends]
  );

  return { friends, loading, fetchFriends, deleteFriend };
};
