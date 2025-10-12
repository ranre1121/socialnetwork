import type { Request, Response } from "express";
import prisma from "../prisma.js";

export async function addPost(req: Request, res: Response) {
  try {
    const username = req.user?.username;
    if (!username) return res.status(400).json("Not authorized");

    const author = await prisma.user.findUnique({
      where: { username },
    });

    if (!author) return res.status(404).json({ error: "Author not found" });

    const { content } = req.body;

    const newPost = await prisma.post.create({
      data: {
        author: { connect: { id: author.id } },
        content,
        likes: [],
      },
      include: {
        author: {
          select: { id: true, name: true, username: true },
        },
      },
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

    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ requesterId: user.id }, { addresseeId: user.id }],
        status: "ACCEPTED",
      },
    });

    const friendIds = friendships.map((f) =>
      f.requesterId === user.id ? f.addresseeId : f.requesterId
    );

    const relevantPosts = await prisma.post.findMany({
      where: {
        authorId: { in: [user.id, ...friendIds] },
      },
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true, username: true } },
      },
    });

    res.status(200).json({ relevantPosts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
}

export async function deletePost(req: any, res: Response) {
  try {
    const username = req.user?.username;
    if (!username) return res.status(401).json({ error: "Unauthorized" });

    const postId = parseInt(req.params.id);
    if (isNaN(postId))
      return res.status(400).json({ error: "Invalid post ID" });

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { author: true },
    });

    if (!post) return res.status(404).json({ error: "Post not found" });

    if (post.author.username !== username) {
      return res.status(403).json({ error: "Not allowed to delete this post" });
    }

    await prisma.post.delete({ where: { id: postId } });
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete post" });
  }
}

export async function likePost(req: any, res: Response) {
  try {
    const username = req.user?.username;
    if (!username) return res.status(401).json({ error: "Unauthorized" });

    const postId = parseInt(req.params.id);
    if (isNaN(postId))
      return res.status(400).json({ error: "Invalid post ID" });

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { likes: true },
    });

    if (!post) return res.status(404).json({ error: "Post not found" });

    const likes = Array.isArray(post.likes) ? (post.likes as string[]) : [];

    const alreadyLiked = likes.includes(username);

    const updatedLikes = alreadyLiked
      ? likes.filter((u) => u !== username) // unlike
      : [...likes, username]; // like

    const updated = await prisma.post.update({
      where: { id: postId },
      data: { likes: updatedLikes },
      select: { id: true, likes: true },
    });

    res.json({ success: true, liked: !alreadyLiked, likes: updated.likes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
