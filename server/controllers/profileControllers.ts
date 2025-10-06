import type { Request, Response } from "express";
import prisma from "../prisma.js";

export async function getProfile(req: Request, res: Response) {
  try {
    const username = req.params.username;
    const currentUser = req.user?.username;

    if (!username)
      return res.status(200).json({ msg: "Enter a valid username" });
    if (!currentUser) return res.status(200).json({ msg: "Not authorized" });

    const user = await prisma.user.findUnique({
      where: { username: username },
      select: { name: true, username: true, bio: true, id: true },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ requesterId: user.id }, { addresseeId: user.id }],
        status: "ACCEPTED",
      },
    });

    const userPosts = await prisma.post.findMany({
      where: { authorId: user.id },
      include: { author: true },
    });

    const response = {
      username: user.username,
      name: user.name,
      bio: user.bio || "",
      friendsCount: friendships.length,
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

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update profile" });
  }
}
