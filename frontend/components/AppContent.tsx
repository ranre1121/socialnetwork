"use client";

import { UserProvider, useUser } from "@/context/UserContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { SocketProvider } from "@/context/SocketContext";
import Navbar from "@/components/Navbar";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import MessageNotification from "@/components/MessageNotification";

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading, setUser, setLoading } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  const verifyToken = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        router.push("/login");
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/welcome`, {
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

        router.push(pathname);
      }
    } catch (err) {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verifyToken();
  }, []);

  if (loading) return <div className="w-screen h-screen dark:bg-gray-900" />;

  return (
    <>
      {user && <Navbar />}
      {children}
    </>
  );
}

export default function AppContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <SocketProvider>
        <ThemeProvider>
          <AuthGate>
            {children}
            <MessageNotification />
          </AuthGate>
        </ThemeProvider>
      </SocketProvider>
    </UserProvider>
  );
}
