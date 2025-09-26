// src/context/UserContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";

type User = {
  username?: string;
  name?: string;
  surname?: string;
};

type UserContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        if (!mounted) return;
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:8000/data/username", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!mounted) return;

        if (!res.ok) {
          setUser(null);
        } else {
          const data = await res.json();
          setUser(data);
        }
      } catch (err) {
        if (!mounted) return;
        setUser(null);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    fetchUser();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
};
