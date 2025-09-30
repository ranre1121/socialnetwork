import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [message, setMessage] = useState("");

  async function handleRegister() {
    if (password !== passwordConfirmation) {
      alert("Passwords do not match");
      return;
    }
    try {
      const res = await fetch("http://localhost:8000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, name }),
      });

      const data = await res.json();

      if (res.ok) {
        navigate("/login");
      } else {
        setMessage(data.message || "Registration failed");
      }
    } catch (error) {
      console.log(error);
      setMessage("Something went wrong");
    }
  }

  return (
    <div className="px-[100px] ">
      <div className="h-screen flex justify-center items-center flex-col">
        <div className="border-gray-400 rounded-lg px-5 py-5 border flex flex-col w-[350px]">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font bold">Register</h1>
            {/* <span className="flex text-xl items-center gap-1">
              to
              <p className="text-xl font-semibold bg-gradient-to-r  from-yellow-200 to-yellow-300 w-fit px-1">
                Notes
              </p>
            </span> */}
          </div>
          <div className="flex flex-col gap-5 mt-7">
            <div>
              <p>Username</p>
              <input
                type="text"
                className="h-7 w-full px-2 py-5 rounded-sm border border-gray-500"
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
              />
            </div>
            <div>
              <p>Name</p>
              <input
                type="text"
                className="h-7 w-full px-2 py-5 rounded-sm border border-gray-500"
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
            </div>

            <div>
              <p>Password</p>
              <input
                type="password"
                className="h-7 font-bold w-full px-2 py-5 rounded-sm border border-gray-500"
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
              />
            </div>
            <div>
              <p>Confirm Password</p>
              <input
                type="password"
                className="h-7 font-bold w-full px-2 py-5 rounded-sm border border-gray-500"
                onChange={(e) => {
                  setPasswordConfirmation(e.target.value);
                }}
              />
            </div>
          </div>

          <button
            className="py-3 text-white bg-blue-400 rounded-md mt-5 cursor-pointer"
            onClick={handleRegister}
          >
            Register
          </button>
          <p className="mt-5 self-center">
            Already have an account?{" "}
            <Link to={"/login"}>
              <span className="text-blue-400 font-semibold cursor-pointer">
                Log in
              </span>
            </Link>
          </p>
        </div>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default Register;
