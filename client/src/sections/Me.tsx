import Navbar from "../components/Navbar";
import { useUser } from "../context/UserContext";
import { motion } from "motion/react";
import { useState } from "react";

const Me = () => {
  const { user } = useUser();
  const [focused, setFocused] = useState(false);

  return (
    <div className="flex h-screen w-screen py-10 bg-white dark:bg-gray-900 text-black dark:text-white">
      {/* Centered content */}
      <div className="flex flex-1 flex-col items-center justify-start gap-5">
        {/* Create Post Card */}
        <div className="w-[850px] bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 flex flex-col gap-4 border border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-semibold">Create a Post</h1>

          <motion.textarea
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={`What's on your mind, ${user?.name}?`}
            initial={{ height: "40px" }}
            animate={{ height: focused ? "200px" : "40px" }}
            transition={{ duration: 0.3 }}
            className="w-full resize-none px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none bg-white dark:bg-gray-700 text-black dark:text-white"
          />

          <div className="border-t border-gray-200 dark:border-gray-700"></div>

          <div className="flex justify-end gap-3">
            <button className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition">
              Post
            </button>
          </div>
        </div>

        {/* Second Card */}
        <div className="w-[850px] bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 flex flex-col gap-4 h-[350px] border border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-semibold">Posts</h1>
        </div>
      </div>
    </div>
  );
};

export default Me;
