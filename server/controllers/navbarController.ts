import type { Request, Response } from "express";
import prisma from "../prisma.js";

export async function getUsername(req: Request, res: Response) {
  const username = req.user?.username;

  if (!username) return res.status(400).json({ msg: "Not Authorized" });

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return res.status(400).json({ msg: "User not found" });

  res
    .status(200)
    .json({
      username: user.username,
      name: user.name,
      profilePicture: user.profilePicture,
    });
}
