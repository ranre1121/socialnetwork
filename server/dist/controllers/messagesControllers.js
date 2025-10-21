import prisma from "../prisma.js";
export async function getConversations(req, res) {
    try {
        const currentUsername = req.user?.username;
        if (!currentUsername)
            return res.status(401).json({ message: "Unauthorized" });
        const currentUser = await prisma.user.findUnique({
            where: { username: currentUsername },
        });
        if (!currentUser)
            return res.status(404).json({ message: "User not found" });
        const conversations = await prisma.chat.findMany({
            where: {
                OR: [
                    { participant1Id: currentUser.id },
                    { participant2Id: currentUser.id },
                ],
            },
            include: {
                participant1: { select: { username: true, name: true } },
                participant2: { select: { username: true, name: true } },
                messages: true,
            },
        });
        res.status(200).json(conversations);
    }
    catch (err) {
        console.error("getConversations error:", err);
        res.status(500).json({ message: "Server error" });
    }
}
export async function addMessage(sender, receiver, content) {
    try {
        const senderUser = await prisma.user.findUnique({
            where: { username: sender },
        });
        const receiverUser = await prisma.user.findUnique({
            where: { username: receiver },
        });
        if (!senderUser || !receiverUser)
            throw new Error("User not found");
        let chat = await prisma.chat.findFirst({
            where: {
                OR: [
                    { participant1Id: senderUser.id, participant2Id: receiverUser.id },
                    { participant1Id: receiverUser.id, participant2Id: senderUser.id },
                ],
            },
        });
        if (!chat) {
            chat = await prisma.chat.create({
                data: {
                    participant1Id: senderUser.id,
                    participant2Id: receiverUser.id,
                },
            });
        }
        const newMessage = await prisma.message.create({
            data: {
                chatId: chat.id,
                content,
                senderId: senderUser.id,
                receiverId: receiverUser.id,
            },
            include: {
                sender: { select: { username: true } },
                receiver: { select: { username: true } },
            },
        });
        return {
            id: newMessage.id,
            chatId: newMessage.chatId,
            content: newMessage.content,
            senderId: newMessage.senderId,
            receiverId: newMessage.receiverId,
            sentAt: newMessage.sentAt,
            senderUsername: newMessage.sender.username,
            receiverUsername: newMessage.receiver.username,
        };
    }
    catch (err) {
        console.error("addMessage error:", err);
        return null;
    }
}
export async function getMessages(req, res) {
    try {
        const senderUsername = req.user?.username;
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
        const chat = await prisma.chat.findFirst({
            where: {
                OR: [
                    { participant1Id: senderUser.id, participant2Id: friendUser.id },
                    { participant1Id: friendUser.id, participant2Id: senderUser.id },
                ],
            },
        });
        if (!chat)
            return res.status(200).json([]);
        const messages = await prisma.message.findMany({
            where: { chatId: chat.id },
            orderBy: { sentAt: "asc" },
        });
        const updatedMessages = messages.map((message) => ({
            ...message,
            status: senderUser.id === message.senderId ? "sent" : "received",
        }));
        res.status(200).json(updatedMessages);
    }
    catch (err) {
        console.error("getMessages error:", err);
        res.status(500).json({ message: "Server error" });
    }
}
//# sourceMappingURL=messagesControllers.js.map