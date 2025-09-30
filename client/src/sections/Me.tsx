import { useUser } from "../context/UserContext";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import Post from "../components/Post";
import type { Post as PostType } from "../types/Types";

const Me = () => {
  const { user } = useUser();
  const [focused, setFocused] = useState(false);
  const [content, setContent] = useState("");
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Fetch posts from backend
  const fetchPosts = async () => {
    if (!user) return;
    setLoadingPosts(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/posts/feed", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setPosts(data);
      } else {
        console.error(data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user]);

  // Create a new post
  const handlePost = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/posts/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ author: user.username, content }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.error);
      } else {
        setContent("");
        fetchPosts();
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Delete a post

  return (
    <div className="flex h-full min-h-screen w-screen py-10 bg-white dark:bg-gray-900 text-black dark:text-white">
      <div className="flex flex-1 flex-col items-center justify-start gap-5">
        {/* Create Post Card */}
        <div className="w-[850px] bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 flex flex-col gap-4 border border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-semibold">Create a Post</h1>

          <motion.textarea
            onFocus={() => setFocused(true)}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={() => setFocused(false)}
            placeholder={`What's on your mind, ${user?.name.split(" ")[0]}?`}
            initial={{ height: "40px" }}
            animate={{ height: focused ? "200px" : "40px" }}
            transition={{ duration: 0.3 }}
            className="w-full resize-none px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none bg-white dark:bg-gray-700 text-black dark:text-white"
          />

          <div className="border-t border-gray-200 dark:border-gray-700"></div>

          <div className="flex justify-end gap-3">
            <button
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
              onClick={handlePost}
            >
              Post
            </button>
          </div>
        </div>

        {/* Posts Feed */}
        <div className="w-[850px] h-full bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 flex flex-col gap-4 border border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-semibold">Posts</h1>

          {loadingPosts ? (
            <p className="text-gray-500 self-center mt-4">Loading...</p>
          ) : posts.length === 0 ? (
            <p className="text-gray-500 self-center mt-4">No posts yet</p>
          ) : (
            posts
              .slice()
              .reverse()
              .map((post) => (
                <Post key={post.id} post={post} onFetch={fetchPosts} />
              ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Me;
