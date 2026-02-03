"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

export default function Home() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (user) {
      router.push("/feed");
    } else {
      router.push("/login");
    }
  }, [user, loading, router]);

  return <div className="w-screen h-screen dark:bg-gray-900 bg-white" />;
}
