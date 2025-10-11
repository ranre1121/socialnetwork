import profilePlaceholder from "/images/profile-placeholder.png";
import {
  Compass,
  Users,
  Mail,
  UserCircle,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

const buttons = [
  { icon: <Compass />, text: "Me" },
  { icon: <Mail />, text: "Messages" },
  { icon: <Users />, text: "Friends" },
  { icon: <UserCircle />, text: "Profile" },
];

const Navbar: React.FC<{ dark: boolean; toggleTheme: () => void }> = ({
  dark,
  toggleTheme,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, setUser } = useUser();

  const currentPage = location.pathname.split("/")[1] || "me";

  useEffect(() => {
    if (loading) return;
    if (!user?.username && location.pathname !== "/login") {
      navigate("/login");
    }
  }, [loading, user, navigate, location.pathname]);

  const handleClick = (page: string) => {
    if (page === "profile") {
      navigate(`/${page}/${user?.username}`);
      return;
    }
    navigate(`/${page}`);
  };

  return (
    <nav className="fixed top-10 left-[100px] flex flex-col gap-5 w-[250px] items-center bg-white dark:bg-gray-900 rounded-xl py-5 pb-10 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col items-center justify-center gap-5">
        <img
          src={profilePlaceholder}
          className="size-20 rounded-full"
          alt="profile"
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
                navigate("/login");
              }}
            />
          </span>
          <span className="text-gray-500 dark:text-gray-400 flex gap-2">
            <p>@{user?.username} </p>
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
};

export default Navbar;
