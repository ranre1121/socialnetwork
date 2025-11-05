"use client";
import "./globals.css";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { UserProvider, useUser } from "@/context/UserContext";
import Navbar from "@/components/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const isDark =
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleTheme = () => {
    const newDark = !dark;
    setDark(newDark);
    document.documentElement.classList.toggle("dark", newDark);
    localStorage.setItem("theme", newDark ? "dark" : "light");
  };

  return (
    <html lang="en">
      <body className={dark ? "dark" : ""}>
        <UserProvider>
          <AppContent dark={dark} toggleTheme={toggleTheme}>
            {children}
          </AppContent>
        </UserProvider>
      </body>
    </html>
  );
}

function AppContent({
  dark,
  toggleTheme,
  children,
}: {
  dark: boolean;
  toggleTheme: () => void;
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const protectedRoutes = ["/", "/feed", "/messages", "/friends", "/profile"];
    const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));

    // prevent loop — only redirect if we're not already on /login or /register
    if (
      !user &&
      isProtected &&
      pathname !== "/login" &&
      pathname !== "/register"
    ) {
      router.replace("/login");
    }
  }, [user, loading, pathname, router]);

  if (loading) return <div className="w-screen h-screen dark:bg-gray-800" />;

  return (
    <>
      {user && <Navbar dark={dark} toggleTheme={toggleTheme} />}
      {children}
    </>
  );
}
