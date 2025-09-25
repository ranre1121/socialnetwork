import profilePlaceholder from "../../public/images/profile-placeholder.png";
import { Compass, Users, Mail, UserCircle } from "lucide-react";
import { useState } from "react";
import { useUser } from "../context/UserContext"; // ⬅️ grab user directly

const buttons = [
  { icon: <Compass />, text: "Feed" },
  { icon: <Mail />, text: "Messages" },
  { icon: <Users />, text: "Friends" },
  { icon: <UserCircle />, text: "Profile" },
];

const Navbar: React.FC = () => {
  const [currentPage, setCurrentPage] = useState("feed");
  const { user } = useUser(); // ⬅️ no props needed

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
            onClick={() => setCurrentPage(button.text.toLowerCase())}
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
