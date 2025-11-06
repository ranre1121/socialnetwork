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

  useEffect(() => {
    if (loading) return;

    const protectedRoutes = ["/", "/feed", "/messages", "/friends", "/profile"];
    const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));

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
      {user && <Navbar />}
      {children}
    </>
  );
}
