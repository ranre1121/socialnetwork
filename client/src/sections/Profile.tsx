import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import profilePlaceholder from "../../public/images/profile-placeholder.png";
import { Mail } from "lucide-react";
import type { Profile as ProfileType } from "../types/Types";
import Post from "../components/Post";
import EditProfileModal from "../components/EditProfileModal";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleSave = async (name: string, bio: string) => {
    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:8000/profiles/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          bio,
          isProfileOwner: profile?.profileOwner,
        }),
      });
      fetchProfile(); // refresh data
    } catch (err) {
      console.error(err);
    }
  };
  async function fetchProfile() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/profiles/${username}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: ProfileType = await res.json();
      setProfile(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const handleNavigate = () => {
    navigate("/messages", { state: { username: username } });
  };

  if (loading)
    return (
      <div>
        <p className="text-center h-screen text-gray-500 dark:bg-gray-900 "></p>
      </div>
    );
  if (!profile)
    return (
      <p className="text-center h-screen text-gray-500 dark:bg-gray-900 ">
        Profile not found
      </p>
    );

  return (
    <div className="flex justify-center w-full py-10 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="w-[850px] bg-white dark:bg-gray-800 rounded-2xl shadow-xl py-8 flex flex-col gap-8">
        <div className="relative px-8">
          <img
            src={profilePlaceholder}
            alt="Profile avatar"
            className="h-32 w-32 rounded-full object-cover border-gray-200 dark:border-gray-500 border-4 shadow-md"
          />
        </div>

        <div className="flex items-start px-8">
          <div className="flex flex-col justify-center">
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
              {profile.name}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-xl">
              @{profile.username}
            </p>
          </div>
          {profile.profileOwner ? (
            <button
              className="ml-auto dark:text-white py-1.5 px-5 rounded-full border dark:border-white cursor-pointer "
              onClick={() => setIsModalOpen(true)}
            >
              Edit profile
            </button>
          ) : (
            <div className="flex items-center justify-center border dark:border-white rounded-full p-1.5 ml-auto">
              <Mail
                className="dark:text-white size-5"
                onClick={handleNavigate}
              />
            </div>
          )}
        </div>

        {profile.bio && (
          <p className="text-lg text-white -mt-3 font-extralight px-8 ">
            {profile.bio}
          </p>
        )}

        {/* Stats */}
        <div className="px-8">
          <span className="flex gap-1">
            <p className="dark:text-white">{profile.friendsCount} </p>
            <p className="text-gray-400">
              {profile.friendsCount === 1 ? "Friend" : "Friends"}
            </p>
          </span>
        </div>
        <div className="flex flex-col gap-3">
          <div className="w-full border-b dark:border-gray-400" />
          {/* POSTS */}
          <div className="px-5 dark:text-white ">
            {profile.posts?.length === 0 ? (
              <div className="flex items-center justify-center text-xl text-white ">
                User has no posts yet.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {profile?.posts
                  ?.slice()
                  .reverse()
                  .map((post) => (
                    <Post key={post.id} post={post} onFetch={fetchProfile} />
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {isModalOpen && (
        <EditProfileModal
          onClose={() => setIsModalOpen(false)}
          currentName={profile.name}
          currentBio={profile.bio}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Profile;
