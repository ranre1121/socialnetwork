import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

const Me = () => {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");

  const navigate = useNavigate();
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/data/username", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        localStorage.removeItem("token");
        navigate("/login");
      }

      setUsername(data.username);
      setName(data.name);
      setSurname(data.surname);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div className="flex px-[50px] py-[20px]">
      <Navbar username={username} name={name} surname={surname} />
    </div>
  );
};

export default Me;
