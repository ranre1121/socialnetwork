import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import profilePlaceholder from "../../public/images/profile-placeholder.png";

type Profile = {
  username: string;
  name: string;

  bio: string;
  friendsCount: number;
  profileOwner: boolean; // 👈 new field from backend
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

  if (loading)
    return <p className="text-center mt-10 text-gray-500">Loading...</p>;
  if (!profile)
    return <p className="text-center mt-10 text-gray-500">Profile not found</p>;

  return (
    <div className="flex justify-center w-full py-10 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="w-[850px] bg-white dark:bg-gray-800 rounded-2xl shadow-xl py-8 flex flex-col gap-8">
        {/* Avatar */}
        <div className="relative px-8">
          <img
            src={profilePlaceholder}
            alt="Profile avatar"
            className="h-32 w-32 rounded-full object-cover border-gray-200 dark:border-gray-500 border-4 shadow-md"
          />
        </div>

        {/* Name + Username */}
        <div className="flex items-center px-8">
          <div className="flex flex-col justify-center">
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
              {profile.name}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-xl">
              @{profile.username}
            </p>
            {profile.bio && (
              <p className="text-xl text-white mt-5 font-thin">{profile.bio}</p>
            )}
          </div>
          {profile.profileOwner && (
            <button className="ml-auto text-white py-1.5 px-5 rounded-full border border-white">
              Edit profile
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="px-8">
          <span className="flex gap-1">
            <p className="text-white">{profile.friendsCount} </p>
            <p className="text-gray-400">
              {profile.friendsCount === 1 ? "Friend" : "Friends"}
            </p>
          </span>
        </div>
        <div className="w-full border-b border-gray-400" />
        {/* POSTS */}
        <div className="flex items-center justify-center text-xl text-white ">
          User has no posts yet.
        </div>
      </div>
    </div>
  );
};

export default Profile;
