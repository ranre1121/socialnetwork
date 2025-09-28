import type { Request, Response } from "express";
import { loadUsers, saveUser } from "../utils/authUtils.js";
import type { User } from "../types/types.js";

export function findFriends(req: Request, res: Response) {
  const users: User[] = loadUsers();
  const currentUsername = req.body.currentUser;
  const query = (req.body.query as string)?.toLowerCase().trim() || "";

  if (!query) {
    return res.json([]);
  }

  const currentUser = users.find((u) => u.username === currentUsername);

  const tokens = query.split(/\s+/); // split on spaces (e.g., "john s" → ["john","s"])

  const matches = users
    .filter((u) => {
      if (u.username === currentUsername) return false;
      if (currentUser?.friends.includes(u.username)) return false;
      return true;
    })
    .map((u) => {
      const name = u.name.toLowerCase();
      const surname = u.surname?.toLowerCase() || "";
      const username = u.username.toLowerCase();

      let score = 0;

      for (const token of tokens) {
        if (name.startsWith(token)) score += 2;
        if (surname.startsWith(token)) score += 2;
        if (username.startsWith(token)) score += 3;

        if (name.includes(token)) score += 1;
        if (surname.includes(token)) score += 1;
        if (username.includes(token)) score += 2;
      }

      const alreadySent =
        currentUser?.requestsSent.includes(u.username) ?? false;
      const alreadyReceived =
        currentUser?.requestsReceived.includes(u.username) ?? false;

      return {
        name: u.name,
        surname: u.surname,
        username: u.username,
        score,
        alreadySent,
        alreadyReceived,
      };
    })
    .filter((u) => u.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  res.json(matches);
}

export function addRequest(req: Request, res: Response) {
  const users: User[] = loadUsers();
  const { senderUsername, receiverUsername } = req.body;

  const sender = users.find((u) => u.username === senderUsername);
  const receiver = users.find((u) => u.username === receiverUsername);

  if (!sender || !receiver) {
    return res.status(400).json({ error: "Invalid users" });
  }

  // Make sure arrays exist
  sender.requestsSent = sender.requestsSent || [];
  receiver.requestsReceived = receiver.requestsReceived || [];

  // Avoid duplicates
  if (!sender.requestsSent.includes(receiverUsername)) {
    sender.requestsSent.push(receiverUsername);
  }
  if (!receiver.requestsReceived.includes(senderUsername)) {
    receiver.requestsReceived.push(senderUsername);
  }

  // ✅ Save all users back to file
  saveUser(users);

  res.json({ message: "Friend request sent" });
}

export function cancelRequest(req: Request, res: Response) {
  const users: User[] = loadUsers();
  const { senderUsername, receiverUsername } = req.body;

  const sender = users.find((u) => u.username === senderUsername);
  const receiver = users.find((u) => u.username === receiverUsername);

  if (!sender || !receiver) {
    return res.status(400).json({ error: "Invalid users" });
  }

  sender.requestsSent =
    sender.requestsSent?.filter((u) => u !== receiverUsername) || [];

  receiver.requestsReceived =
    receiver.requestsReceived?.filter((u) => u !== senderUsername) || [];

  saveUser(users);

  res.json({ message: "Friend request cancelled" });
}

export function getRequests(req: Request, res: Response) {
  const users: User[] = loadUsers();
  const { username, type } = req.body; // type = "received" | "sent"

  const user = users.find((u) => u.username === username);
  if (!user) return res.status(404).json({ error: "User not found" });

  let list: string[] = [];
  if (type === "received") list = user.requestsReceived || [];
  if (type === "sent") list = user.requestsSent || [];

  // Return user objects for display
  const result = list
    .map((uname) => users.find((u) => u.username === uname))
    .filter(Boolean)
    .map((u) => ({
      username: u!.username,
      name: u!.name,
      surname: u!.surname,
    }));

  res.json(result);
}

export function acceptRequest(req: Request, res: Response) {
  const users: User[] = loadUsers();
  const { receiverUsername, senderUsername } = req.body;

  const receiver = users.find((u) => u.username === receiverUsername);
  const sender = users.find((u) => u.username === senderUsername);

  if (!receiver || !sender) {
    return res.status(400).json({ error: "Invalid users" });
  }

  // remove from pending
  receiver.requestsReceived =
    receiver.requestsReceived?.filter((u) => u !== senderUsername) || [];
  sender.requestsSent =
    sender.requestsSent?.filter((u) => u !== receiverUsername) || [];

  // add to friends list
  receiver.friends = [...(receiver.friends || []), senderUsername];
  sender.friends = [...(sender.friends || []), receiverUsername];

  saveUser(users);

  res.json({ message: "Friend request accepted" });
}

export function declineRequest(req: Request, res: Response) {
  const users: User[] = loadUsers();
  const { receiverUsername, senderUsername } = req.body;

  const receiver = users.find((u) => u.username === receiverUsername);
  const sender = users.find((u) => u.username === senderUsername);

  if (!receiver || !sender) {
    return res.status(400).json({ error: "Invalid users" });
  }

  receiver.requestsReceived =
    receiver.requestsReceived?.filter((u) => u !== senderUsername) || [];
  sender.requestsSent =
    sender.requestsSent?.filter((u) => u !== receiverUsername) || [];

  saveUser(users);

  res.json({ message: "Friend request declined" });
}
