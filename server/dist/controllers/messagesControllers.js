import prisma from "../prisma.js";
export async function getConversations(req, res) {
    try {
        const currentUsername = req.user?.username;
        if (!currentUsername)
            return res.status(200).json({ msg: "no username provided" });
        const currentUser = await prisma.user.findUnique({
            where: { username: currentUsername },
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
                participant1: { select: { username: true, name: true } },
                participant2: { select: { username: true, name: true } },
            },
        });
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
export async function addMessage(sender, receiver, content) {
    try {
        const senderUser = await prisma.user.findUnique({
            where: { username: sender },
        });
        const receiverUser = await prisma.user.findUnique({
            where: { username: receiver },
        });
        if (!senderUser || !receiverUser)
            return "No user found";
        const chat = await prisma.chat.findFirst({
            where: {
                OR: [
                    { participant1Id: senderUser.id, participant2Id: receiverUser.id },
                    { participant1Id: receiverUser.id, participant2Id: senderUser.id },
                ],
            },
        });
        if (!chat)
            return "no chat found";
        const newMessage = await prisma.message.create({
            data: {
                senderId: senderUser.id,
                receiverId: receiverUser.id,
                content,
                chatId: chat.id,
            },
        });
        const message = {
            sender: senderUser.username,
            receiver: receiverUser.username,
            content,
            sentAt: newMessage.sentAt,
        };
        return message;
    }
    catch (err) {
        console.error("addMessage error:", err);
        return null;
    }
}
export async function getMessages(req, res) {
    try {
        const currentUsername = req.user?.username;
        if (!currentUsername)
            return res.status(200).json({ msg: "User not found" });
        const user = await prisma.user.findUnique({
            where: { username: currentUsername },
        });
        if (!user)
            return res.status(200).json({ msg: "User was not found" });
        const companionUsername = req.params.username;
        if (!companionUsername)
            return res.status(200).json({ msg: "No companion username provided" });
        const companion = await prisma.user.findUnique({
            where: { username: companionUsername },
        });
        if (!companion)
            return res.status(200).json({ msg: "No companion user found" });
        const chat = await prisma.chat.findFirst({
            where: {
                OR: [
                    { participant1Id: companion.id, participant2Id: user.id },
                    { participant1Id: user.id, participant2Id: companion.id },
                ],
            },
        });
        if (!chat)
            return res.status(200).json({ msg: "Chat was not found" });
        const messages = await prisma.message.findMany({
            where: { chatId: chat.id },
        });
        const updatedMessages = messages.map((m) => ({
            ...m,
            status: m.senderId === user.id ? "sent" : "received",
        }));
        if (!chat)
            return "no chat found";
        res.status(200).json(updatedMessages);
    }
    catch (err) {
        console.error("getMessages error:", err);
        res.status(500).json({ message: "Server error" });
    }
}
//# sourceMappingURL=messagesControllers.js.map