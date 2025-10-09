import type { Request, Response } from "express";
import prisma from "../prisma.js";

/**
 * Get all conversations (latest message + usernames)
 */
export async function getConversations(req: Request, res: Response) {
  try {
    const currentUsername = (req as any).user?.username;
    if (!currentUsername)
      return res.status(401).json({ message: "Unauthorized" });

    const currentUser = await prisma.user.findUnique({
      where: { username: currentUsername },
    });
    if (!currentUser)
      return res.status(404).json({ message: "User not found" });

    // Find all chats where this user participates
    const chats = await prisma.chat.findMany({
      where: {
        OR: [
          { participant1Id: currentUser.id },
          { participant2Id: currentUser.id },
        ],
      },
      include: {
        messages: {
          orderBy: { sentAt: "desc" },
          take: 1, // latest message
        },
      },
      orderBy: { id: "desc" },
    });

    // Format response with friend username + last message
    const formatted = await Promise.all(
      chats.map(async (chat) => {
        const friendId =
          chat.participant1Id === currentUser.id
            ? chat.participant2Id
            : chat.participant1Id;

        const friend = await prisma.user.findUnique({
          where: { id: friendId },
          select: { username: true, name: true },
        });

        return {
          chatId: chat.id,
          friendUsername: friend?.username,
          friendName: friend?.name,
          lastMessage: chat.messages[0] || null,
        };
      })
    );

    res.status(200).json(formatted);
  } catch (err) {
    console.error("getConversations error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * Add a new private message and ensure chat exists
 */
export async function addMessage(
  sender: string,
  receiver: string,
  content: string
) {
  try {
    const senderUser = await prisma.user.findUnique({
      where: { username: sender },
    });
    const receiverUser = await prisma.user.findUnique({
      where: { username: receiver },
    });
    if (!senderUser || !receiverUser) throw new Error("User not found");

    // Find existing chat (in any direction)
    let chat = await prisma.chat.findFirst({
      where: {
        OR: [
          { participant1Id: senderUser.id, participant2Id: receiverUser.id },
          { participant1Id: receiverUser.id, participant2Id: senderUser.id },
        ],
      },
    });

    // Create chat if doesn't exist
    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          participant1Id: senderUser.id,
          participant2Id: receiverUser.id,
        },
      });
    }

    // Add new message
    const newMessage = await prisma.message.create({
      data: {
        chatId: chat.id,
        content,
        senderId: sender,
        receiverId: receiver,
      },
    });

    return newMessage;
  } catch (err) {
    console.error("addMessage error:", err);
    return null;
  }
}

/**
 * Get all messages between current user and a friend
 */
export async function getMessages(req: Request, res: Response) {
  try {
    const senderUsername = (req as any).user?.username;
    if (!senderUsername)
      return res.status(401).json({ message: "Unauthorized" });

    const friendUsername = req.params.username;
    if (!friendUsername)
      return res.status(400).json({ message: "Missing friend username" });

    const senderUser = await prisma.user.findUnique({
      where: { username: senderUsername },
    });
    const friendUser = await prisma.user.findUnique({
      where: { username: friendUsername },
    });

    if (!senderUser || !friendUser)
      return res.status(404).json({ message: "User not found" });

    // Find the chat between them
    const chat = await prisma.chat.findFirst({
      where: {
        OR: [
          { participant1Id: senderUser.id, participant2Id: friendUser.id },
          { participant1Id: friendUser.id, participant2Id: senderUser.id },
        ],
      },
    });

    if (!chat) return res.status(200).json([]); // no chat yet

    // Get all messages in that chat
    const messages = await prisma.message.findMany({
      where: { chatId: chat.id },
      orderBy: { sentAt: "asc" },
    });

    res.status(200).json(messages);
  } catch (err) {
    console.error("getMessages error:", err);
    res.status(500).json({ message: "Server error" });
  }
}
