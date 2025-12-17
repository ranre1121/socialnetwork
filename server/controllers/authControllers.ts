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

    const userChats = await prisma.userChatRead.findMany({
      where: { userId: user.id },
      select: {
        chatId: true,
        messagesRead: true,
        chat: {
          select: {
            lastMessageId: true,
            totalMessages: true,
          },
        },
      },
    });

    const unreadChatsCount = userChats.filter(
      (uc) =>
        uc.chat.totalMessages != null &&
        uc.messagesRead != null &&
        uc.chat.totalMessages > uc.messagesRead
    ).length;

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        profilePicture: user.profilePicture,
        notifications: {
          messages: unreadChatsCount,
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

  const userChats = await prisma.userChatRead.findMany({
    where: { userId: user.id },
    select: {
      chatId: true,
      messagesRead: true,
      chat: {
        select: {
          totalMessages: true,
          id: true,
        },
      },
    },
  });

  const unreadChatsCount = userChats
    .filter(
      (uc) =>
        uc.chat.totalMessages != null &&
        uc.messagesRead != null &&
        uc.chat.totalMessages > uc.messagesRead
    )
    .map((uc) => {
      return {
        chatId: uc.chatId,
        unreadMessages: uc.chat.totalMessages - uc.messagesRead,
      };
    });

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
