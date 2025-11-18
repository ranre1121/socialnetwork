"use client";
import { useUser } from "@/context/UserContext";
import { useState, useEffect } from "react";
import { usePosts } from "@/hooks/usePosts";
import Post from "@/components/Post";

const Me = () => {
  const { user } = useUser();
  const [content, setContent] = useState("");
  const { posts, loadingPosts, fetchPosts, handlePost } = usePosts();

  useEffect(() => {
    fetchPosts();
  }, [user, fetchPosts]);

  return (
    <div className="flex h-full min-h-screen w-screen py-10 bg-gray-50 dark:bg-gray-900 text-black dark:text-white">
      <div className="flex flex-1 flex-col items-center justify-start gap-5">
        <div className="w-[850px] bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 flex flex-col gap-4 border border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-semibold">Create a Post</h1>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`What's on your mind, ${user?.name.split(" ")[0]}?`}
            className="w-full h-[100px] resize-none px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none bg-white dark:bg-gray-700 text-black dark:text-white"
          />

          <div className="border-t border-gray-200 dark:border-gray-700"></div>

          <div className="flex justify-end gap-3">
            <button
              disabled={!content.trim()}
              className={`px-4 py-2 rounded-lg font-medium transition bg-blue-600 text-white hover:bg-blue-700 ${
                content.trim() ? "" : "cursor-not-allowed"
              }`}
              onClick={() => handlePost(content, () => setContent(""))}
            >
              Post
            </button>
          </div>
        </div>

        <div className="w-[850px] h-[550px] bg-white relative dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="sticky top-0 z-10 w-full rounded-t-2xl bg-gray-800 py-3 px-6 border-b border-gray-700">
            <h1 className="text-xl font-semibold">Posts</h1>
          </div>

          <div className="flex flex-col gap-4 px-6 py-3">
            {loadingPosts ? (
              <div className="size-5 border-2 border-indigo-500 rounded-full animate-spin border-t-transparent self-center mt-5" />
            ) : posts.length === 0 ? (
              <p className="text-gray-500 self-center mt-4">No posts yet</p>
            ) : (
              posts.map((post) => (
                <Post key={post.id} post={post} onFetch={fetchPosts} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Me;
