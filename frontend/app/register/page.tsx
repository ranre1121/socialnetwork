"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const Register = () => {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [message, setMessage] = useState("");

  const { dark, toggleTheme } = useTheme();

  async function handleRegister() {
    if (password !== passwordConfirmation) {
      alert("Passwords do not match");
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, name }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/login");
      } else {
        setMessage(data.message || "Registration failed");
      }
    } catch {
      setMessage("Something went wrong");
    }
  }

  return (
    <div className=" bg-white dark:bg-gray-900 min-h-screen text-black dark:text-white">
      <div className="h-screen flex justify-center items-center flex-col relative">
        <button
          onClick={toggleTheme}
          className="absolute top-5 right-5 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center gap-2 bg-white dark:bg-gray-800 text-black dark:text-white"
        >
          {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          <span>{dark ? "Dark Mode" : "Light Mode"}</span>
        </button>

        <div className="border-gray-400 dark:border-gray-700 rounded-lg px-5 py-5 border flex flex-col w-[350px] bg-white dark:bg-gray-800">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold">Register</h1>
          </div>

          <div className="flex flex-col gap-5 mt-7">
            <div>
              <p>Username</p>
              <input
                type="text"
                className="h-7 w-full px-2 py-5 rounded-sm border border-gray-500 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <p>Name</p>
              <input
                type="text"
                className="h-7 w-full px-2 py-5 rounded-sm border border-gray-500 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <p>Password</p>
              <input
                type="password"
                className="h-7 font-bold w-full px-2 py-5 rounded-sm border border-gray-500 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <p>Confirm Password</p>
              <input
                type="password"
                className="h-7 font-bold w-full px-2 py-5 rounded-sm border border-gray-500 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
                onChange={(e) => setPasswordConfirmation(e.target.value)}
              />
            </div>
          </div>

          <button
            className="py-3 text-white bg-blue-400 dark:bg-blue-600 rounded-md mt-5 cursor-pointer"
            onClick={handleRegister}
          >
            Register
          </button>

          <p className="mt-5 self-center">
            Already have an account?{" "}
            <span
              className="text-blue-400 dark:text-blue-500 font-semibold cursor-pointer"
              onClick={() => {
                router.push("/login");
              }}
            >
              Log in
            </span>
          </p>
        </div>
        <p className="mt-3">{message}</p>
      </div>
    </div>
  );
};

export default Register;
