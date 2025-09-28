import type { Request, Response } from "express";
import { loadUsers } from "../utils/authUtils.js";
import type { User } from "../types/types.js";

export function findFriends(req: Request, res: Response) {
  const users: User[] = loadUsers();
  const query = (req.body.query as string)?.toLowerCase() || "";

  if (!query.trim()) {
    return res.json([]);
  }

  const matches = users
    .map((u) => {
      const name = u.name.toLowerCase();
      const surname = u.surname?.toLowerCase() || "";
      const username = u.username.toLowerCase();

      let score = 0;

      // startsWith gets higher priority
      if (name.startsWith(query)) score += 2;
      if (surname.startsWith(query)) score += 2;
      if (username.startsWith(query)) score += 3;

      // includes gets lower priority
      if (name.includes(query)) score += 1;
      if (surname.includes(query)) score += 1;
      if (username.includes(query)) score += 2;
      return { name: u.name, surname: u.surname, username: u.username, score };
    })
    .filter((u) => u.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  res.json(matches);
}

export function addRequest(req: Request, res: Response) {
  const users: User[] = loadUsers();
}
