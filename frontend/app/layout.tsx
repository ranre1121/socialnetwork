"use client";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { SocketProvider } from "@/context/SocketContext";
import Navbar from "@/components/Navbar";
import { useUser } from "@/context/UserContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          <SocketProvider>
            <ThemeProvider>
              <AppContent>{children}</AppContent>
            </ThemeProvider>
          </SocketProvider>
        </UserProvider>
      </body>
    </html>
  );
}

function AppContent({ children }: { children: React.ReactNode }) {
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
