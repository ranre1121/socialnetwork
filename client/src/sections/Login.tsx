import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useUser } from "../context/UserContext"; // 👈 import context

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useUser(); // 👈 grab setUser from context

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

      // 👇 Immediately update context so app knows user is logged in

      setUser(data.user);

      // 👇 Then redirect
      navigate("/me");
    } else {
      alert(data.message || "Login failed");
    }
  };

  return (
    <div className="px-[100px] ">
      <div className="h-screen flex justify-center items-center">
        <div className="border-gray-400 rounded-lg px-5 py-5 border flex flex-col w-[350px]">
          <h1 className="text-4xl font-bold">Log in</h1>

          <div className="flex flex-col gap-5 mt-7">
            <div>
              <p>Username</p>
              <input
                type="text"
                className="h-7 w-full px-2 py-5 rounded-sm border border-gray-500"
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <p>Password</p>
              <input
                type="password"
                className="h-7 font-bold w-full px-2 py-5 rounded-sm border border-gray-500"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <p className="mt-2 text-blue-500 cursor-pointer">Forgot password?</p>
          <button
            className="py-3 text-white bg-blue-400 rounded-md mt-5 cursor-pointer"
            onClick={handleLogin}
          >
            Log In
          </button>

          <p className="mt-5 self-center">
            Don't have an account?{" "}
            <Link to={"/register"}>
              <span className="text-blue-400 font-semibold cursor-pointer">
                Sign up now!
              </span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
