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
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login"); // not authenticated
    } else {
      router.replace("/feed"); // authenticated
    }
  }, [user, loading, router]);

  return <div className="w-screen h-screen dark:bg-gray-900 bg-white" />;
}
