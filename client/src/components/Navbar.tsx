import profilePlaceholder from "../../public/images/profile-placeholder.png";
import { Compass, Users, Mail, UserCircle } from "lucide-react";

import { useUser } from "../context/UserContext"; // ⬅️ grab user directly
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const buttons = [
  { icon: <Compass />, text: "Me" },
  { icon: <Mail />, text: "Messages" },
  { icon: <Users />, text: "Friends" },
  { icon: <UserCircle />, text: "Profile" },
];

type NavbarProps = {
  currentPage: string;
};
const Navbar: React.FC<NavbarProps> = ({ currentPage }) => {
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    if (user === null) return; // still loading
    if (!user?.username) navigate("/login");
  }, [user, navigate]);

  const handleClick = (page: string) => {
    navigate(`/${page}`);
  };

  return (
    <nav className="flex flex-col gap-10 border w-[250px] items-center px-3">
      <div className="flex flex-col items-center justify-center gap-5">
        <img src={profilePlaceholder} className="size-20 rounded-full" />
        <span className="flex flex-col items-center">
          <p className="font-bold">
            {user?.name} {user?.surname}
          </p>
          <p className="text-gray-400">@{user?.username}</p>
        </span>
      </div>
      <div className="flex flex-col gap-3 w-full">
        {buttons.map((button) => (
          <button
            key={button.text}
            className={`flex gap-2 w-full py-3 px-4 cursor-pointer rounded-lg ${
              currentPage === button.text.toLowerCase()
                ? "bg-black text-white"
                : "bg-white text-black"
            }`}
            onClick={() => handleClick(button.text.toLowerCase())}
          >
            <span>{button.icon}</span>
            <p>{button.text}</p>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
