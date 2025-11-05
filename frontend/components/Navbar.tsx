"use client";

import Image from "next/image";
import profilePlaceholder from "@/public/images/profile-placeholder.png";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Compass,
  Users,
  Mail,
  UserCircle,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import { useUser } from "@/context/UserContext";

const buttons = [
  { icon: <Compass />, text: "Feed" },
  { icon: <Mail />, text: "Messages" },
  { icon: <Users />, text: "Friends" },
  { icon: <UserCircle />, text: "Profile" },
];

export default function Navbar({
  dark,
  toggleTheme,
}: {
  dark: boolean;
  toggleTheme: () => void;
}) {
  const { user, loading, setUser } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const currentPage = pathname.split("/")[1] || "feed";

  useEffect(() => {
    if (loading) return;
    if (!user?.username && pathname !== "/login") {
      router.push("/login");
    }
  }, [loading, user, router, pathname]);

  const handleClick = (page: string) => {
    if (page === "profile") {
      router.push(`/profile/${user?.username}`);
      return;
    }
    router.push(`/${page === "feed" ? "" : page}`);
  };

  return (
    <nav className="fixed top-10 left-[100px] flex flex-col gap-5 w-[250px] items-center bg-white dark:bg-gray-900 rounded-xl py-5 pb-10 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col items-center justify-center gap-5">
        <Image
          src={profilePlaceholder}
          className="rounded-full"
          alt="profile"
          width={80}
          height={80}
        />
        <span className="flex flex-col items-center">
          <span className="font-bold flex gap-2 items-center px-7 relative text-black dark:text-white">
            <p
              className="hover:underline cursor-pointer"
              onClick={() => handleClick("profile")}
            >
              {user?.name}
            </p>
            <LogOut
              className="size-4.5 hover:text-red-500 absolute right-0 cursor-pointer"
              onClick={() => {
                localStorage.removeItem("token");
                setUser(null);
                router.push("/login");
              }}
            />
          </span>
          <span className="text-gray-500 dark:text-gray-400 flex gap-2">
            <p>@{user?.username}</p>
          </span>
        </span>
      </div>

      <div className="border border-gray-200 dark:border-gray-700 w-full h-0" />

      <div className="flex flex-col gap-3 w-full px-2">
        {buttons.map((button) => {
          const page = button.text.toLowerCase();
          return (
            <button
              key={button.text}
              className={`flex gap-2 w-full py-3 px-4 cursor-pointer rounded-lg ${
                currentPage === page
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800 text-black dark:text-white"
              }`}
              onClick={() => handleClick(page)}
            >
              <span>{button.icon}</span>
              <p>{button.text}</p>
            </button>
          );
        })}
      </div>

      <button
        onClick={toggleTheme}
        className="mt-5 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center gap-2 bg-white dark:bg-gray-800 text-black dark:text-white"
      >
        {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        <span>{dark ? "Light Mode" : "Dark Mode"}</span>
      </button>
    </nav>
  );
}
