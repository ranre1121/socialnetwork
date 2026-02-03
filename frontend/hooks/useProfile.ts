import { useState, useCallback } from "react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import type { Profile as ProfileType } from "@/types/Types";

export const useProfile = (username: string) => {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profiles/${username}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        setUser(null);
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch profile");

      const data = await res.json();
      setProfile(data);
      return data;
    } catch (err) {
      console.error(err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [username, user, setUser, router]);

  const handleSave = useCallback(
    async (name: string, bio: string) => {
      if (!profile) return;

      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profiles/update`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            bio,
            isProfileOwner: profile.profileOwner,
          }),
        });

        if (res.status === 401) {
          setUser(null);
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        if (!res.ok) throw new Error("Failed to update profile");

        const updatedProfile = await fetchProfile();
        setUser(updatedProfile);
      } catch (err) {
        console.error(err);
      }
    },
    [profile, fetchProfile, setUser, router]
  );

  return { profile, loading, fetchProfile, handleSave };
};
