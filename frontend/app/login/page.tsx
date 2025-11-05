"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Moon, Sun } from "lucide-react";

const Login: React.FC<{ dark: boolean; toggleTheme: () => void }> = ({
  toggleTheme,
  dark,
}) => {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const res = await fetch("http://localhost:8000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem("token", data.token);
    } else {
      alert(data.message || "Login failed");
    }
  };

  return (
    <div className=" bg-white dark:bg-gray-900 min-h-screen text-black dark:text-white">
      <div className="h-screen flex justify-center items-center relative">
        <button
          onClick={toggleTheme}
          className="absolute top-5 right-5 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center gap-2 bg-white dark:bg-gray-800 text-black dark:text-white"
        >
          {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          <span>{dark ? "Light Mode" : "Dark Mode"}</span>
        </button>

        <div className="border-gray-400 dark:border-gray-700 rounded-lg px-5 py-5 border flex flex-col w-[350px] bg-white dark:bg-gray-800">
          <h1 className="text-4xl font-bold">Log in</h1>

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
              <p>Password</p>
              <input
                type="password"
                className="h-7 font-bold w-full px-2 py-5 rounded-sm border border-gray-500 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <p className="mt-2 text-blue-500 cursor-pointer">Forgot password?</p>
          <button
            className="py-3 text-white bg-blue-400 dark:bg-blue-600 rounded-md mt-5 cursor-pointer"
            onClick={handleLogin}
          >
            Log In
          </button>

          <p className="mt-5 self-center">
            Don't have an account?{" "}
            <span
              className="text-blue-400 dark:text-blue-500 font-semibold cursor-pointer"
              onClick={() => {
                router.push("/register");
              }}
            >
              Sign up now!
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
