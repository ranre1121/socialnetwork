import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import prisma from "../prisma.js";
import { verifyToken } from "../middlewares/authMiddlewares.js";

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

    const token = jwt.sign(
      { username: user.username },
      process.env.JWT_SECRET as string,
      { expiresIn: "10s" }
    );

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        bio: user.bio,
        profilePicture: user.profilePicture,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
}

export async function userContext(req: Request, res: Response) {
  const user = await prisma.user.findUnique({
    where: { username: req.user?.username as string },
  });

  return res.status(200).json({
    userId: user?.id,
    username: user?.username,
    profilePicture: user?.profilePicture,
    name: user?.name,
    success: true,
  });
}
