import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import profilePlaceholder from "../../public/images/profile-placeholder.png";

type Profile = {
  username: string;
  name: string;
  surname: string;
  bio: string;
  friendsCount: number;
};

const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    async function fetchProfile() {
      try {
        const res = await fetch(`http://localhost:8000/profiles/${username}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data: Profile = await res.json();
        setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [username]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!profile) return <p className="text-center mt-10">Profile not found</p>;

  return (
    <div className="flex justify-center w-full py-10 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="w-[850px] bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden p-6 flex flex-col items-center gap-6">
        {/* Avatar */}
        <div className="h-28 w-28 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center shadow-lg">
          <img
            src={profilePlaceholder}
            alt="Profile avatar"
            className="h-full w-full rounded-full object-cover"
          />
        </div>

        {/* Name + Username */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {profile.name} {profile.surname}
          </h2>
          <p className="text-gray-500">@{profile.username}</p>
        </div>

        {/* Stats */}
        <div className="flex gap-8 text-sm">
          <p className="text-gray-900 dark:text-white">
            <span className="font-semibold text-gray-900 dark:text-white">
              {profile.friendsCount}
            </span>{" "}
            {profile.friendsCount === 1 ? "Friend" : "Friends"}
          </p>
        </div>

        {/* About */}
        <div className="w-full bg-gray-50 dark:bg-gray-700 rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            About
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {profile.bio || "No bio yet."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
