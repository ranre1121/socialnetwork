import type { Request, Response } from "express";
import prisma from "../prisma.js";

interface AuthenticatedRequest extends Request {
  user?: { username: string };
}

export async function addPost(req: AuthenticatedRequest, res: Response) {
  try {
    const username = req.user?.username;
    if (!username) return res.status(401).json({ error: "Not authorized" });

    const author = await prisma.user.findUnique({ where: { username } });
    if (!author) return res.status(404).json({ error: "Author not found" });

    const { content } = req.body;
    if (!content || typeof content !== "string") {
      return res.status(400).json({ error: "Invalid content" });
    }

    const newPost = await prisma.post.create({
      data: {
        authorId: author.id,
        content,
      },
      include: {
        author: { select: { id: true, name: true, username: true } },
        likes: { select: { username: true } },
      },
    });

    res.status(201).json(newPost);
  } catch (err) {
    console.error("addPost error:", err);
    res.status(500).json({ error: "Failed to save post" });
  }
}

export async function getFeedPosts(req: AuthenticatedRequest, res: Response) {
  try {
    const username = req.user?.username;
    if (!username) return res.status(401).json({ error: "Unauthorized" });

    const user = await prisma.user.findUnique({ where: { username } });
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

    const posts = await prisma.post.findMany({
      where: { authorId: { in: [user.id, ...friendIds] } },
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true, username: true } },
        likes: { select: { username: true, name: true } },
      },
    });

    res.status(200).json(posts);
  } catch (err) {
    console.error("getFeedPosts error:", err);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
}

export async function deletePost(req: AuthenticatedRequest, res: Response) {
  try {
    const username = req.user?.username;
    if (!username) return res.status(401).json({ error: "Unauthorized" });

    if (!req.params.id) {
      return res.status(400).json({ error: "Invalid post ID" });
    }

    const postId = parseInt(req.params.id);
    if (isNaN(postId))
      return res.status(400).json({ error: "Invalid post ID" });

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { author: true },
    });
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (post.author.username !== username)
      return res.status(403).json({ error: "Not allowed to delete this post" });

    await prisma.post.delete({ where: { id: postId } });
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("deletePost error:", err);
    res.status(500).json({ error: "Failed to delete post" });
  }
}

export async function likePost(req: AuthenticatedRequest, res: Response) {
  try {
    const username = req.user?.username;
    if (!username) return res.status(401).json({ error: "Unauthorized" });

    if (!req.params.id) {
      return res.status(400).json({ error: "Invalid post ID" });
    }

    const postId = parseInt(req.params.id);
    if (isNaN(postId))
      return res.status(400).json({ error: "Invalid post ID" });

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { likes: { select: { id: true, username: true } } },
    });
    if (!post) return res.status(404).json({ error: "Post not found" });

    const alreadyLiked = post.likes.some((u) => u.username === username);

    let updatedPost;
    if (alreadyLiked) {
      updatedPost = await prisma.post.update({
        where: { id: postId },
        data: { likes: { disconnect: { id: user.id } } },
        include: { likes: { select: { username: true } } },
      });
    } else {
      updatedPost = await prisma.post.update({
        where: { id: postId },
        data: { likes: { connect: { id: user.id } } },
        include: { likes: { select: { username: true } } },
      });
    }

    res.json({
      success: true,
      liked: !alreadyLiked,
      likes: updatedPost.likes.map((u) => u.username),
    });
  } catch (err) {
    console.error("likePost error:", err);
    res.status(500).json({ error: "Server error" });
  }
}
