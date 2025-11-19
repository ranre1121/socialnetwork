import type { Request, Response } from "express";
import prisma from "../prisma.js";

export async function getConversations(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ msg: "Unauthorized" });

    const currentUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!currentUser) return res.status(404).json({ msg: "User not found" });

    const chats = await prisma.chat.findMany({
      where: {
        OR: [{ participant1Id: userId }, { participant2Id: userId }],
      },
      include: {
        participant1: {
          select: { username: true, name: true, profilePicture: true },
        },
        participant2: {
          select: { username: true, name: true, profilePicture: true },
        },
        lastMessage: true,
        userReads: { where: { userId } },
        messages: { orderBy: { sentAt: "asc" } },
      },
      orderBy: { lastMessageId: "desc" },
    });

    const conversations = chats.map((chat) => {
      const companion =
        chat.participant1Id === userId ? chat.participant2 : chat.participant1;

      const totalRead = chat.userReads[0]?.messagesRead ?? 0;
      const totalMessages = chat.totalMessages ?? 0;

      return {
        id: chat.id,
        companion,
        unreadMessages: Math.max(totalMessages - totalRead, 0),
        lastMessage: chat.lastMessage,
        messages: chat.messages,
        createdAt: chat.createdAt,
      };
    });

    return res.status(200).json(conversations);
  } catch (err) {
    console.error("getConversations error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function addMessage(message: any) {
  try {
    const senderUser = await prisma.user.findUnique({
      where: { username: message.senderUsername },
    });

    const receiverUser = await prisma.user.findUnique({
      where: { username: message.receiverUsername },
    });

    if (!senderUser || !receiverUser) return "No user found";

    let chat = await prisma.chat.findFirst({
      where: {
        OR: [
          { participant1Id: senderUser.id, participant2Id: receiverUser.id },
          { participant1Id: receiverUser.id, participant2Id: senderUser.id },
        ],
      },
    });

    if (!chat) return "No chat found";

    const newMessage = await prisma.message.create({
      data: {
        senderId: senderUser.id,
        receiverId: receiverUser.id,
        content: message.content,
        chatId: chat.id,
        tempId: message.tempId,
        countId: chat.totalMessages + 1,
      },
      include: {
        sender: { select: { username: true } },
        receiver: { select: { username: true } },
      },
    });

    const updatedChat = await prisma.chat.update({
      where: { id: chat.id },
      data: {
        lastMessage: { connect: { id: newMessage.id } },
        totalMessages: newMessage.countId,
      },
    });

    await prisma.userChatRead.upsert({
      where: { userId_chatId: { userId: senderUser.id, chatId: chat.id } },
      update: { messagesRead: updatedChat.totalMessages },
      create: {
        userId: senderUser.id,
        chatId: chat.id,
        messagesRead: 0,
      },
    });

    return newMessage;
  } catch (err) {
    console.error("addMessage error:", err);
    return null;
  }
}

export async function getMessages(req: Request, res: Response) {
  try {
    const id = req.user?.id;
    const companionUsername = req.params.username;
    const { before, limit = 20 } = req.query;

    if (!id || !companionUsername)
      return res.status(400).json({ msg: "Missing usernames" });

    const [user, companion] = await Promise.all([
      prisma.user.findUnique({ where: { id } }),
      prisma.user.findUnique({ where: { username: companionUsername } }),
    ]);

    if (!user || !companion)
      return res.status(404).json({ msg: "User not found" });

    const chat = await prisma.chat.findFirst({
      where: {
        OR: [
          { participant1Id: user.id, participant2Id: companion.id },
          { participant1Id: companion.id, participant2Id: user.id },
        ],
      },
    });

    if (!chat) return res.status(404).json({ msg: "Chat not found" });

    const where: any = { chatId: chat.id };
    if (before) {
      where.sentAt = { lt: new Date(before as string) };
    }

    const messages = await prisma.message.findMany({
      where,
      orderBy: { sentAt: "desc" },
      take: Number(limit),
    });

    const chatRecord = await prisma.userChatRead.findUnique({
      where: { userId_chatId: { userId: user.id, chatId: chat.id } },
    });

    const companionChatRecord = await prisma.userChatRead.findUnique({
      where: { userId_chatId: { userId: companion.id, chatId: chat.id } },
    });

    const formattedMessages = messages.map((m) => ({
      ...m,
      status: m.senderId === user.id ? "sent" : "received",
    }));

    const formatted = {
      lastReadId: chatRecord?.messagesRead || 0,
      companionLastReadId: companionChatRecord?.messagesRead || 0,
      messages: formattedMessages,
    };

    res.status(200).json(formatted);
  } catch (err) {
    console.error("getMessages error:", err);
    res.status(500).json({ message: "Server error" });
  }
}
