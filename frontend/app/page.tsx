"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

/**

TODO:
1) profile pictures
2) faster loading using nextjs features (ssr etc.)
3) graphql
 
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
