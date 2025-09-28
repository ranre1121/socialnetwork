import { useState, useEffect, useCallback } from "react";
import AddFriendModal from "../components/AddFriendModal";
import FriendRequestsModal from "../components/FriendRequests";
import Navbar from "../components/Navbar";
import { UserMinusIcon, UserPlus, Users, Check, X } from "lucide-react";
import { useUser } from "../context/UserContext";
import profilePlaceholder from "../../public/images/profile-placeholder.png";

const Friends = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null); // 🔹 track which friend is being deleted
  const { user } = useUser();

  const fetchFriends = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !user) return;

      const res = await fetch("http://localhost:8000/friends/list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: user.username }),
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      const data = await res.json();
      setFriends(data);
    } catch (err) {
      console.error("Error fetching friends:", err);
    }
  }, [user]);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  const handleDelete = async (username: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await fetch("http://localhost:8000/friends/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username }),
      });

      setConfirmDelete(null);
      fetchFriends();
    } catch (err) {
      console.error("Error deleting friend:", err);
    }
  };

  return (
    <div className="flex h-screen w-screen py-10">
      <Navbar />

      <div className="flex flex-1 flex-col items-center justify-start">
        <div className="w-[850px] h-[1000px] bg-white rounded-2xl shadow-md p-6 flex flex-col">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold">Friends</h1>

            <button
              onClick={() => setIsRequestsModalOpen(true)}
              className="ml-auto bg-gray-200 text-gray-800 px-3 rounded-lg flex gap-2 py-1 items-center hover:bg-gray-300 transition"
            >
              <Users className="size-5" />
              <p>Requests</p>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="ml-2 bg-blue-600 text-white px-3 rounded-lg flex gap-2 py-1 items-center hover:bg-blue-700 transition"
            >
              <UserPlus className="size-5" />
              <p>Add a friend</p>
            </button>
          </div>

          <div className="border-t border-gray-200 mt-5" />

          <div className="flex-1 overflow-y-auto flex flex-col gap-2">
            {friends.length === 0 ? (
              <p className="text-gray-400 self-center mt-4">
                You don’t have any friends yet
              </p>
            ) : (
              friends.map((f, i) => (
                <div
                  key={i}
                  className="py-5 rounded-lg flex items-center gap-3 border-b border-gray-100"
                >
                  <img
                    src={profilePlaceholder}
                    alt="profile"
                    className="size-10 rounded-full"
                  />
                  <span className="leading-5">
                    <p>
                      {f.name} {f.surname}
                    </p>
                    <p className="text-sm text-gray-500">@{f.username}</p>
                  </span>

                  {confirmDelete === f.username ? (
                    <div className="ml-auto flex gap-3 items-center">
                      <p className="text-sm">Remove a friend?</p>
                      <div className="flex gap-2">
                        <Check className="size-5 hover:text-green-500 cursor-pointer" />
                        <X className="size-5 hover:text-red-500 cursor-pointer" />
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(f.username)}
                      className="ml-auto text-gray-600 hover:text-red-500"
                    >
                      <UserMinusIcon />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <AddFriendModal onClose={() => setIsAddModalOpen(false)} />
      )}
      {isRequestsModalOpen && (
        <FriendRequestsModal
          onClose={() => setIsRequestsModalOpen(false)}
          onAccepted={fetchFriends}
        />
      )}
    </div>
  );
};

export default Friends;
