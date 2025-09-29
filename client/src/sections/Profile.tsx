import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import profilePlaceholder from "../../public/images/profile-placeholder.png";
import type { User, Post } from "../types/Types";

const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // get user id from route
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch user info
        const userRes = await fetch(`http://localhost:8000/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await userRes.json();
        setUser(userData);

        // Fetch user's posts (if you have a route like /posts/user/:id)
        const postsRes = await fetch(`http://localhost:8000/posts/user/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const postsData = await postsRes.json();
        setPosts(postsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="w-[850px] bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 text-center">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-[850px] bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 text-center">
        <p className="text-gray-500">User not found.</p>
      </div>
    );
  }

  const postCount = posts.length;
  const friendsCount = user.friends?.length || 0;

  return (
    <div className="w-[850px] bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-200 dark:border-gray-700 flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <img
          src={profilePlaceholder}
          alt="Profile"
          className="size-20 rounded-full border border-gray-300 dark:border-gray-600"
        />
        <div>
          <h2 className="text-2xl font-bold">
            {user.name} {user.surname}
          </h2>
          <p className="text-gray-500">@{user.username}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-8 mt-4 text-sm">
        <p>
          <span className="font-semibold">{postCount}</span> Posts
        </p>
        <p>
          <span className="font-semibold">{friendsCount}</span> Friends
        </p>
      </div>

      {/* Bio */}
      <div className="mt-4">
        <h3 className="font-semibold">About</h3>
        <p className="text-gray-600 dark:text-gray-400">
          {user.bio || "No bio yet. Add one soon!"}
        </p>
      </div>
    </div>
  );
};

export default Profile;
