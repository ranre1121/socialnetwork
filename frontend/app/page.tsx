"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

/**

TODO:

1) live typing indicator
2) notifications
3) comment replies 
4) optimization

*/

export default function Home() {
  const { user, setUser, setLoading, loading } = useUser();
  const router = useRouter();

  const verifyToken = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        router.push("/login");
        return;
      }

      const res = await fetch("http://localhost:8000/auth/welcome", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        router.push("/login");
        setUser(null);
        localStorage.removeItem("token");
      } else {
        setUser(data);
        router.push("/feed");
      }
    } catch (err) {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loading) return;

    verifyToken();
  }, [loading]);

  return <div className="w-screen h-screen dark:bg-gray-900 bg-white" />;
}
