import profilePlaceholder from "../../public/images/profile-placeholder.png";
import { Compass } from "lucide-react";
import { Users } from "lucide-react";
import { Mail } from "lucide-react";
import { UserCircle } from "lucide-react";
import { useState } from "react";

type NavbarProps = {
  username: string | null; // match the state type from Me.tsx
  name: string;
  surname: string;
};

const buttons = [
  { icon: <Compass />, text: "Feed" },
  { icon: <Mail />, text: "Messages" },
  { icon: <Users />, text: "Friends" },
  { icon: <UserCircle />, text: "Profile" },
];

const Navbar: React.FC<NavbarProps> = ({ username, surname, name }) => {
  const [currentPage, setCurrentPage] = useState("feed");

  return (
    <nav className="flex flex-col gap-10 border w-[250px] items-center px-3">
      <div className="flex flex-col items-center justify-center gap-5">
        <img src={profilePlaceholder} className="size-20 rounded-full" />
        <span className="flex flex-col items-center ">
          <p className="font-bold">
            {name} {surname}
          </p>
          <p className="text-gray-400">@{username}</p>
        </span>
      </div>
      <div className="flex flex-col gap-3 w-full">
        {buttons.map((button) => (
          <button
            className={`flex gap-2 w-full py-3 px-4 cursor-pointer rounded-lg ${
              currentPage === button.text.toLowerCase()
                ? "bg-black text-white"
                : "bg-white text-black"
            }`}
            onClick={() => {
              setCurrentPage(button.text.toLowerCase());
            }}
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
