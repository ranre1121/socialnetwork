"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import Post from "@/components/Post";
import EditProfileModal from "@/components/EditProfileModal";
import FriendsListModal from "@/components/FriendsListModal";
import ImageComponent from "@/components/ImageComponent";
import { Mail } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const { user } = useUser();
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);

  const { profile, loading, fetchProfile, handleSave } = useProfile(username!);

  useEffect(() => {
    if (user) fetchProfile();
  }, [user, fetchProfile]);

  const handleNavigate = () => {
    router.push(`/messages/chat/${username}`);
  };

  if (loading && !profile) {
    return (
      <div className="flex justify-center w-full py-10 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="w-[850px] bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 animate-pulse">
          <div className="h-32 w-32 rounded-full bg-gray-200 dark:bg-gray-700 mb-4" />
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 mb-2" />
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen dark:bg-gray-900 text-gray-400">
        Profile not found
      </div>
    );
  }

  return (
    <div className="flex justify-center w-full py-10 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      <div className="w-[850px] bg-white dark:bg-gray-800 rounded-2xl shadow-xl pt-8 flex flex-col transition-colors">
        <div className="flex flex-col gap-3">
          <div className="relative px-8">
            <div className="border border-gray-300 size-fit rounded-full">
              <ImageComponent src={profile.profilePicture} size={125} />
            </div>
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
                className="ml-auto dark:text-white py-1.5 px-5 rounded-full border dark:border-white cursor-pointer"
                onClick={() => setIsModalOpen(true)}
              >
                Edit profile
              </button>
            ) : (
              <div
                className="flex items-center justify-center border dark:border-white rounded-full p-1.5 ml-auto cursor-pointer"
                onClick={handleNavigate}
              >
                <Mail className="dark:text-white size-5" />
              </div>
            )}
          </div>

          {profile.bio && (
            <p className="text-lg -mt-3 font-extralight px-8">{profile.bio}</p>
          )}

          <div className="px-8">
            <span
              className="flex cursor-pointer hover:underline"
              onClick={() => setShowFriendsModal(true)}
            >
              <p>{profile.friendsCount}&nbsp;</p>
              <p className="text-gray-400">
                {profile.friendsCount === 1 ? "Friend" : "Friends"}
              </p>
            </span>
          </div>
        </div>

        <div className="w-full border-b dark:border-gray-700 mt-5" />

        <div className="flex flex-col gap-3 overflow-y-auto h-[550px] py-6 px-5">
          {profile.posts?.length === 0 ? (
            <div className="flex items-center justify-center text-xl">
              User has no posts yet.
            </div>
          ) : (
            profile.posts
              .slice()
              .reverse()
              .map((post) => (
                <Post key={post.id} post={post} onFetch={fetchProfile} />
              ))
          )}
        </div>
      </div>

      {isModalOpen && (
        <EditProfileModal
          onClose={() => setIsModalOpen(false)}
          currentName={profile.name}
          currentBio={profile.bio}
          currentImage={profile.profilePicture}
          onSave={handleSave}
        />
      )}

      {showFriendsModal && (
        <FriendsListModal
          username={username!}
          onClose={() => setShowFriendsModal(false)}
        />
      )}
    </div>
  );
};

export default Profile;
