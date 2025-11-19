import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import prisma from "../prisma.js";

dotenv.config();

export async function registerUser(req: Request, res: Response) {
  try {
    const { username, password, name } = req.body;

    if (!username || !password || !name) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return res.status(400).json({ msg: "Username already taken" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        name,
        password: hashedPassword,
        bio: "",
        profilePicture: "http://localhost:8000/uploads/profile-placeholder.png",
      },
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        createdAt: true,
      },
    });

    res.status(201).json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
}

export async function loginUser(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ msg: "Username and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ msg: "Invalid password" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: "1h",
    });

    const chats = await prisma.userChatRead.findMany({
      where: { userId: user.id },
      select: {
        chatId: true,
        lastReadMessageId: true,
      },
    });

    const chatIds = chats.map((c) => c.chatId);

    const chatData = await prisma.chat.findMany({
      where: { id: { in: chatIds } },
      select: {
        id: true,
        lastMessageId: true,
      },
    });

    const chatMap = chatData.reduce((acc, chat) => {
      acc[chat.id] = chat.lastMessageId;
      return acc;
    }, {} as Record<number, number | null>);

    const totalUnread = chats.reduce((sum, c) => {
      const lastMsg = chatMap[c.chatId];
      const lastRead = c.lastReadMessageId;
      if (lastMsg == null || lastRead == null) return sum;
      return sum + Math.max(lastMsg - lastRead, 0);
    }, 0);

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        profilePicture: user.profilePicture,
        notifications: {
          messages: totalUnread,
        },
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
}

export async function welcome(req: Request, res: Response) {
  const id = req.user?.id;
  if (!id) return res.status(401).json({ error: "Not authorized" });

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) return res.status(404).json({ error: "User was not found" });

  const chats = await prisma.userChatRead.findMany({
    where: { userId: user.id },
    select: {
      chatId: true,
      lastReadMessageId: true,
    },
  });

  const chatIds = chats.map((c) => c.chatId);

  const chatData = await prisma.chat.findMany({
    where: { id: { in: chatIds } },
    select: {
      id: true,
      lastMessageId: true,
    },
  });

  const chatMap = chatData.reduce((acc, chat) => {
    acc[chat.id] = chat.lastMessageId;
    return acc;
  }, {} as Record<number, number | null>);

  const unreadChatsCount = chats.reduce((count, c) => {
    const lastMsg = chatMap[c.chatId];
    const lastRead = c.lastReadMessageId;
    if (lastMsg == null || lastRead == null) return count;
    return count + (lastMsg - lastRead > 0 ? 1 : 0);
  }, 0);

  return res.status(200).json({
    userId: user.id,
    username: user.username,
    profilePicture: user.profilePicture,
    name: user.name,
    notifications: {
      messages: unreadChatsCount,
    },
  });
}
