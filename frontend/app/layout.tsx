import "./globals.css";
import type { Metadata } from "next";
import AppContent from "@/components/AppContent";

export const metadata: Metadata = {
  title: "Social Network",
  description:
    "A full-stack social network with real-time messaging, friend management, and post feeds.",
  openGraph: {
    title: "Social Network",
    description:
      "Connect with friends, share posts, and chat in real time.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppContent>{children}</AppContent>
      </body>
    </html>
  );
}
