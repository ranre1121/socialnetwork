import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Content = () => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8000/data/username", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (!res.ok) navigate("/");
        setUsername(data.username);
      } catch (error) {
        console.log(error);
      }
    };
    fetchUsername();
  }, []);

  return <div>Hello, {username}!</div>;
};

export default Content;
