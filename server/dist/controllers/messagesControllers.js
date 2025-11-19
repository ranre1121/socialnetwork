import prisma from "../prisma.js";
export async function getConversations(req, res) {
    try {
        const id = req.user?.id;
        if (!id)
            return res.status(200).json({ msg: "no username provided" });
        const currentUser = await prisma.user.findUnique({
            where: { id },
        });
        if (!currentUser)
            return res.status(200).json({ msg: "user was not found" });
        const c = await prisma.chat.findMany({
            where: {
                OR: [
                    { participant1Id: currentUser?.id },
                    { participant2Id: currentUser.id },
                ],
            },
            include: {
                participant1: {
                    select: { username: true, name: true, profilePicture: true },
                },
                participant2: {
                    select: { username: true, name: true, profilePicture: true },
                },
                lastMessage: true,
            },
        });
        console.log(c);
        const conversations = c.map((c) => ({
            ...c,
            companion: c.participant1Id === currentUser.id ? c.participant2 : c.participant1,
        }));
        return res.status(200).json(conversations);
    }
    catch (err) {
        console.error("getConversations error:", err);
        res.status(500).json({ message: "Server error" });
    }
}
export async function addMessage(message) {
    try {
        const senderUser = await prisma.user.findUnique({
            where: { username: message.senderUsername },
        });
        const receiverUser = await prisma.user.findUnique({
            where: { username: message.receiverUsername },
        });
        if (!senderUser || !receiverUser)
            return "No user found";
        let chat = await prisma.chat.findFirst({
            where: {
                OR: [
                    { participant1Id: senderUser.id, participant2Id: receiverUser.id },
                    { participant1Id: receiverUser.id, participant2Id: senderUser.id },
                ],
            },
        });
        if (!chat)
            return "No chat found";
        const newMessage = await prisma.message.create({
            data: {
                senderId: senderUser.id,
                receiverId: receiverUser.id,
                content: message.content,
                chatId: chat.id,
                tempId: message.tempId,
            },
            include: {
                sender: { select: { username: true } },
                receiver: { select: { username: true } },
            },
        });
        await prisma.chat.update({
            where: { id: chat.id },
            data: { lastMessage: { connect: { id: newMessage.id } } },
        });
        await prisma.userChatRead.upsert({
            where: { userId_chatId: { userId: senderUser.id, chatId: chat.id } },
            update: { lastReadMessageId: newMessage.id },
            create: {
                userId: senderUser.id,
                chatId: chat.id,
                lastReadMessageId: newMessage.id,
            },
        });
        return newMessage;
    }
    catch (err) {
        console.error("addMessage error:", err);
        return null;
    }
}
export async function getMessages(req, res) {
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
        if (!chat)
            return res.status(404).json({ msg: "Chat not found" });
        const where = { chatId: chat.id };
        if (before) {
            where.sentAt = { lt: new Date(before) };
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
            lastReadId: chatRecord?.lastReadMessageId || 0,
            companionLastReadId: companionChatRecord?.lastReadMessageId || 0,
            messages: formattedMessages,
        };
        res.status(200).json(formatted);
    }
    catch (err) {
        console.error("getMessages error:", err);
        res.status(500).json({ message: "Server error" });
    }
}
//# sourceMappingURL=messagesControllers.js.map