import type { Request, Response } from "express";
import { loadPosts, savePosts } from "../utils/postsUtils.js";
import { loadUsers } from "../utils/authUtils.js";
import type { User } from "../types/types.js";

export const addPost = (req: Request, res: Response) => {
  try {
    const { author, content } = req.body;
    const posts = loadPosts();

    const lastId = posts.length > 0 ? posts[posts.length - 1]?.id ?? 0 : 0;

    const newPost = {
      id: lastId + 1,
      author,
      content,
      createdAt: new Date().toISOString(),
    };

    posts.push(newPost);
    savePosts(posts);

    res.status(201).json(newPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save post" });
  }
};

export const getFeedPosts = (req: Request, res: Response) => {
  try {
    const username = req.user.username;
    const posts = loadPosts();
    const users = loadUsers();
    const user = users.find((u: User) => u.username === username);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Include user's own posts + friends' posts
    const relevantPosts = posts.filter(
      (p) => p.author === username || user.friends.includes(p.author)
    );

    res.json(relevantPosts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
};
