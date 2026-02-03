import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import ImageComponent from "./ImageComponent";

const ProfileFriendsModal = ({
  username,
  onClose,
}: {
  username: string;
  onClose: () => void;
}) => {
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/friends/list/${username}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();
        setFriends(data);
      } catch (err) {
        console.error("Error fetching friends:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [username]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 dark:text-white w-[420px] max-h-[500px] rounded-2xl shadow-xl p-5 flex flex-col"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Friends</h2>
          <X className="cursor-pointer hover:text-red-500" onClick={onClose} />
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 mb-2" />

        <div className="overflow-y-auto flex-1 flex flex-col gap-3">
          {loading ? (
            <p className="text-gray-500 text-center mt-5">Loading...</p>
          ) : friends.length === 0 ? (
            <p className="text-gray-400 text-center mt-5">No friends found</p>
          ) : (
            friends.map((f, i) => (
              <div
                key={i}
                className="flex items-center cursor-pointer gap-3 py-2 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => {
                  router.push(`/profile/${f.username}`);
                  onClose();
                }}
              >
                <ImageComponent src={f.profilePicture} size={25} />
                <div className="flex flex-col">
                  <p className="cursor-pointer hover:underline text-gray-900 dark:text-white">
                    {f.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    @{f.username}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileFriendsModal;
