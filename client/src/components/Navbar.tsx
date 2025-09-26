// src/components/Navbar.tsx
import profilePlaceholder from "/images/profile-placeholder.png"; // or import from src/assets
import { Compass, Users, Mail, UserCircle } from "lucide-react";
import { useUser } from "../context/UserContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { LogOut } from "lucide-react";

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

  // Derive current page from pathname, default to "me"
  const currentPage = location.pathname.split("/")[1] || "me";

  useEffect(() => {
    // Wait until loading finishes.
    if (loading) return;

    // If not authenticated and not already on /login, redirect to /login
    if (!user?.username && location.pathname !== "/login") {
      navigate("/login");
    }
  }, [loading, user, navigate, location.pathname]);

  const handleClick = (page: string) => {
    navigate(`/${page}`);
  };

  return (
    <nav className="flex flex-col gap-10 border w-[250px] items-center px-3">
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
          <span className="text-gray-400 flex gap-2">
            <p>@{user?.username} </p>
          </span>
        </span>
      </div>

      <div className="flex flex-col gap-3 w-full">
        {buttons.map((button) => {
          const page = button.text.toLowerCase();
          return (
            <button
              key={button.text}
              className={`flex gap-2 w-full py-3 px-4 cursor-pointer rounded-lg ${
                currentPage === page
                  ? "bg-black text-white"
                  : "bg-white text-black"
              }`}
              onClick={() => handleClick(page)}
            >
              <span>{button.icon}</span>
              <p>{button.text}</p>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar;
