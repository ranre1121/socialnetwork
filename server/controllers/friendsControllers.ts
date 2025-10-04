import type { Request, Response } from "express";
import prisma from "../prisma.js";

export async function findFriends(req: Request, res: Response) {
  try {
    //@ts-ignore
    const currentUsername = req.user.username;
    const query = (req.query.query as string)?.toLowerCase().trim() || "";

    if (!query) return res.json([]);

    const currentUser = await prisma.user.findUnique({
      where: { username: currentUsername },
    });

    if (!currentUser)
      return res.status(404).json({ message: "User not found" });

    const userId = currentUser.id;

    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ requesterId: userId }, { addresseeId: userId }],
      },
    });

    const friendsIds = friendships
      .filter((f) => f.status === "ACCEPTED")
      .map((f) => (f.requesterId === userId ? f.addresseeId : f.requesterId));

    const requestsSentIds = friendships
      .filter((f) => f.status === "PENDING" && f.requesterId === userId)
      .map((f) => f.addresseeId);

    const requestsReceivedIds = friendships
      .filter((f) => f.status === "PENDING" && f.addresseeId === userId)
      .map((f) => f.requesterId);

    const users = await prisma.user.findMany({
      where: {
        id: { notIn: [userId, ...friendsIds] },
      },
    });

    const tokens = query.split(/\s+/);

    const matches = users
      .map((user) => {
        const name = user.name.toLowerCase();
        const username = user.username.toLowerCase();
        let score = 0;

        for (const token of tokens) {
          if (name.startsWith(token)) score += 2;
          if (username.startsWith(token)) score += 3;
          if (name.includes(token)) score += 1;
          if (username.includes(token)) score += 2;
        }

        return {
          name: user.name,
          username: user.username,
          score,
          alreadySent: requestsSentIds.includes(user.id),
          alreadyReceived: requestsReceivedIds.includes(user.id),
        };
      })
      .filter((u) => u.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return res.json(matches);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function addRequest(req: Request, res: Response) {
  //@ts-ignore
  const senderUsername = req.user.username;
  const { receiverUsername } = req.body;

  //sender
  const sender = await prisma.user.findUnique({
    where: { username: senderUsername },
  });
  if (!sender) {
    return res.status(400).json({ msg: "User not found" });
  }
  const senderId = sender.id;

  //receiver
  const receiver = await prisma.user.findUnique({
    where: { username: receiverUsername },
  });
  if (!receiver) {
    return res.status(400).json({ error: "User not found" });
  }
  const receiverId = receiver.id;

  //creating friendship
  const newFriendship = await prisma.friendship.create({
    data: { requesterId: senderId, addresseeId: receiverId },
  });
}

// ❌ Cancel request
export function cancelRequest(req: Request, res: Response) {
  const friends: Friend[] = loadFriends();
  const { senderUsername, receiverUsername } = req.body;

  const sender = friends.find((f) => f.username === senderUsername);
  const receiver = friends.find((f) => f.username === receiverUsername);

  if (!sender || !receiver) {
    return res.status(400).json({ error: "Invalid users" });
  }

  sender.requestsSent = sender.requestsSent.filter(
    (u) => u !== receiverUsername
  );
  receiver.requestsReceived = receiver.requestsReceived.filter(
    (u) => u !== senderUsername
  );

  saveFriends(friends);
  res.json({ message: "Friend request cancelled" });
}

// 📥 Get requests
export function getRequests(req: any, res: Response) {
  const users: User[] = loadUsers();
  const friends: Friend[] = loadFriends();
  const username = req.user?.username;
  const type = req.query.type as string;

  if (!username) return res.status(401).json({ error: "Unauthorized" });
  if (!type) return res.status(400).json({ error: "Missing type parameter" });

  const currentFriend = friends.find((f) => f.username === username);
  if (!currentFriend)
    return res.status(404).json({ error: "Friend data not found" });

  let list: string[] = [];
  if (type === "received") list = currentFriend.requestsReceived || [];
  if (type === "sent") list = currentFriend.requestsSent || [];

  const result = list
    .map((uname) => users.find((u) => u.username === uname))
    .filter(Boolean)
    .map((u) => ({
      username: u!.username,
      name: u!.name,
    }));

  res.json(result);
}

// ✅ Accept request
export function acceptRequest(req: Request, res: Response) {
  const friends: Friend[] = loadFriends();
  const { receiverUsername, senderUsername } = req.body;

  const receiver = friends.find((f) => f.username === receiverUsername);
  const sender = friends.find((f) => f.username === senderUsername);

  if (!receiver || !sender) {
    return res.status(400).json({ error: "Invalid users" });
  }

  receiver.requestsReceived = receiver.requestsReceived.filter(
    (u) => u !== senderUsername
  );
  sender.requestsSent = sender.requestsSent.filter(
    (u) => u !== receiverUsername
  );

  if (!receiver.friends.includes(senderUsername)) {
    receiver.friends.push(senderUsername);
  }
  if (!sender.friends.includes(receiverUsername)) {
    sender.friends.push(receiverUsername);
  }

  saveFriends(friends);
  res.json({ message: "Friend request accepted" });
}

// 🚫 Decline request
export function declineRequest(req: Request, res: Response) {
  const friends: Friend[] = loadFriends();
  const { receiverUsername, senderUsername } = req.body;

  const receiver = friends.find((f) => f.username === receiverUsername);
  const sender = friends.find((f) => f.username === senderUsername);

  if (!receiver || !sender) {
    return res.status(400).json({ error: "Invalid users" });
  }

  receiver.requestsReceived = receiver.requestsReceived.filter(
    (u) => u !== senderUsername
  );
  sender.requestsSent = sender.requestsSent.filter(
    (u) => u !== receiverUsername
  );

  saveFriends(friends);
  res.json({ message: "Friend request declined" });
}

// 📋 List friends
export function listFriends(req: any, res: Response) {
  const users: User[] = loadUsers();
  const friends: Friend[] = loadFriends();
  const username = req.user?.username;

  if (!username) return res.status(401).json({ message: "Unauthorized" });

  const currentFriend = friends.find((f) => f.username === username);
  if (!currentFriend)
    return res.status(404).json({ message: "Friend data not found" });

  const result = currentFriend.friends.map((uname) => {
    const user = users.find((u) => u.username === uname);
    return {
      username: uname,
      name: user?.name || "",
    };
  });

  res.json(result);
}

// 🗑️ Delete friend
export function deleteFriend(req: Request, res: Response) {
  const friends: Friend[] = loadFriends();
  const { username, friendUsername } = req.body;

  const user = friends.find((f) => f.username === username);
  const friend = friends.find((f) => f.username === friendUsername);

  if (!user || !friend) {
    return res.status(400).json({ error: "Invalid users" });
  }

  user.friends = user.friends.filter((u) => u !== friendUsername);
  friend.friends = friend.friends.filter((u) => u !== username);

  saveFriends(friends);
  res.json({ message: "Friend deleted" });
}
