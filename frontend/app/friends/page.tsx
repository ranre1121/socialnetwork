"use client";
import { useState, useEffect } from "react";
import AddFriendModal from "@/components/AddFriendModal";
import FriendRequestsModal from "@/components/FriendRequestsModal";
import { UserMinusIcon, UserPlus, Users, Check, X, Mail } from "lucide-react";
import { useUser } from "@/context/UserContext";
import profilePlaceholder from "../../public/images/profile-placeholder.png";
import { useRouter } from "next/navigation";
import Image from "next/image";

const Friends = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useUser();

  const fetchFriends = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !user) return;
      setLoading(true);
      const res = await fetch(
        `http://localhost:8000/friends/list/${user.username}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }
      const data = await res.json();
      setFriends(data);
    } catch (err) {
      console.error("Error fetching friends:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  const handleDelete = async (friendUsername: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !user) return;
      const res = await fetch("http://localhost:8000/friends/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: user.username,
          friendUsername: friendUsername,
        }),
      });
      if (!res.ok) return;
      setConfirmDelete(null);
      fetchFriends();
    } catch (err) {
      console.error("Error deleting friend:", err);
    }
  };

  return (
    <div className="flex h-screen w-screen py-10 bg-gray-50 dark:bg-gray-900 text-black dark:text-white">
      <div className="flex flex-1 flex-col items-center justify-start">
        <div className="w-[850px] h-[900px] bg-white dark:bg-gray-800 rounded-2xl shadow-md px-6 flex flex-col">
          <div className="flex items-center border-b dark:border-gray-700 py-4.5 mb-1">
            <h1 className="text-xl font-semibold">Friends</h1>
            <button
              onClick={() => setIsRequestsModalOpen(true)}
              className="ml-auto bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 rounded-lg flex gap-2 py-1 items-center hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              <Users className="size-5" />
              <p>Requests</p>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="ml-2 bg-blue-600 text-white px-3 rounded-lg flex gap-2 py-1 items-center hover:bg-blue-700"
            >
              <UserPlus className="size-5" />
              <p>Add a friend</p>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-2">
            {loading ? (
              <div className="size-5 border-2 mt-5 border-indigo-500 rounded-full animate-spin border-t-transparent self-center" />
            ) : friends?.length === 0 ? (
              <p className="text-gray-400 dark:text-gray-500 self-center mt-4">
                You don’t have any friends yet
              </p>
            ) : (
              friends?.map((f, i) => (
                <div key={i}>
                  <div className="py-3 flex items-center gap-3">
                    <Image
                      src={f.profilePicture || profilePlaceholder}
                      alt="profile"
                      className="size-10 rounded-full"
                      width={0}
                      height={0}
                      unoptimized
                    />
                    <span className="leading-5">
                      <p
                        onClick={() => router.push(`/profile/${f.username}`)}
                        className="cursor-pointer hover:underline"
                      >
                        {f.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        @{f.username}
                      </p>
                    </span>
                    {confirmDelete === f.username ? (
                      <div className="ml-auto flex gap-3 items-center">
                        <p className="text-md">Remove a friend?</p>
                        <div className="flex gap-2">
                          <Check
                            className="hover:text-green-500 cursor-pointer"
                            onClick={() => handleDelete(f.username)}
                          />
                          <X
                            className="hover:text-red-500 cursor-pointer"
                            onClick={() => setConfirmDelete(null)}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="ml-auto flex gap-4">
                        <Mail
                          className="text-gray-600 dark:text-gray-300 hover:text-sky-500 cursor-pointer"
                          onClick={() =>
                            router.push(`/messages?username=${f.username}`)
                          }
                        />
                        <button
                          onClick={() => setConfirmDelete(f.username)}
                          className="text-gray-600 dark:text-gray-300 hover:text-red-500 cursor-pointer dark:hover:text-red-500"
                        >
                          <UserMinusIcon />
                        </button>
                      </span>
                    )}
                  </div>
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
