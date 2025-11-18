import { useState, useCallback } from "react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import type { Post } from "@/types/Types";

export const usePosts = () => {
  const { user, setUser } = useUser();
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const fetchPosts = useCallback(async () => {
    if (!user) return;
    setLoadingPosts(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/posts/feed", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok) {
        setPosts(data || []);
      } else if (res.status === 401) {
        setUser(null);
        localStorage.removeItem("token");
        router.push("/login");
      } else {
        console.error(data.error || "Failed to load posts");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPosts(false);
    }
  }, [user, setUser, router]);

  const handlePost = useCallback(
    async (content: string, clearContent: () => void) => {
      if (!user || !content.trim()) return;

      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8000/posts/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content }),
        });

        const data = await res.json();

        if (res.ok) {
          clearContent();
          fetchPosts();
        } else if (res.status === 401) {
          setUser(null);
          localStorage.removeItem("token");
          router.push("/login");
        } else {
          console.error(data.error || "Failed to create post");
        }
      } catch (err) {
        console.error(err);
      }
    },
    [user, setUser, router, fetchPosts]
  );

  return { posts, loadingPosts, fetchPosts, handlePost };
};
