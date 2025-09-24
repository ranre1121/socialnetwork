import type { Request, Response } from "express";
import { loadUsers } from "../utils/authUtils.js";
import type { User } from "../types/types.js";

export function getUsername(req: Request, res: Response) {
  const users = loadUsers();

  const username = users.find(
    (u: User) => u.username === req.user.username
  ).username;
  res.status(200).json({ username });
}
