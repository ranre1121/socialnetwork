"use client";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";
import { ThemeProvider } from "@/app/theme-provider";
import Navbar from "@/components/Navbar";
import { useUser } from "@/context/UserContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTheme } from "@/app/theme-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          <ThemeProvider>
            <AppContent>{children}</AppContent>
          </ThemeProvider>
        </UserProvider>
      </body>
    </html>
  );
}

function AppContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const { dark, toggleTheme } = useTheme();

  const verifyToken = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:8000/auth/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = res.json();

    if (!res.ok) {
      router.push("/login");
    } else {
      router.push(pathname);
    }
  };

  useEffect(() => {
    if (loading) return;

    verifyToken();
  }, [user, loading, pathname, router]);

  if (loading) return <div className="w-screen h-screen dark:bg-gray-800" />;

  return (
    <>
      {user && <Navbar />}
      {children}
    </>
  );
}
