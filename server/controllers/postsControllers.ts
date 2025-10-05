import type { Request, Response } from "express";
import { loadPosts, savePosts } from "../utils/postsUtils.js";
import { loadUsers } from "../utils/authUtils.js"; // users.json
import { loadFriends } from "../utils/friendsUtils.js"; // friends.json
import prisma from "../prisma.js";

export async function addPost(req: Request, res: Response) {
  try {
    const author = req.user?.username;
    if (!author) return res.status(400).json("Not authorized");

    const { content } = req.body;

    const newPost = await prisma.post.create({
      data: { author, content, likes: [] },
    });

    res.status(201).json(newPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save post" });
  }
}

export async function getFeedPosts(req: any, res: Response) {
  try {
    const username = req.user?.username;
    if (!username) return res.status(401).json({ error: "Unauthorized" });

    const user = await prisma.user.findUnique({
      where: { username },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    // 1️⃣ Find accepted friendships involving this user
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ requesterId: user.id }, { addresseeId: user.id }],
        status: "ACCEPTED",
      },
    });

    // 2️⃣ Extract friend IDs (the other user in each friendship)
    const friendIds = friendships.map((f) =>
      f.requesterId === user.id ? f.addresseeId : f.requesterId
    );

    // 3️⃣ Get usernames of all friends
    const friends = await prisma.user.findMany({
      where: { id: { in: friendIds } },
      select: { username: true },
    });

    const friendUsernames = friends.map((f) => f.username);

    // 4️⃣ Fetch posts by this user or any of their friends
    const relevantPosts = await prisma.post.findMany({
      where: {
        author: { in: [username, ...friendUsernames] },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ relevantPosts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
}

export const deletePost = (req: any, res: Response) => {
  try {
    const username = req.user?.username;
    if (!username) return res.status(401).json({ error: "Unauthorized" });

    const postId = parseInt(req.params.id);
    if (isNaN(postId))
      return res.status(400).json({ error: "Invalid post ID" });

    const posts = loadPosts();
    const postIndex = posts.findIndex((p) => p.id === postId);

    if (postIndex === -1) {
      return res.status(404).json({ error: "Post not found" });
    }

    const post = posts[postIndex];
    if (post?.author !== username) {
      return res
        .status(403)
        .json({ error: "You can only delete your own posts" });
    }

    posts.splice(postIndex, 1);
    savePosts(posts);

    res.json({ message: "Post deleted successfully", postId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete post" });
  }
};
