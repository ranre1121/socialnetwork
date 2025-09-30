import type { Request, Response } from "express";
import { loadProfiles, saveProfiles } from "../utils/profilesUtils.js";
import { loadUsers } from "../utils/authUtils.js";
import { loadFriends } from "../utils/friendsUtils.js";
import type { User } from "../types/types.js";
import { loadPosts } from "../utils/postsUtils.js";

export function getProfile(req: Request, res: Response) {
  try {
    const username = req.params.username;
    const currentUser = req.user.username;
    const users = loadUsers();
    const profiles = loadProfiles();
    const friends = loadFriends();
    const posts = loadPosts();

    const user = users.find((u: User) => u.username === username);
    if (!user) return res.status(404).json({ error: "User not found" });
    const profile = profiles.find((p: any) => p.username === username) || {};
    const friendEntry = friends.find((f: any) => f.username === username);
    const userPosts = posts.filter((post: any) => post.author === username);

    const response = {
      username: user.username,
      name: user.name,
      surname: user.surname || "", // add surname if available
      bio: profile.bio || "",
      friendsCount: friendEntry?.friends.length || 0,
      profileOwner: currentUser === username,
      posts: userPosts, // 👈 include posts
    };

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load profile" });
  }
}

export function updateProfile(req: Request, res: Response) {
  try {
    const username = req.user?.username;
    if (!username) return res.status(401).json({ error: "Unauthorized" });

    const { bio } = req.body;
    const profiles = loadProfiles();

    let profile = profiles.find((p: any) => p.username === username);

    if (profile) {
      profile.bio = bio;
    } else {
      profile = { username, bio };
      profiles.push(profile);
    }

    saveProfiles(profiles);

    res.json({ message: "Profile updated successfully", profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update profile" });
  }
}
