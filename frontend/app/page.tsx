"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

/**

TODO:
1) messages read status
2) live typing indicator
3) notifications
4) comment replies 
5) optimization

*/

export default function Home() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user) router.replace("/feed");
    else router.replace("/login");
  }, [user, loading, router]);

  return <div className="w-screen h-screen dark:bg-gray-900 bg-white" />;
}
