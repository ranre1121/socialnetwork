import type { Request, Response } from "express";
import prisma from "../prisma.js";

export async function getProfile(req: Request, res: Response) {
  try {
    const username = req.params.username;
    const currentUser = req.user?.username;

    if (!username)
      return res.status(400).json({ error: "Enter a valid username" });
    if (!currentUser) return res.status(401).json({ error: "Not authorized" });

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const viewer = await prisma.user.findUnique({
      where: { username: currentUser },
      select: { id: true },
    });
    if (!viewer) return res.status(404).json({ error: "Viewer not found" });

    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ requesterId: user.id }, { addresseeId: user.id }],
        status: "ACCEPTED",
      },
    });

    const userPosts = await prisma.post.findMany({
      where: { authorId: user.id },
      include: {
        author: { select: { id: true, name: true, username: true } },
        likes: {
          where: { id: viewer.id },
          select: { id: true },
        },
        _count: { select: { comments: true, likes: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const response = {
      username: user.username,
      name: user.name,
      bio: user.bio || "",
      friendsCount: friendships.length,
      profileOwner: currentUser === username,
      posts: userPosts.map((post) => ({
        id: post.id,
        content: post.content,
        createdAt: post.createdAt,
        author: post.author,
        liked: post.likes.length > 0,
        likesCount: post._count.likes,
        commentsCount: post._count.comments,
      })),
    };

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load profile" });
  }
}

export async function updateProfile(req: Request, res: Response) {
  try {
    const currentUser = req.user?.username;

    if (!currentUser) return res.status(401).json({ error: "Unauthorized" });

    const { name, bio, isProfileOwner } = req.body;
    if (!isProfileOwner) return res.status(400).json({ error: "No access" });

    await prisma.user.update({
      where: { username: currentUser },
      data: { name, bio },
    });

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update profile" });
  }
}
