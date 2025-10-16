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
  const [loadingPosts, setLoadingPosts] = useState(true);

  const fetchPosts = async () => {
    if (!user) return;
    setLoadingPosts(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/posts/feed", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setPosts(data || []);
      } else {
        console.error(data.error || "Failed to load posts");
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

  const handlePost = async () => {
    if (!user || !content.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/posts/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      const data = await res.json();

      if (res.ok) {
        setContent("");
        fetchPosts();
      } else {
        console.error(data.error || "Failed to create post");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-full min-h-screen w-screen py-10 bg-gray-50 dark:bg-gray-900 text-black dark:text-white">
      <div className="flex flex-1 flex-col items-center justify-start gap-5">
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
              disabled={!content.trim()}
              className={`px-4 py-2 rounded-lg font-medium transition bg-blue-600 text-white hover:bg-blue-700 ${
                content.trim() ? "" : "cursor-not-allowed"
              }`}
              onClick={handlePost}
            >
              Post
            </button>
          </div>
        </div>

        <div className="w-[850px] h-full bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 flex flex-col gap-4 border border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-semibold">Posts</h1>

          {loadingPosts ? (
            <div className="size-5 border border-t-0 border-indigo-500 animate-spin" />
          ) : posts.length === 0 ? (
            <p className="text-gray-500 self-center mt-4">No posts yet</p>
          ) : (
            posts.map((post) => <Post post={post} />)
          )}
        </div>
      </div>
    </div>
  );
};

export default Me;
