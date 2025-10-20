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
  
  5) mobile adaptation
  6) global search
  7) profile pics
  8) messages features
  
  finally{
    graphql, database integration
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

  if (loading)
    return (
      <div className="w-screen h-screen dark:bg-gray-800">
        <p className="">Loading...</p>;
      </div>
    );

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
