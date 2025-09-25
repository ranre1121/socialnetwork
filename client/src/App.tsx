import Login from "./sections/Login";
import Register from "./sections/Register";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState } from "react";
import Me from "./sections/Me";
import Messages from "./sections/Messages";
import Friends from "./sections/Friends";
import Profile from "./sections/Profile";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              isLoggedIn ? <Navigate to="/me" /> : <Navigate to="/login" />
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/friends" element={<Friends />} />

          <Route path="/me" element={<Me />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
