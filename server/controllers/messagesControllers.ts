// controllers/messagesController.ts
import type { Request, Response } from "express";
import { loadMessages, type Message } from "../utils/messagesUtils.js";
import { loadUsers } from "../utils/authUtils.js";

export function getConversations(req: Request, res: Response) {
  try {
    const sender = (req as any).user?.username;
    if (!sender) return res.status(401).json({ message: "Unauthorized" });

    const messages = loadMessages() || [];
    const users = loadUsers() || [];

    const conversationsMap: Record<string, any[]> = {};
    //
    // group messages with sender
    for (const msg of messages) {
      if (msg.sender === sender || msg.receiver === sender) {
        const other = msg.sender === sender ? msg.receiver : msg.sender;
        if (!conversationsMap[other]) conversationsMap[other] = [];
        conversationsMap[other].push(msg);
      }
    }

    // now add all users (friends) even with 0 messages
    const conversations = users
      .filter((u: User) => u.username !== sender)
      .map((u: User) => {
        const msgs = conversationsMap[u.username] || [];
        const sorted = msgs.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        return {
          username: u.username,
          name: u.name,
          lastMessage: sorted[0]?.content || null,
          lastMessageTime: sorted[0]?.createdAt || null,
        };
      });

    res.json(conversations);
  } catch (err) {
    console.error("getConversations error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export function getMessages(req: Request, res: Response) {
  try {
    const sender = (req as any).user?.username;
    if (!sender) return res.status(401).json({ message: "Unauthorized" });

    const friendUsername = req.params.username;
    if (!friendUsername)
      return res.status(400).json({ message: "Missing friend username" });

    const messages: Message[] = loadMessages() || [];

    const chat = messages
      .filter(
        (msg) =>
          (msg.sender === sender && msg.receiver === friendUsername) ||
          (msg.sender === friendUsername && msg.receiver === sender)
      )
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

    res.json(chat);
  } catch (err) {
    console.error("getMessages error:", err);
    res.status(500).json({ message: "Server error" });
  }
}
