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
  const [dark, setDark] = useState(true);

  const currentPage = location.pathname.split("/")[1] || "me";

  useEffect(() => {
    if (loading) return;
    if (!user?.username && location.pathname !== "/login") {
      navigate("/login");
    }
  }, [loading, user, navigate, location.pathname]);

  useEffect(() => {
    // force dark mode on mount
    document.body.classList.add("dark");
    setDark(true);
  }, []);

  const handleClick = (page: string) => {
    navigate(`/${page}`);
  };

  // toggle dark class on body
  const toggleTheme = () => {
    document.body.classList.toggle("dark");
    setDark(document.body.classList.contains("dark"));
  };

  return (
    <nav className="absolute left-[100px] flex flex-col gap-5 w-[250px] items-center card-theme rounded-xl py-5 pb-10 shadow-lg">
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
          <span className="text-muted flex gap-2">
            <p>@{user?.username} </p>
          </span>
        </span>
      </div>

      <div className="border border-theme w-full h-0" />

      <div className="flex flex-col gap-3 w-full px-2">
        {buttons.map((button) => {
          const page = button.text.toLowerCase();
          return (
            <button
              key={button.text}
              className={`flex gap-2 w-full py-3 px-4 cursor-pointer rounded-lg ${
                currentPage === page ? "bg-black text-white" : "card-theme"
              }`}
              onClick={() => handleClick(page)}
            >
              <span>{button.icon}</span>
              <p>{button.text}</p>
            </button>
          );
        })}
      </div>

      {/* Dark mode toggle */}
      <button
        onClick={toggleTheme}
        className="mt-5 px-3 py-2 rounded-lg card-theme border border-theme flex items-center gap-2"
      >
        {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        <span>{dark ? "Light Mode" : "Dark Mode"}</span>
      </button>
    </nav>
  );
};

export default Navbar;
