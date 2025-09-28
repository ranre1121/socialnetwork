import profilePlaceholder from "/images/profile-placeholder.png";
import {
  Compass,
  Users,
  Mail,
  UserCircle,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const buttons = [
  { icon: <Compass />, text: "Me" },
  { icon: <Mail />, text: "Messages" },
  { icon: <Users />, text: "Friends" },
  { icon: <UserCircle />, text: "Profile" },
];

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useUser();

  // check if dark mode is active on load
  const [darkMode, setDarkMode] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  const currentPage = location.pathname.split("/")[1] || "me";

  useEffect(() => {
    if (loading) return;
    if (!user?.username && location.pathname !== "/login") {
      navigate("/login");
    }
  }, [loading, user, navigate, location.pathname]);

  const handleClick = (page: string) => {
    navigate(`/${page}`);
  };

  const toggleTheme = () => {
    const html = document.documentElement;
    if (html.classList.contains("dark")) {
      html.classList.remove("dark");
      setDarkMode(false);
    } else {
      html.classList.add("dark");
      setDarkMode(true);
    }
  };

  return (
    <nav
      className="absolute left-[100px] flex flex-col gap-5 w-[250px] items-center 
      bg-white text-black 
      dark:bg-gray-900 dark:text-white 
      rounded-xl py-5 pb-10 shadow-lg transition-colors duration-300"
    >
      {/* Profile */}
      <div className="flex flex-col items-center justify-center gap-5">
        <img
          src={profilePlaceholder}
          className="size-20 rounded-full"
          alt="profile"
        />
        <span className="flex flex-col items-center">
          <p className="font-bold flex gap-2 items-center px-7 relative">
            {user?.name} {user?.surname}
            <LogOut
              className="size-4.5 hover:text-red-500 absolute right-0 cursor-pointer"
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/login");
              }}
            />
          </p>
          <span className="text-gray-400 dark:text-gray-500 flex gap-2">
            <p>@{user?.username} </p>
          </span>
        </span>
      </div>

      {/* Divider */}
      <div className="border border-gray-200 dark:border-gray-700 w-full h-0 " />

      {/* Nav buttons */}
      <div className="flex flex-col gap-3 w-full px-2">
        {buttons.map((button) => {
          const page = button.text.toLowerCase();
          return (
            <button
              key={button.text}
              className={`flex gap-2 w-full py-3 px-4 cursor-pointer rounded-lg transition-colors duration-200 ${
                currentPage === page
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "bg-white text-black dark:bg-gray-800 dark:text-white"
              }`}
              onClick={() => handleClick(page)}
            >
              <span>{button.icon}</span>
              <p>{button.text}</p>
            </button>
          );
        })}
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="mt-5 flex items-center gap-2 px-4 py-2 rounded-lg 
        border border-gray-200 dark:border-gray-700 
        bg-white dark:bg-gray-800 
        hover:bg-gray-100 dark:hover:bg-gray-700 
        transition-colors duration-200"
      >
        {darkMode ? <Sun /> : <Moon />}
        <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
      </button>
    </nav>
  );
};

export default Navbar;
