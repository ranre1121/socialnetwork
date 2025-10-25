import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useUser } from "./context/UserContext";

import Navbar from "./components/Navbar";
import Login from "./sections/Login";
import Register from "./sections/Register";
import Me from "./sections/Me";
import Messages from "./sections/Messages";
import Friends from "./sections/Friends";
import Profile from "./sections/Profile";
/** TODO:
  
  1) messages socket connect
  2) messages pagination
  4) mobile adaptation
  5) global search
  6) profile pics
  
  
  finally{
    graphql
  }
 */

const App = () => {
  const { user, loading } = useUser();
  const [dark, setDark] = useState(false);

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

  if (loading) return <div className="w-screen h-screen dark:bg-gray-800" />;

  return (
    <Router>
      {user && <Navbar dark={dark} toggleTheme={toggleTheme} />}
      <Routes>
        <Route path="/" element={user ? <Me /> : <Navigate to="/login" />} />
        <Route path="/me" element={user ? <Me /> : <Navigate to="/login" />} />
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/me" />
            ) : (
              <Login dark={dark} toggleTheme={toggleTheme} />
            )
          }
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/me" /> : <Register />}
        />
        <Route
          path="/profile/:username"
          element={user ? <Profile /> : <Navigate to="/login" />}
        />
        <Route
          path="/messages"
          element={user ? <Messages /> : <Navigate to="/login" />}
        />
        <Route
          path="/friends"
          element={user ? <Friends /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
};
export default App;
