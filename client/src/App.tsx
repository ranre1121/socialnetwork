import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useUser } from "./context/UserContext";

import Navbar from "./components/Navbar";
import Login from "./sections/Login";
import Register from "./sections/Register";
import Me from "./sections/Me";
import Messages from "./sections/Messages";
import Friends from "./sections/Friends";
import Profile from "./sections/Profile";

const App = () => {
  const { user, loading } = useUser();
  const [dark, setDark] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    const isDark =
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleTheme = () => {
    const newDark = !dark;
    setDark(newDark);
    document.documentElement.classList.toggle("dark", newDark);
    localStorage.setItem("theme", newDark ? "dark" : "light");
  };

  if (loading) return <p>Loading...</p>;

  return (
    <Router>
      {user && <Navbar dark={dark} toggleTheme={toggleTheme} />}
      <Routes>
        <Route path="/" element={user ? <Me /> : <Login />} />
        <Route path="/me" element={<Me />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/friends" element={<Friends />} />
      </Routes>
    </Router>
  );
};

export default App;
