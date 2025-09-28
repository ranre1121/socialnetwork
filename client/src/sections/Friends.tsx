import { useState } from "react";
import AddFriendModal from "../components/AddFriendModal";
import FriendRequestsModal from "../components/FriendRequests";
import Navbar from "../components/Navbar";
import { UserPlus, Users } from "lucide-react";

const Friends = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen py-10">
      {/* Navbar fixed on the left */}
      <Navbar />

      {/* Centered content */}
      <div className="flex flex-1 flex-col items-center justify-start gap-5">
        <div className="w-[850px] h-[1000px] bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold">Friends</h1>

            {/* Friend Requests button */}
            <button
              onClick={() => setIsRequestsModalOpen(true)}
              className="ml-auto bg-gray-200 text-gray-800 px-3 rounded-lg flex gap-2 py-1 items-center hover:bg-gray-300 transition"
            >
              <Users className="size-5" />
              <p>Requests</p>
            </button>

            {/* Add a Friend button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="ml-2 bg-blue-600 text-white px-3 rounded-lg flex gap-2 py-1 items-center hover:bg-blue-700 transition"
            >
              <UserPlus className="size-5" />
              <p>Add a friend</p>
            </button>
          </div>

          <div className="border-t border-gray-200" />
          {/* Friend list would go here */}
        </div>
      </div>

      {/* Modals */}
      {isAddModalOpen && (
        <AddFriendModal onClose={() => setIsAddModalOpen(false)} />
      )}
      {isRequestsModalOpen && (
        <FriendRequestsModal onClose={() => setIsRequestsModalOpen(false)} />
      )}
    </div>
  );
};

export default Friends;
