import type { Request, Response } from "express";
import { loadUsers, saveUser } from "../utils/authUtils.js";
import type { User } from "../types/types.js";

export function findFriends(req: Request, res: Response) {
  const users: User[] = loadUsers();
  const currentUsername = req.user.username;
  const query = (req.query.query as string)?.toLowerCase().trim() || "";

  if (!query) {
    return res.json([]);
  }

  const currentUser = users.find((u) => u.username === currentUsername);

  const tokens = query.split(/\s+/);

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

  sender.requestsSent = sender.requestsSent || [];
  receiver.requestsReceived = receiver.requestsReceived || [];

  if (!sender.requestsSent.includes(receiverUsername)) {
    sender.requestsSent.push(receiverUsername);
  }
  if (!receiver.requestsReceived.includes(senderUsername)) {
    receiver.requestsReceived.push(senderUsername);
  }

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

export function getRequests(req: any, res: Response) {
  const users: User[] = loadUsers();
  const username = req.user?.username; // get from verifyToken middleware
  const type = req.query.type as string;

  if (!username) return res.status(401).json({ error: "Unauthorized" });
  if (!type) return res.status(400).json({ error: "Missing type parameter" });

  const user = users.find((u) => u.username === username);
  if (!user) return res.status(404).json({ error: "User not found" });

  let list: string[] = [];
  if (type === "received") list = user.requestsReceived || [];
  if (type === "sent") list = user.requestsSent || [];

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

export function listFriends(req: any, res: Response) {
  const users: User[] = loadUsers();
  const username = req.user?.username; // from verifyToken middleware

  if (!username) return res.status(401).json({ message: "Unauthorized" });

  const user = users.find((u) => u.username === username);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const friends = users
    .filter((u) => user.friends.includes(u.username))
    .map((u) => ({
      username: u.username,
      name: u.name,
      surname: u.surname,
    }));

  res.json(friends);
}

export function deleteFriend(req: Request, res: Response) {
  const users: User[] = loadUsers();
  const { username, friendUsername } = req.body;

  const user = users.find((u) => u.username === username);
  const friend = users.find((u) => u.username === friendUsername);

  if (!user || !friend) {
    return res.status(400).json({ error: "Invalid users" });
  }

  // remove from both users' friends lists
  user.friends = user.friends?.filter((u) => u !== friendUsername) || [];
  friend.friends = friend.friends?.filter((u) => u !== username) || [];

  saveUser(users);

  res.json({ message: "Friend deleted" });
}
