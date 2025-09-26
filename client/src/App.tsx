// App.tsx
import Login from "./sections/Login";
import Register from "./sections/Register";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Me from "./sections/Me";
import Messages from "./sections/Messages";
import Friends from "./sections/Friends";
import Profile from "./sections/Profile";
import { useUser } from "./context/UserContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const App = () => {
  const { user, loading } = useUser();

  if (loading) return <p>Loading...</p>;

  return (
    <Router>
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
