import prisma from "../prisma.js";
export function getConversations(req, res) {
    try {
        const currentUser = req.user?.username;
        if (!currentUser)
            return res.status(401).json({ message: "Unauthorized" });
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
                senderId: sender,
                receiverId: receiver,
            },
        });
        return newMessage;
    }
    catch (err) {
        console.error("addMessage error:", err);
        return null;
    }
}
export function getMessages(req, res) {
    try {
        const sender = req.user?.username;
        if (!sender)
            return res.status(401).json({ message: "Unauthorized" });
        const friendUsername = req.params.username;
        if (!friendUsername)
            return res.status(400).json({ message: "Missing friend username" });
    }
    catch (err) {
        console.error("getMessages error:", err);
        res.status(500).json({ message: "Server error" });
    }
}
//# sourceMappingURL=messagesControllers.js.map