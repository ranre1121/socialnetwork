import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { loadUsers, saveUser } from "../utils/authUtils.js";
import type { User } from "../types/types.js";

export function registerUser(req: Request, res: Response) {
  const users = loadUsers();
  const { username, password } = req.body;

  if (users.find((u: User) => u.username === username)) {
    return res.status(400).json({ msg: "Username is taken" });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser: User = { username, password: hashedPassword };

  users.push(newUser);
  saveUser(users);
  res.status(200).json(newUser);
}
