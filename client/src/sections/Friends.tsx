import { useState } from "react";
import AddFriendModal from "../components/AddFriendModal";
import Navbar from "../components/Navbar";
import { UserPlus } from "lucide-react";

const Friends = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen py-10">
      {/* Navbar fixed on the left */}
      <Navbar />

      {/* Centered content */}
      <div className="flex flex-1 flex-col items-center justify-start gap-5">
        <div className="w-[850px] h-[1000px] bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold">Friends</h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="ml-auto bg-blue-600 text-white px-3 rounded-lg flex gap-2 py-1 items-center hover:bg-blue-700 transition"
            >
              <UserPlus className="size-5" />
              <p>Add a friend</p>
            </button>
          </div>
          <div className="border-t border-gray-200" />
          {/* Friend list would go here */}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && <AddFriendModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default Friends;
